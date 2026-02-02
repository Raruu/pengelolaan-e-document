export interface DocumentFile {
    id: number;
    document_id: number;
    file_path: string;
    file_size_kb: number;
    file_extension?: string;
    created_at: string;
    updated_at: string;
}
