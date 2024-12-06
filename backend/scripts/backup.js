const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/:/g, '-');
const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.gz`);

const command = `mongodump --db university_cafe --archive=${backupFile} --gzip`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup error: ${error}`);
    return;
  }
  console.log(`Backup created successfully: ${backupFile}`);
});

