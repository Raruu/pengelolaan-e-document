export interface Category {
    id: number;
    category: string;
    direction: string;
    icon_path: string | null;
    icon_url?: string;
    sibling?: Category;
}