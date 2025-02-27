/* eslint-disable @typescript-eslint/naming-convention */
import { MongoClient } from 'mongodb';
import type { Collection } from 'mongodb';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// cache connection so only one copy is used
export class MongoDB {
  private static instance: MongoDB;
  private client: MongoClient;

  private constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  public static getInstance(uri: string): MongoDB {
    if (!MongoDB.instance) MongoDB.instance = new MongoDB(uri);

    return MongoDB.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.db().command({ ping: 1 });
      // Ping was successful
    } catch (error) {
      // An error occurred while pinging the database
      await this.client.connect();
    }
  }

  public getClient(): MongoClient {
    return this.client;
  }

  public getCollection(name: string): Collection {
    return this.client.db().collection(name);
  }
}

export function validateToken(token: string, secretKey: string, authEmail: string): boolean {
  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    if (authEmail !== decoded.email) return false;
    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
}

export interface UserProfile {
  role: Record<string, boolean>;
}

export function ensureRoles(user: UserProfile, roles: string[]): boolean {
  for (const role of roles) if (user[role]) return true;

  return false;
}

export async function checkIfFileExists(bucketName: string, objectKey: string): Promise<boolean> {
  try {
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };
    const s3 = new S3Client();
    const command = new HeadObjectCommand(params);
    await s3.send(command);
    return true;
  } catch (error) {
    if (error.code === 'NotFound') return false;
  }
  return false;
}

export async function generatePresignedUrl(bucketName: string, objectKey: string): Promise<string> {
  const s3 = new S3Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: 'application/pdf', // specify the content type
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}
