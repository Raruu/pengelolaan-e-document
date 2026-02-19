import { addToast, Button } from '@heroui/react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Heading from '@/components/Heading';
import PaginationControls from '@/components/PaginationControls';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import AppLayout from '@/layouts/app';
import { downloadAllDocument } from '@/lib/donwload-all';
import { index as documentsIndex } from '@/routes/api/documents';
import { destroy as documentDestroy } from '@/routes/api/documents';
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
    const { confirm, DialogComponent } = useConfirmDialog();
    const [selectedCategory, setSelectedCategory] = useState<string>(
        filters.category || '',
    );
    const [perPage, setPerPage] = useState<number>(10);
    const [direction, setDirection] = useState<string>('');
    const [documentDate, setDocumentDate] = useState('');
    const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
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

                if (searchTerm !== '') {
                    params = {
                        ...params,
                        search: searchTerm,
                    };
                }

                if (selectedCategory !== '') {
                    params = {
                        ...params,
                        category: selectedCategory,
                    };
                }
                const response = await axios.get(documentsIndex.url(), {
                    params,
                });
                setDocumentsData(response.data);
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setLoading(false);
            }
        },
        [
            filters,
            perPage,
            starred,
            direction,
            documentDate,
            searchTerm,
            selectedCategory,
        ],
    );

    const [calledFirstTime, setCalledFirstTime] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        if (calledFirstTime) {
            setCalledFirstTime(false);
            return;
        }

        fetchDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchDocuments]);

    const handlePageChange = (page: number) => {
        fetchDocuments({ page });
    };

    const handlePerPageChange = (value: string) => {
        const perPage = Number(value);
        if (perPage < 10) return;
        setPerPage(perPage);
    };

    const handleDeleteDocument = async (document: Document) => {
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `Apakah Anda yakin ingin menghapus permanen dokumen '${document.title}'? Aksi ini tidak dapat dibatalkan!`,
            variant: 'danger',
        });

        if (!yes) return;

        setLoading(true);
        try {
            await axios.delete(documentDestroy.url(document.id), {
                data: {
                    id: document.id,
                    type: 'document',
                },
            });
            fetchDocuments();
            addToast({
                title: 'Dihapus!',
                description: `Dokumen ${document.title} berhasil dihapus!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'success',
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            addToast({
                title: 'Gagal!',
                description: `Dokumen ${document.title} gagal dihapus!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Dokumenku" />
            <div className="flex h-full flex-1 flex-col gap-4 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title="Dokumenku"
                    description={`Daftar dokumen yang tersimpan di sistem. ${starred ? '(berbintang)' : ''}`}
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
                    searchValue={searchTerm}
                    onCategoryChange={(category) => {
                        setSelectedCategory(category);
                    }}
                    onDirectionChange={(direction) => {
                        setDirection(direction);
                    }}
                    onDateRangeChange={(dateFrom) => {
                        setDocumentDate(dateFrom);
                    }}
                    onSearchChange={(search) => {
                        setSearchTerm(search);
                    }}
                />

                {/* Documents Table */}
                <DocumentsTable
                    documents={documentsData.data}
                    loading={loading}
                    onEdit={(id) => router.visit(editRoute.url(id))}
                    onView={(id) => router.visit(previewRoute.url(id))}
                    onDownload={(d) => downloadAllDocument({ theDocument: d })}
                    onDelete={handleDeleteDocument}
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
            {DialogComponent}
        </AppLayout>
    );
}
