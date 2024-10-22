import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    try {
      const id = uuidv4();
      const video = Array.isArray(files.video) ? files.video[0] : files.video;
      const thumbnail = Array.isArray(files.thumbnail) ? files.thumbnail[0] : files.thumbnail;

      if (!video || !thumbnail) {
        throw new Error('Video or thumbnail is missing');
      }

      const videoKey = `videos/${Date.now()}-${video.originalFilename}`;
      await s3Client.send(new PutObjectCommand({
        Bucket: "dance-vocabulary-videos",
        Key: videoKey,
        Body: fs.createReadStream(video.filepath)
      }));

      const thumbnailKey = `thumbnails/${Date.now()}-${thumbnail.originalFilename}`;
      await s3Client.send(new PutObjectCommand({
        Bucket: "dance-vocabulary-thumbnails",
        Key: thumbnailKey,
        Body: fs.createReadStream(thumbnail.filepath)
      }));

      await docClient.send(new PutCommand({
        TableName: "dance_moves",
        Item: {
          id: id,
          title: fields.title,
          danceStyle: fields.danceStyle,
          level: fields.level,
          tags: Array.isArray(fields.tags) ? fields.tags : JSON.parse(fields.tags as unknown as string),
          videoUrl: videoKey,
          thumbnailUrl: thumbnailKey,
          fileSize: fields.fileSize,
          createdAt: new Date().toISOString()
        }
      }));

      res.status(200).json({ message: 'Upload successful', id: id });
    } catch (error: unknown) {
      console.error('Error in upload:', error);
      res.status(500).json({ error: 'Error uploading files', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
}
