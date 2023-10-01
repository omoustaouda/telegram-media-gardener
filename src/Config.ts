import dotenv from 'dotenv';

dotenv.config();

export default {
  TELEGRAM: {
    bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
    incoming_files_dir: '../storage/incoming_files',
    // ... any other Telegram-specific configs
  },
  // ... other configs like Google Photos, Dropbox, etc.
};
