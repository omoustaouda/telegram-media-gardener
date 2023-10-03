import TelegramBot, { Message } from 'node-telegram-bot-api'
import fs from 'fs'
import path from 'path'
import { StorageDriver } from '../drivers/StorageDriver'

interface TelegramServiceConfig {
  botToken: string
  incomingFilesPath: string
}

export class TelegramService {
  private readonly bot: TelegramBot
  private readonly incomingFilesPath: string
  private readonly storageDriver: StorageDriver

  constructor(storageDriver: StorageDriver, config: TelegramServiceConfig) {
    this.bot = new TelegramBot(config.botToken, { polling: true })
    this.incomingFilesPath = config.incomingFilesPath
    this.storageDriver = storageDriver
    this.initialize()
  }

  private initialize() {
    if (!fs.existsSync(this.incomingFilesPath)) {
      fs.mkdirSync(this.incomingFilesPath)
    }

    // listen
    this.bot.on('message', this.handleMessage.bind(this))
    console.log('Listening for new messages with media...')
  }

  private handleMessage(msg: Message) {
    const chatId = msg.chat.id
    let fileId: string | undefined
    let originalFilename: string | undefined

    const messageId = msg.message_id ? msg.message_id : 'undefined'
    console.log(`Processing new message... (id: ${messageId})`)

    if (msg.photo) {
      // photos are sorted by size, we get the last for the highest resolution
      const photoIndex = msg.photo.length - 1
      fileId = msg.photo[photoIndex].file_id
    } else if (msg.document) {
      fileId = msg.document.file_id
      originalFilename = msg.document.file_name
    } else if (msg.video) {
      fileId = msg.video.file_id
    } else if (msg.animation) {
      fileId = msg.animation.file_id
    } else if (msg.voice) {
      fileId = msg.voice.file_id
    } else if (msg.audio) {
      fileId = msg.audio.file_id
    } else if (msg.video_note) {
      fileId = msg.video_note.file_id
    } else {
      this.bot.sendMessage(chatId, 'Please send a supported file type.')
      return
    }

    this.downloadAndSaveFile(fileId, originalFilename, chatId)
      .then((newFilePath) => {
        if (newFilePath) {
          // now that the file is saved, we can upload it using the storage driver
          this.storageDriver
            .uploadFile(newFilePath)
            .then(() => {
              this.bot.sendMessage(
                chatId,
                `File uploaded - ${this.storageDriver.constructor.name}: ${newFilePath}`,
              )
            })
            .catch((error) => {
              console.error(
                `Failed to upload the file - ${this.storageDriver.constructor.name}: ${error}`,
              )
            })
        }
      })
      .catch((error) => {
        console.error(
          `Failed to download and save the file from Telegram servers: ${error}`,
        )
      })
  }

  private async downloadAndSaveFile(
    fileId: string,
    originalFilename: string | undefined,
    chatId: number,
  ): Promise<string | undefined> {
    try {
      const filePath: string = await this.bot.downloadFile(
        fileId,
        this.incomingFilesPath,
      )
      let newFilePath = path.join(
        this.incomingFilesPath,
        fileId + path.extname(filePath),
      )

      if (originalFilename) {
        newFilePath = path.join(this.incomingFilesPath, originalFilename)
      }

      fs.renameSync(filePath, newFilePath)

      console.log(`File saved to: ${newFilePath}`)
      await this.bot.sendMessage(
        chatId,
        `File saved locally at: ${newFilePath}`,
      )

      return newFilePath
    } catch (error) {
      console.error(`Failed to download and save the file: ${error}`)
    }
  }
}
