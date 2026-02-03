import {
    Button,
    Card,
    CardBody,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Chip,
    Avatar,
} from '@heroui/react';
import { Head } from '@inertiajs/react';

import axios from 'axios';
import { Plus, MoreVertical } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Heading from '@/components/Heading';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import AppLayout from '@/layouts/app';
import { initialsName } from '@/lib/utils';
import type { Category } from '@/types/models';
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
    };
}

export default function ManageCategory({ categories, filters }: Props) {
    const [perPage, setPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [categoriesData, setCategoriesData] = useState(categories);
    const { openCategoryDialog, DialogComponent: CategoryDialog } =
        useCategoryDialog();
    const { confirm, DialogComponent: ConfirmDialog } = useConfirmDialog();

    const fetchCategories = useCallback(
        async (params = {}) => {
            setLoading(true);

            try {
                const response = await axios.get('/api/categories', {
                    params: {
                        ...filters,
                        ...params,
                        per_page: perPage,
                    },
                });
                setCategoriesData(response.data);
                // console.log(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        },
        [filters, perPage],
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

                await axios.post('/api/categories', formData, {
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
        // console.log(category);
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

                await axios.post(`/api/categories/${category.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                fetchCategories();
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
                await axios.delete(`/api/categories/${category.id}`);
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
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-default-500">
                            Urutkan:
                        </span>
                        <Select
                            className="w-56"
                            size="sm"
                            variant="bordered"
                            defaultSelectedKeys={['category_asc']}
                            onChange={(e) => handleSortChange(e.target.value)}
                            aria-label="Sort categories"
                        >
                            <SelectItem key="documents-count_desc">
                                Jumlah Dokumen (Desc)
                            </SelectItem>
                            <SelectItem key="documents-count_asc">
                                Jumlah Dokumen (Asc)
                            </SelectItem>
                            <SelectItem key="category_asc">
                                Nama Kategori (A-Z)
                            </SelectItem>
                            <SelectItem key="category_desc">
                                Nama Kategori (Z-A)
                            </SelectItem>
                        </Select>
                    </div>
                </div>

                {/* Categories Table */}
                <Card className="flex-1">
                    <CardBody className="p-0">
                        <Table
                            aria-label="Categories table"
                            removeWrapper
                            className="min-h-100"
                        >
                            <TableHeader>
                                <TableColumn width={'70%'}>
                                    NAMA KATEGORI
                                </TableColumn>
                                <TableColumn width={'10%'}>
                                    JUMLAH DOKUMEN
                                </TableColumn>
                                <TableColumn width={'5%'}>ARAH</TableColumn>
                                <TableColumn width={'3%'}>AKSI</TableColumn>
                            </TableHeader>
                            <TableBody isLoading={loading}>
                                <>
                                    {categoriesData.data.map((category) => {
                                        const direction =
                                            category.direction.substring(0, 1) +
                                            category.direction
                                                .toLowerCase()
                                                .substring(1);

                                        return (
                                            <TableRow key={category.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-8 items-center justify-center rounded-md bg-primary-100">
                                                            {category.icon_url ? (
                                                                <Avatar
                                                                    className="size-8 rounded-md"
                                                                    src={
                                                                        category.icon_url
                                                                    }
                                                                    alt={
                                                                        category.category
                                                                    }
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-semibold text-primary-600">
                                                                    {initialsName(
                                                                        category.category,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium">
                                                            {category.category}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color="default"
                                                    >
                                                        {category.documents_count ||
                                                            0}{' '}
                                                        file
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={
                                                            direction == 'Masuk'
                                                                ? 'success'
                                                                : 'danger'
                                                        }
                                                    >
                                                        {direction}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu aria-label="Category actions">
                                                            <DropdownItem
                                                                key="edit"
                                                                onPress={() =>
                                                                    handleEditCategory(
                                                                        category,
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                className="text-danger"
                                                                color="danger"
                                                                onPress={() =>
                                                                    handleDeleteCategory(
                                                                        category,
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </>
                                <>
                                    {categoriesData.data.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center"
                                            >
                                                Tidak ada Kategori
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Select
                            label="Tampilkan"
                            size="sm"
                            variant="bordered"
                            className="w-32"
                            selectedKeys={[perPage.toString()]}
                            onChange={(e) =>
                                handlePerPageChange(e.target.value)
                            }
                        >
                            <SelectItem key="10">10</SelectItem>
                            <SelectItem key="25">25</SelectItem>
                            <SelectItem key="50">50</SelectItem>
                        </Select>
                        <p className="text-sm text-default-500">
                            Showing {categoriesData.from}-{categoriesData.to} of{' '}
                            {categoriesData.total} results
                        </p>
                    </div>
                    <Pagination
                        total={categoriesData.last_page}
                        page={categoriesData.current_page}
                        onChange={handlePageChange}
                        showControls
                    />
                </div>
                {CategoryDialog}
                {ConfirmDialog}
            </div>
        </AppLayout>
    );
}
