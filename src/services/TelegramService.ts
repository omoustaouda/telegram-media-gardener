import TelegramBot, { Message } from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';

interface TelegramServiceConfig {
    botToken: string;
    incomingFilesPath: string;
}

export class TelegramService {
    private bot: TelegramBot;
    private readonly dir: string;

    constructor(config: TelegramServiceConfig) {
        this.bot = new TelegramBot(config.botToken, { polling: true });
        this.dir = config.incomingFilesPath;
        this.initialize();
    }

    private initialize() {
        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir);
        }

        // listen
        this.bot.on('message', this.handleMessage.bind(this));
    }

    private handleMessage(msg: Message) {
        const chatId = msg.chat.id;
        let fileId: string | undefined;
        let originalFilename: string | undefined;

        console.log(msg);

        if (msg.photo) {
            // photos are sorted by size, we get the last for the highest resolution
            const photoIndex = msg.photo.length - 1;
            fileId = msg.photo[photoIndex].file_id;
        } else if (msg.document) {
            fileId = msg.document.file_id;
            originalFilename = msg.document.file_name;
        } else if (msg.video) {
            fileId = msg.video.file_id;
        } else if (msg.animation) {
            fileId = msg.animation.file_id;
        } else if (msg.voice) {
            fileId = msg.voice.file_id;
        } else if (msg.audio) {
            fileId = msg.audio.file_id;
        } else if (msg.video_note) {
            fileId = msg.video_note.file_id;
        } else {
            this.bot.sendMessage(chatId, 'Please send a supported file type.');
            return;
        }

        this.downloadAndSaveFile(fileId, originalFilename, chatId);
    }

    private async downloadAndSaveFile(fileId: string, originalFilename: string | undefined, chatId: number) {
        try {
            const filePath: string = await this.bot.downloadFile(fileId, this.dir);
            let newFilePath = path.join(this.dir, fileId + path.extname(filePath));

            if (originalFilename) {
                newFilePath = path.join(this.dir, originalFilename);
            }

            fs.renameSync(filePath, newFilePath);

            console.log(`File saved to: ${newFilePath}`);
            await this.bot.sendMessage(chatId, `File saved locally at: ${newFilePath}`);
        } catch (error) {
            console.error(`Failed to download and save the file: ${error}`);
        }
    }
}
