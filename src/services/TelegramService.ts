import TelegramBot, { Message } from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';

interface TelegramServiceConfig {
    bot_token: string;
    incoming_files_dir: string;
}

export class TelegramService {
    private bot: TelegramBot;
    private readonly dir: string;

    constructor(config: TelegramServiceConfig) {
        this.bot = new TelegramBot(config.bot_token, { polling: true });
        this.dir = config.incoming_files_dir;
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
        let file_id: string | undefined;
        let originalFilename: string | undefined;

        if (msg.photo) {
            file_id = msg.photo[msg.photo.length - 1].file_id;
        } else if (msg.document) {
            file_id = msg.document.file_id;
            originalFilename = msg.document.file_name;
        } else if (msg.video) {
            file_id = msg.video.file_id;
        } else if (msg.animation) {
            file_id = msg.animation.file_id;
        } else if (msg.voice) {
            file_id = msg.voice.file_id;
        } else if (msg.audio) {
            file_id = msg.audio.file_id;
        } else if (msg.video_note) {
            file_id = msg.video_note.file_id;
        } else {
            this.bot.sendMessage(chatId, 'Please send a supported file type.');
            return;
        }

        this.downloadAndSaveFile(file_id, originalFilename, chatId);
    }

    private async downloadAndSaveFile(file_id: string, originalFilename: string | undefined, chatId: number) {
        try {
            const filePath: string = await this.bot.downloadFile(file_id, this.dir);
            let newFilePath = path.join(this.dir, file_id + path.extname(filePath));

            if (originalFilename) {
                newFilePath = path.join(this.dir, originalFilename);
            }

            fs.renameSync(filePath, newFilePath);

            console.log(`File saved to: ${newFilePath}`);
            this.bot.sendMessage(chatId, `File saved locally at: ${newFilePath}`);
        } catch (error) {
            console.error(`Failed to download and save the file: ${error}`);
        }
    }
}
