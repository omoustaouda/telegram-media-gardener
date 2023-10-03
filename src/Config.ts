import dotenv from 'dotenv'
import { GooglePhotosDriver } from './drivers/GooglePhotosDriver'

dotenv.config()

export default {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    incomingFilesPath: './storage/incoming_files',
  },
  storage: {
    driverName: GooglePhotosDriver.name,
  },
}
