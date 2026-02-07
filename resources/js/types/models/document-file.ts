export interface DocumentFile {
    id: number;
    filename: string;
    size: number;
    fileurl?: string;
    uploaded_at?: string;
}

export interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status:
        | 'wait upload'
        | 'uploading'
        | 'uploaded'
        | 'error'
        | 'on server'
        | 'deleted';
    uploadedData?: DocumentFile;
}
