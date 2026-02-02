import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const formatFileSize = (kb: number): string => {
    if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${kb} KB`;
};
