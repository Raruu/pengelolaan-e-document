export interface Document {
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    file_size_kb: number;
    file_extension?: string;
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
}
