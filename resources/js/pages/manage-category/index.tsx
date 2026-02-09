import { Button, Chip } from '@heroui/react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Heading from '@/components/Heading';
import PaginationControls from '@/components/PaginationControls';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import AppLayout from '@/layouts/app';
import {
    index as indexCategories,
    store as createCategory,
    update as updateCategory,
    destroy as deleteCategory,
} from '@/routes/api/categories';
import type { Category } from '@/types/models';
import CategoriesTable from './components/CategoriesTable';
import CategorySortFilter from './components/CategorySortFilter';
import { useCategoryDialog } from './useCategoryDialog';

interface CategoryWithDocsCount extends Category {
    documents_count: number;
}

interface Props {
    categories: {
        data: (CategoryWithDocsCount & { sibling: CategoryWithDocsCount })[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        sort_by: string;
        sort_order: string;
        is_combined: boolean;
    };
}

export default function ManageCategory({ categories, filters }: Props) {
    const [perPage, setPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [isCombined, setIsCombined] = useState<boolean>(filters.is_combined);
    const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
    const [categoriesData, setCategoriesData] = useState(categories);
    const { openCategoryDialog, DialogComponent: CategoryDialog } =
        useCategoryDialog();
    const { confirm, DialogComponent: ConfirmDialog } = useConfirmDialog();

    const fetchCategories = useCallback(
        async (params = {}) => {
            setLoading(true);

            try {
                const response = await axios.get(indexCategories.url(), {
                    params: {
                        ...filters,
                        ...params,
                        per_page: perPage,
                        is_combined: isCombined,
                        search: searchTerm || undefined,
                    },
                });
                setCategoriesData(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        },
        [filters, perPage, isCombined, searchTerm],
    );

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSortChange = (value: string) => {
        const [sort_by, sort_order] = value.split('_');
        fetchCategories({
            sort_by: sort_by.replaceAll('-', '_'),
            sort_order,
            page: 1,
        });
    };

    const handleToggleCombine = (value: boolean) => {
        setIsCombined(value);
    };

    const handlePageChange = (page: number) => {
        fetchCategories({ page });
    };

    const handlePerPageChange = (value: string) => {
        const perPage = Number(value);
        if (perPage < 10) return;
        setPerPage(perPage);
    };

    const handleCreateCategory = async () => {
        const result = await openCategoryDialog();
        if (result) {
            try {
                const formData = new FormData();
                formData.append('category', result.categoryData.category);
                formData.append('direction', 'Masuk');

                if (result.iconFile) {
                    formData.append('icon_path', result.iconFile);
                }

                await axios.post(createCategory.url(), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                fetchCategories();
            } catch (error) {
                console.error('Error creating category:', error);
            }
        }
    };

    const handleEditCategory = async (
        category: Category & { documents_count: number },
    ) => {
        const result = await openCategoryDialog({
            id: category.id,
            category: category.category,
            direction: category.direction,
            icon_path: category.icon_url ?? '',
        });
        if (result) {
            try {
                const formData = new FormData();
                formData.append('category', result.categoryData.category);
                formData.append('_method', 'PUT');

                if (result.iconFile) {
                    formData.append('icon_path', result.iconFile);
                }

                await axios.post(updateCategory.url(category.id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                // fetchCategories();
                window.location.reload();
            } catch (error) {
                console.error('Error updating category:', error);
            }
        }
    };

    const handleDeleteCategory = async (
        category: CategoryWithDocsCount & {
            sibling: CategoryWithDocsCount;
        },
    ) => {
        const disabled =
            category.documents_count > 0 ||
            category.sibling.documents_count > 0;

        const categoryCount = category.documents_count;
        const siblingCount = category.sibling.documents_count;
        if (
            await confirm({
                title: 'Hapus Kategori?',
                message: `Apakah Anda yakin ingin menghapus kategori "${category.category}"?`,
                variant: 'danger',
                disabled: disabled,
                children: disabled && (
                    <div className="flex flex-col text-danger-600">
                        <p>
                            Tidak dapat dihapus karena memiliki beberapa dokumen
                            tertaut:
                        </p>
                        {categoryCount > 0 && (
                            <Chip
                                size="md"
                                variant="flat"
                                color={
                                    category.direction == 'Masuk'
                                        ? 'success'
                                        : 'danger'
                                }
                            >
                                {category.direction}: {categoryCount} dokumen
                            </Chip>
                        )}
                        {siblingCount > 0 && (
                            <Chip
                                size="md"
                                variant="flat"
                                color={
                                    category.sibling.direction == 'Masuk'
                                        ? 'success'
                                        : 'danger'
                                }
                            >
                                {category.sibling.direction}: {siblingCount}{' '}
                                dokumen
                            </Chip>
                        )}
                    </div>
                ),
            })
        ) {
            try {
                await axios.delete(deleteCategory.url(category.id));
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Kategori" />
            <div className="flex h-full flex-1 flex-col gap-4 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title="Manajemen Kategori"
                    description="Kelola kategori dokumen Anda"
                    trailing={
                        <Button
                            color="primary"
                            onPress={handleCreateCategory}
                            startContent={<Plus className="h-4 w-4" />}
                        >
                            Buat Kategori Baru
                        </Button>
                    }
                />

                {/* Search and Sort */}
                <CategorySortFilter
                    searchValue={searchTerm}
                    onSortChange={handleSortChange}
                    onToggleCombine={handleToggleCombine}
                    onSearchChange={(search) => {
                        setSearchTerm(search);
                    }}
                    isCombined={isCombined}
                />

                {/* Categories Table */}
                <CategoriesTable
                    categories={categoriesData.data}
                    loading={loading}
                    isCombined={isCombined}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                />

                {/* Pagination */}
                <PaginationControls
                    currentPage={categoriesData.current_page}
                    lastPage={categoriesData.last_page}
                    from={categoriesData.from}
                    to={categoriesData.to}
                    total={categoriesData.total}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
                {CategoryDialog}
                {ConfirmDialog}
            </div>
        </AppLayout>
    );
}
