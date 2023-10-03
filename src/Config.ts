import dotenv from 'dotenv';

dotenv.config();

export default {
  TELEGRAM: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    incomingFilesPath: './storage/incoming_files',
  },
};
