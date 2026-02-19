import { Button } from '@heroui/react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Heading from '@/components/Heading';
import PaginationControls from '@/components/PaginationControls';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import AppLayout from '@/layouts/app';
import { index as trashIndex } from '@/routes/api/trash';
import { restore as trashRestore } from '@/routes/api/trash';
import { forceDelete } from '@/routes/api/trash';
import { empty as trashEmpty } from '@/routes/api/trash';
import { index as trashPreview } from '@/routes/trash/preview';
import type { Category } from '@/types/models';
import type { TrashDocument } from '@/types/models/trash';
import TrashFilters from './components/TrashFilters';
import TrashTable from './components/TrashTable';

interface Props {
    items: {
        data: TrashDocument[];
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
}

export default function Trash({
    items,
    directions,
    categories,
    filters,
}: Props) {
    const { confirm, DialogComponent } = useConfirmDialog();
    const [selectedCategory, setSelectedCategory] = useState<string>(
        filters.category || '',
    );
    const [perPage, setPerPage] = useState<number>(10);
    const [direction, setDirection] = useState<string>('');
    const [deletedDate, setDeletedDate] = useState('');
    const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [itemsData, setItemsData] = useState(items);

    const fetchItems = useCallback(
        async (params = {}) => {
            setLoading(true);
            try {
                params = {
                    ...filters,
                    ...params,
                    per_page: perPage,
                };

                if (direction !== '') {
                    params = {
                        ...params,
                        direction: direction,
                    };
                }

                if (deletedDate !== '') {
                    params = {
                        ...params,
                        date_from: deletedDate,
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

                const response = await axios.get(trashIndex.url(), {
                    params,
                });
                setItemsData(response.data);
            } catch (error) {
                console.error('Error fetching trash items:', error);
            } finally {
                setLoading(false);
            }
        },
        [
            filters,
            perPage,
            direction,
            deletedDate,
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

        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchItems]);

    const clearCategoryFilter = () => {
        setSelectedCategory('');
        fetchItems({ category: undefined, page: 1 });
    };

    const handlePageChange = (page: number) => {
        fetchItems({ page });
    };

    const handlePerPageChange = (value: string) => {
        const perPage = Number(value);
        if (perPage < 10) return;
        setPerPage(perPage);
    };

    const handleView = (id: number) => {
        router.visit(trashPreview({ id }).url);
    };

    const handleRestore = async (
        doc: TrashDocument,
        type: 'document' | 'file',
    ) => {
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `mengembalikan Dokumen: ${doc.title}`,
            variant: 'success',
        });

        if (!yes) return;

        try {
            await axios.post(trashRestore.url(), { id: doc.id, type });
            router.reload({ only: ['items'] });
            fetchItems();
        } catch (error) {
            console.error('Error restoring item:', error);
        }
    };

    const handlePermanentDelete = async (
        doc: TrashDocument,
        type: 'document' | 'file',
    ) => {
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `Menghapus item '${doc.title}' secara permanen.Item yang telah dihapus tidak dapat dikembalikan.`,
            variant: 'danger',
        });

        if (!yes) return;

        try {
            await axios.delete(forceDelete.url(), {
                data: { id: doc.id, type },
            });
            router.reload({ only: ['items'] });
            fetchItems();
        } catch (error) {
            console.error('Error permanently deleting item:', error);
        }
    };

    const handleEmptyTrash = async () => {
        const yes = await confirm({
            title: 'Apakah Anda yakin ingin mengosongkan tong sampah?',
            message:
                'Setelah dikosongkan, item yang telah dihapus tidak dapat dikembalikan.',
            variant: 'danger',
        });

        if (!yes) return;

        try {
            await axios.delete(trashEmpty.url());
            router.reload({ only: ['items'] });
            fetchItems();
        } catch (error) {
            console.error('Error emptying trash:', error);
        }
    };

    return (
        <AppLayout>
            <Head title="Tong Sampah" />
            <div className="flex h-full flex-1 flex-col gap-4 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title="Tong Sampah"
                    description="Daftar dokumen dan file yang telah dihapus."
                    trailing={
                        <div className="flex items-center gap-2">
                            {itemsData.total > 0 && (
                                <Button
                                    color="danger"
                                    variant="flat"
                                    startContent={
                                        <Trash2 className="h-4 w-4" />
                                    }
                                    onPress={handleEmptyTrash}
                                >
                                    Kosongkan Sampah
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Filters */}
                <TrashFilters
                    categories={categories}
                    directions={directions}
                    selectedCategory={selectedCategory}
                    searchValue={searchTerm}
                    onCategoryChange={(category) => {
                        setSelectedCategory(category || '');
                        fetchItems({ category, page: 1 });
                    }}
                    onDirectionChange={(direction) => {
                        setDirection(direction);
                        fetchItems({ direction: direction || undefined });
                    }}
                    onDateRangeChange={(dateFrom) => {
                        setDeletedDate(dateFrom);
                        fetchItems({ date_from: dateFrom || undefined });
                    }}
                    onSearchChange={(search) => {
                        setSearchTerm(search);
                    }}
                    onClearCategory={clearCategoryFilter}
                />

                {/* Trash Table */}
                <TrashTable
                    items={itemsData.data}
                    loading={loading}
                    onView={handleView}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                />

                {/* Pagination */}
                <PaginationControls
                    currentPage={itemsData.current_page}
                    lastPage={itemsData.last_page}
                    from={itemsData.from}
                    to={itemsData.to}
                    total={itemsData.total}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
            {DialogComponent}
        </AppLayout>
    );
}
