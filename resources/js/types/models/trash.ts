import type { Category } from './category';

export interface TrashDocument {
    id: number;
    type: 'document';
    deletion_type: 'full' | 'partial';
    title: string;
    no_document: string;
    description?: string;
    category: Category;
    document_date?: string;
    deleted_at: string;
    deleted_files_count?: number;
    starred?: boolean;
    files_count: number;
    total_files: number;
}
