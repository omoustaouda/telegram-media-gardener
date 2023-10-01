import Config from './Config';
import { TelegramService } from './services/TelegramService';

// initialize and listen for incoming messages
const telegramService = new TelegramService(Config.TELEGRAM);
