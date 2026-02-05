export interface DocumentFile {
    id: number;
    filename: string;
    size: number;
    mime_type: string;
    path?: string;
    fileurl?: string;
}

export interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'uploaded' | 'error' | 'on server';
    uploadedData?: DocumentFile;
}
