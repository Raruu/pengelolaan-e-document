import { Avatar } from '@heroui/react';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { formatDate, initialsName } from '@/lib/utils';
import { index as preview } from '@/routes/document/preview';
import type { Document as typeDocument } from '@/types/models';

interface Document extends typeDocument {
    files_count: number;
}

interface RecentFilesProps {
    title: ReactNode;
    documents: Document[];
    viewAllLink?: string;
}

export default function RecentFiles({
    title,
    documents,
    viewAllLink,
}: RecentFilesProps) {
    return (
        <div className="px-6 py-1 dark:border-sidebar-border dark:bg-neutral-900">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {title}
                </h2>
                {viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Lihat semua
                    </Link>
                )}
            </div>

            {documents.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Tidak ada dokumen
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {documents.map((document) => {
                        const category = document.category;
                        return (
                            <Link
                                href={preview.url(document.id)}
                                key={document.id}
                                className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
                            >
                                <div className="flex flex-row items-center gap-0">
                                    <div className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-primary-100">
                                        {document.category.icon_url ? (
                                            <Avatar
                                                className="size-8 rounded-md"
                                                src={category.icon_url}
                                                alt={category.category}
                                            />
                                        ) : (
                                            <span className="text-sm font-semibold text-primary-600">
                                                {initialsName(
                                                    category.category,
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                                        {category.category}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="mb-1 line-clamp-2 text-sm font-medium text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
                                        {document.title}
                                    </h3>
                                    <div className="flex flex-col gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        <div className="flex items-center justify-between">
                                            <span>
                                                {document.files_count} file
                                            </span>
                                            <span>
                                                {formatDate(
                                                    document.document_date,
                                                    false,
                                                )}
                                            </span>
                                        </div>
                                        {document.updated_at && (
                                            <div className="flex flex-row justify-end">                                                
                                                <span>
                                                    (Diperbarui){' '}
                                                    {formatDate(
                                                        document.updated_at,
                                                        false,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
