import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Entry } from '../types/Entry';
import { v4 as uuidv4 } from 'uuid';
import { awsConfig } from './config';

console.log('AWS Config:', { 
    region: awsConfig.region, 
    accessKeyId: awsConfig.accessKeyId ? 'Set' : 'Not Set',
    secretAccessKey: awsConfig.secretAccessKey ? 'Set' : 'Not Set'
});

const client = new DynamoDBClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: awsConfig.accessKeyId!,
        secretAccessKey: awsConfig.secretAccessKey!
    }
});
const docClient = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client({
    region: awsConfig.region,
    credentials: {
        accessKeyId: awsConfig.accessKeyId!,
        secretAccessKey: awsConfig.secretAccessKey!
    }
});

export class DynamoDBError extends Error {
    code?: string;
    constructor(message: string, code?: string) {
        super(message);
        this.name = 'DynamoDBError';
        this.code = code;
    }
}

export async function uploadEntryWithVideo(entry: Entry) {
    if (typeof entry.video !== 'object' || !(entry.video instanceof File) || 
        typeof entry.thumbnail !== 'object' || !(entry.thumbnail instanceof File)) {
        throw new DynamoDBError('Video and thumbnail must be File objects');
    }

    try {
        // Check if a document with the same title already exists
        const getCommand = new GetCommand({
            TableName: "dance_moves",
            Key: { title: entry.title }
        });
        console.log('Checking for existing entry:', entry.title);
        const existingItem = await docClient.send(getCommand);
        if (existingItem.Item) {
            throw new DynamoDBError(`A dance move with the title "${entry.title}" already exists.`);
        }

        // Upload video to S3
        const videoKey = `videos/${Date.now()}-${entry.video.name}`;
        console.log('Uploading video to S3:', videoKey);
        await s3Client.send(new PutObjectCommand({
            Bucket: "dance-vocabulary-videos",
            Key: videoKey,
            Body: entry.video
        }));

        // Upload thumbnail to S3
        const thumbnailKey = `thumbnails/${Date.now()}-${entry.thumbnail.name}`;
        console.log('Uploading thumbnail to S3:', thumbnailKey);
        await s3Client.send(new PutObjectCommand({
            Bucket: "dance-vocabulary-thumbnails",
            Key: thumbnailKey,
            Body: entry.thumbnail
        }));

        // Create entry in DynamoDB
        const entryData = {
            id: uuidv4(),
            title: entry.title,
            danceStyle: entry.danceStyle,
            level: entry.level,
            tags: entry.tags,
            videoUrl: videoKey,
            thumbnailUrl: thumbnailKey,
            fileSize: entry.fileSize,
            createdAt: new Date().toISOString()
        };

        const putCommand = new PutCommand({
            TableName: "dance_moves",
            Item: entryData,
            ConditionExpression: "attribute_not_exists(title)"
        });

        console.log('Saving entry to DynamoDB:', entryData.title);
        await docClient.send(putCommand);
        console.log('Entry saved successfully');
    } catch (error) {
        console.error("Error in uploadEntryWithVideo:", error);
        if (error instanceof Error) {
            throw new DynamoDBError(`Failed to upload entry: ${error.name} - ${error.message}`);
        } else {
            throw new DynamoDBError("Failed to upload entry: Unknown error");
        }
    }
}
