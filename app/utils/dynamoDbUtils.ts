import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Entry } from '../types/Entry';
import { v4 as uuidv4 } from 'uuid';

const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
};

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client(awsConfig);

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
        const formData = new FormData();
        formData.append('video', entry.video);
        formData.append('thumbnail', entry.thumbnail);
        formData.append('title', entry.title);
        formData.append('danceStyle', entry.danceStyle);
        formData.append('level', entry.level);
        formData.append('tags', JSON.stringify(entry.tags));
        formData.append('fileSize', entry.fileSize?.toString() || '');

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }


    } catch (error) {
        console.error("Error in uploadEntryWithVideo:", error);
        if (error instanceof Error) {
            throw new DynamoDBError(`Failed to upload entry: ${error.name} - ${error.message}`);
        } else {
            throw new DynamoDBError("Failed to upload entry: Unknown error");
        }
    }
}
