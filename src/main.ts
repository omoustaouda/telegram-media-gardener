import Config from './Config'
import { TelegramService } from './services/TelegramService'
import { StorageDriverFactory } from './drivers/StorageDriverFactory'

const storageDriver = StorageDriverFactory.createDriver(
  Config.storage.driverName,
)

// initialize and listen for incoming messages
const telegramService = new TelegramService(storageDriver, Config.telegram)
