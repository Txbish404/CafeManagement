const { MongoClient } = require('mongodb');
const { S3 } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const path = require('path');

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class BackupService {
  constructor() {
    this.backupPath = path.join(__dirname, '../backups');
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(this.backupPath, filename);

    try {
      // Connect to MongoDB and get all collections
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db();
      const collections = await db.listCollections().toArray();

      const backup = {};
      for (const collection of collections) {
        const data = await db.collection(collection.name).find({}).toArray();
        backup[collection.name] = data;
      }

      // Save backup locally
      await fs.mkdir(this.backupPath, { recursive: true });
      await fs.writeFile(filepath, JSON.stringify(backup, null, 2));

      // Upload to S3
      await s3.putObject({
        Bucket: process.env.AWS_BACKUP_BUCKET,
        Key: filename,
        Body: JSON.stringify(backup),
      });

      await client.close();
      return { success: true, filename };
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  async restoreBackup(filename) {
    try {
      // Get backup from S3
      const response = await s3.getObject({
        Bucket: process.env.AWS_BACKUP_BUCKET,
        Key: filename,
      });

      const backup = JSON.parse(await response.Body.transformToString());

      // Restore to MongoDB
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db();

      for (const [collectionName, data] of Object.entries(backup)) {
        if (data.length > 0) {
          await db.collection(collectionName).deleteMany({});
          await db.collection(collectionName).insertMany(data);
        }
      }

      await client.close();
      return { success: true, message: 'Backup restored successfully' };
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }
}

module.exports = new BackupService();
