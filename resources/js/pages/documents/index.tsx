import { Button } from '@heroui/react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Heading from '@/components/Heading';
import PaginationControls from '@/components/PaginationControls';
import AppLayout from '@/layouts/app';
import { index as create } from '@/routes/document/create';
import { index as editRoute } from '@/routes/document/edit';
import { index as previewRoute } from '@/routes/document/preview';
import type { Category, Document } from '@/types/models';
import DocumentsFilters from './components/DocumentsFilters';
import DocumentsTable from './components/DocumentsTable';

interface Props {
    documents: {
        data: Document[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    categories: Category[];
    directions: { direction: string }[];
    filters: {
        category?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
        sort_by: string;
        sort_order: string;
    };
    starred: boolean;
}

export default function DokumenKu({
    documents,
    directions,
    categories,
    filters,
    starred,
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>(
        filters.category || '',
    );
    const [perPage, setPerPage] = useState<number>(10);
    const [direction, setDirection] = useState<string>('');
    const [documentDate, setDocumentDate] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [documentsData, setDocumentsData] = useState(documents);

    const fetchDocuments = useCallback(
        async (params = {}) => {
            setLoading(true);
            try {
                params = {
                    ...filters,
                    ...params,
                    per_page: perPage,
                    starred: starred ? 1 : 0,
                };

                if (direction !== '') {
                    params = {
                        ...params,
                        direction: direction,
                    };
                }

                if (documentDate !== '') {
                    params = {
                        ...params,
                        date_from: documentDate,
                    };
                }
                const response = await axios.get('/api/documents', {
                    params,
                });
                setDocumentsData(response.data);
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setLoading(false);
            }
        },
        [direction, documentDate, filters, perPage, starred],
    );

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const clearCategoryFilter = () => {
        setSelectedCategory('');
        fetchDocuments({ category: undefined, page: 1 });
    };

    const handlePageChange = (page: number) => {
        fetchDocuments({ page });
    };

    const handlePerPageChange = (value: string) => {
        const perPage = Number(value);
        if (perPage < 10) return;
        setPerPage(perPage);
    };

    return (
        <AppLayout>
            <Head title="Dokumenku" />
            <div className="flex h-full flex-1 flex-col gap-4 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title="Dokumenku"
                    description="Daftar dokumen yang tersimpan di sistem. Anda dapat mengupload, mengedit, dan menghapus dokumen yang tersimpan."
                    trailing={
                        <Link href={create.url()} preserveState>
                            <Button
                                color="primary"
                                startContent={<Plus className="h-4 w-4" />}
                                onPress={(e) => {
                                    e.continuePropagation();
                                }}
                            >
                                Upload Dokumen
                            </Button>
                        </Link>
                    }
                />

                {/* Filters */}
                <DocumentsFilters
                    categories={categories}
                    directions={directions}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(category) => {
                        setSelectedCategory(category || '');
                        fetchDocuments({ category, page: 1 });
                    }}
                    onDirectionChange={(direction) => {
                        setDirection(direction);
                        fetchDocuments({ direction: direction || undefined });
                    }}
                    onDateRangeChange={(dateFrom) => {
                        setDocumentDate(dateFrom);
                        fetchDocuments({ date_from: dateFrom || undefined });
                    }}
                    onClearCategory={clearCategoryFilter}
                />

                {/* Documents Table */}
                <DocumentsTable
                    documents={documentsData.data}
                    loading={loading}
                    onEdit={(id) => router.visit(editRoute.url(id))}
                    onView={(id) => router.visit(previewRoute.url(id))}
                    onDownload={() => {}}
                    onDelete={() => {}}
                />

                {/* Pagination */}
                <PaginationControls
                    currentPage={documentsData.current_page}
                    lastPage={documentsData.last_page}
                    from={documentsData.from}
                    to={documentsData.to}
                    total={documentsData.total}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </AppLayout>
    );
}
