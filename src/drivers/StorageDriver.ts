export interface StorageDriver {
    uploadFile(filePath: string): Promise<void>;
}
