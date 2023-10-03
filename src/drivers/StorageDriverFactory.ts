import { StorageDriver } from './StorageDriver';
import { GooglePhotosDriver } from './GooglePhotosDriver';

export class StorageDriverFactory {
    static createDriver(type: string): StorageDriver {
        switch (type) {
            case GooglePhotosDriver.name:
                return new GooglePhotosDriver();
            default:
                throw new Error('Invalid driver type: ' + type);
        }
    }
}
