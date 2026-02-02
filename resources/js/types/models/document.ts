import type { DocumentFile } from './document-file';

export interface Document {
    id: number;
    title: string;
    description: string | null;
    starred: boolean;
    document_date: string;
    created_at: string;
    updated_at: string | null;
    uploaded_by: number;
    category_id: number;
    category: {
        id: number;
        categorie: string;
        direction: string;
    };
    files: DocumentFile[];
}
