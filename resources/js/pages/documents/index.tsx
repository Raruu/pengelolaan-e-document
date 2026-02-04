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
    Chip,
    Autocomplete,
    AutocompleteItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Avatar,
} from '@heroui/react';
import { Head, Link, router } from '@inertiajs/react';

import axios from 'axios';
import { Plus, MoreVertical, Star } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Heading from '@/components/Heading';
import AppLayout from '@/layouts/app';
import { formatDate, initialsName } from '@/lib/utils';
import { index as create } from '@/routes/document/create';
import { index as editRoute } from '@/routes/document/edit';
import type { Category, Document } from '@/types/models';

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
    const [documentDate, setDocumentDate] = useState(
        new Date().toISOString().split('T')[0],
    );
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
                <div className="flex flex-wrap items-center gap-3">
                    <Select
                        label="Tampilkan"
                        className="w-48"
                        size="sm"
                        variant="bordered"
                        defaultSelectedKeys={['all']}
                        onSelectionChange={(keys) => {
                            const selected =
                                Array.from(keys)[0]?.toString() || '';
                            if (selected === 'all' || selected === '') {
                                setDocumentDate('');
                                return;
                            }
                            const date = new Date();
                            switch (selected) {
                                case 'today':
                                    date.setDate(date.getDate() - 1);
                                    break;
                                case '2-years':
                                    date.setFullYear(date.getFullYear() - 2);
                                    break;
                                case '5-years':
                                    date.setFullYear(date.getFullYear() - 5);
                                    break;
                                case '15-years':
                                    date.setFullYear(date.getFullYear() - 15);
                                    break;
                                default:
                                    break;
                            }
                            setDocumentDate(date.toISOString().split('T')[0]);
                            fetchDocuments({ date_to: date.toISOString() });
                        }}
                    >
                        <SelectItem key="all">Semua</SelectItem>
                        <SelectItem key="today">Hari ini</SelectItem>
                        <SelectItem key="2-years">2 Tahun</SelectItem>
                        <SelectItem key="5-years">5 Tahun</SelectItem>
                        <SelectItem key="15-years">15 Tahun</SelectItem>
                    </Select>

                    <Select
                        label="Arah"
                        className="w-48"
                        size="sm"
                        variant="bordered"
                        defaultSelectedKeys={['all']}
                        onSelectionChange={(keys) => {
                            const selected =
                                Array.from(keys)[0]?.toString() || '';
                            if (selected === 'all' || selected === '') {
                                setDirection('');
                                return;
                            }
                            setDirection(selected);
                            fetchDocuments({ direction: selected });
                        }}
                    >
                        <SelectItem key="all">Semua</SelectItem>
                        <>
                            {directions.map((direction) => (
                                <SelectItem key={direction.direction}>
                                    {direction.direction}
                                </SelectItem>
                            ))}
                        </>
                    </Select>

                    <Autocomplete
                        label="Kategori"
                        placeholder="Cari kategori..."
                        className="w-64"
                        size="sm"
                        variant="bordered"
                        selectedKey={selectedCategory}
                        onSelectionChange={(key) => {
                            const categoryValue =
                                key == 'all' ? '' : key?.toString() || '';
                            setSelectedCategory(categoryValue);
                            fetchDocuments({
                                category: categoryValue || undefined,
                                page: 1,
                            });
                        }}
                        isClearable
                        onClear={clearCategoryFilter}
                    >
                        <AutocompleteItem key="all">Semua</AutocompleteItem>
                        <>
                            {categories.map((category) => (
                                <AutocompleteItem
                                    key={category.category}
                                    startContent={
                                        category.icon_url ? (
                                            <Avatar
                                                className="size-4 rounded-md"
                                                src={category.icon_url}
                                                alt={initialsName(
                                                    category.category,
                                                )}
                                            />
                                        ) : (
                                            <span className="size-4 text-center text-sm font-semibold text-primary-600">
                                                {initialsName(
                                                    category.category,
                                                )}
                                            </span>
                                        )
                                    }
                                >
                                    {category.category}
                                </AutocompleteItem>
                            ))}
                        </>
                    </Autocomplete>
                </div>

                {/* Documents Table */}
                <Card className="flex-1">
                    <CardBody className="p-0">
                        <Table
                            aria-label="Documents table"
                            removeWrapper
                            className="min-h-100"
                        >
                            <TableHeader>
                                <TableColumn width={'40%'}>
                                    NAMA DOKUMEN
                                </TableColumn>
                                <TableColumn width={'15%'}>
                                    KATEGORI
                                </TableColumn>
                                <TableColumn width={'1%'}>
                                    JUMLAH FILE
                                </TableColumn>
                                <TableColumn width={'1%'}>
                                    TANGGAL DOKUMEN
                                </TableColumn>
                                <TableColumn width={'1%'}>
                                    TERAKHIR DIUBAH
                                </TableColumn>
                                <TableColumn width={'1%'}>AKSI</TableColumn>
                            </TableHeader>
                            <TableBody isLoading={loading}>
                                <>
                                    {documentsData.data.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="flex flex-row items-center gap-2 font-medium">
                                                        {doc.title}
                                                        {doc.starred && (
                                                            <Star
                                                                className="size-3 text-[#ede05d]"
                                                                fill="#ede05d"
                                                            />
                                                        )}
                                                    </span>
                                                    {doc.description && (
                                                        <span className="text-xs text-default-400">
                                                            {doc.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-row flex-wrap gap-1">
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color="default"
                                                    >
                                                        <div className="flex flex-row items-center gap-1">
                                                            {doc.category
                                                                .icon_url && (
                                                                <Avatar
                                                                    className="size-4 rounded-md"
                                                                    src={
                                                                        doc
                                                                            .category
                                                                            .icon_url
                                                                    }
                                                                    alt={initialsName(
                                                                        doc
                                                                            .category
                                                                            .category,
                                                                    )}
                                                                />
                                                            )}
                                                            <p>
                                                                {
                                                                    doc.category
                                                                        .category
                                                                }
                                                            </p>
                                                        </div>
                                                    </Chip>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={
                                                            doc.category
                                                                .direction ==
                                                            'Masuk'
                                                                ? 'success'
                                                                : 'danger'
                                                        }
                                                    >
                                                        {doc.category.direction}
                                                    </Chip>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color="default"
                                                >
                                                    {doc.files.length} file
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.DateTimeFormat(
                                                    'id-ID',
                                                    {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                ).format(
                                                    new Date(doc.document_date),
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {doc.updated_at
                                                    ? formatDate(doc.updated_at)
                                                    : formatDate(
                                                          doc.created_at,
                                                      )}
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
                                                    <DropdownMenu
                                                        aria-label="Document actions"
                                                        onAction={(key) => {
                                                            if (
                                                                key === 'edit'
                                                            ) {
                                                                router.visit(
                                                                    editRoute.url(
                                                                        doc.id,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <DropdownItem key="view">
                                                            Lihat Detail
                                                        </DropdownItem>
                                                        <DropdownItem key="download">
                                                            Download
                                                        </DropdownItem>
                                                        <DropdownItem key="edit">
                                                            Edit
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="delete"
                                                            className="text-danger"
                                                            color="danger"
                                                        >
                                                            Hapus
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                                <>
                                    {documentsData.data.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center"
                                            >
                                                Tidak ada dokumen
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
                            <SelectItem key="100">100</SelectItem>
                        </Select>
                        <p className="text-sm text-default-500">
                            Menampilkan {documentsData.from}-{documentsData.to}{' '}
                            dari total {documentsData.total}
                        </p>
                    </div>
                    <Pagination
                        total={documentsData.last_page}
                        page={documentsData.current_page}
                        onChange={handlePageChange}
                        showControls
                    />
                </div>
            </div>
        </AppLayout>
    );
}
