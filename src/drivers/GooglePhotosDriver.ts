import { StorageDriver } from './StorageDriver'

export class GooglePhotosDriver implements StorageDriver {
  async uploadFile(filePath: string): Promise<void> {
    // Implement Google Photos API logic here
    console.log(`Uploading ${filePath}`)
    throw new Error('Something went wrong, test')
  }
}
