import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { serveFile } from '@/routes/api/documents';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const formatFileSize = (b: number): string => {
    if (b <= 0) return '0 KB';

    if (b >= 1024 * 1024) {
        return `${(b / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (b >= 1024) {
        return `${(b / 1024).toFixed(1)} KB`;
    }
    return `${Math.round(b)} B`;
};

export const initialsName = (name: string): string =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

export const formatDate = (dateString: string, simple = true): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (simple) {
        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari lalu`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    }

    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const isDoc = (ext: string): boolean =>
    ext.endsWith('.pdf') ||
    ext.endsWith('.doc') ||
    ext.endsWith('.docx') ||
    ext.endsWith('.xls') ||
    ext.endsWith('.xlsx') ||
    ext.endsWith('.ppt') ||
    ext.endsWith('.pptx');

export const getFileUrl = (documentId: number, fileId: number) => {
    return serveFile.url({
        document: documentId,
        fileId: fileId,
    });
};
