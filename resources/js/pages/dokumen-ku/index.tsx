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
} from '@heroui/react';
import { Head } from '@inertiajs/react';

import axios from 'axios';
import {
    Plus,
    MoreVertical,
    FileText,
    FileSpreadsheet,
    FileImage,
    File as FileIcon,
    Archive,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Heading from '@/components/Heading';
import AppLayout from '@/layouts/app';
import { formatFileSize } from '@/lib/utils';
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
    recentFiles: Document[];
    filters: {
        category?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
        sort_by: string;
        sort_order: string;
    };
}

const fileIcons: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-6 w-6 text-red-500" />,
    doc: <FileText className="h-6 w-6 text-blue-500" />,
    docx: <FileText className="h-6 w-6 text-blue-500" />,
    xlsx: <FileSpreadsheet className="h-6 w-6 text-green-500" />,
    xls: <FileSpreadsheet className="h-6 w-6 text-green-500" />,
    jpg: <FileImage className="h-6 w-6 text-orange-500" />,
    jpeg: <FileImage className="h-6 w-6 text-orange-500" />,
    png: <FileImage className="h-6 w-6 text-orange-500" />,
    zip: <Archive className="h-6 w-6 text-yellow-500" />,
    default: <FileIcon className="h-6 w-6 text-gray-500" />,
};

export default function DokumenKu({
    documents,
    directions,
    categories,
    recentFiles,
    filters,
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>(
        filters.category || '',
    );
    const [perPage, setPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [documentsData, setDocumentsData] = useState(documents);

    const fetchDocuments = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/documents', {
                params: {
                    ...filters,
                    ...params,
                    per_page: perPage,
                },
            });
            setDocumentsData(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    }, [perPage, filters]);

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
        setPerPage(Number(value));
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getFileIcon = (doc: {
        file_extension?: string;
        file_path: string;
    }) => {
        const extension =
            doc.file_extension || doc.file_path.split('.').pop() || '';
        return fileIcons[extension.toLowerCase()] || fileIcons.default;
    };

    return (
        <AppLayout>
            <Head title="Dokumenku" />
            <div className="flex h-full flex-1 flex-col gap-4 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title="Dokumenku"
                    description="Kelola profil dan pengaturan akun Anda"
                    trailing={
                        <Button
                            color="primary"
                            startContent={<Plus className="h-4 w-4" />}
                        >
                            Upload New
                        </Button>
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
                            const categoryValue = key?.toString() || '';
                            setSelectedCategory(categoryValue);
                            fetchDocuments({ category: categoryValue || undefined, page: 1 });
                        }}
                        isClearable
                        onClear={clearCategoryFilter}
                    >
                        {categories.map((category) => (
                            <AutocompleteItem key={category.category}>
                                {category.category}
                            </AutocompleteItem>
                        ))}
                    </Autocomplete>
                </div>

                {/* Recent Files */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">File Terbaru</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {recentFiles.map((file) => (
                            <Card key={file.id} className="border">
                                <CardBody className="gap-2 p-4">
                                    <div className="flex items-center justify-center rounded-lg bg-default-100 p-4">
                                        {getFileIcon(file)}
                                    </div>
                                    <div className="mt-2">
                                        <p className="truncate text-sm font-medium">
                                            {file.title}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between text-xs text-default-500">
                                            <span>
                                                {formatFileSize(
                                                    file.file_size_kb,
                                                )}
                                            </span>
                                            <span>
                                                {formatDate(file.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
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
                                <TableColumn>NAME</TableColumn>
                                <TableColumn>DATE MODIFIED</TableColumn>
                                <TableColumn>TYPE</TableColumn>
                                <TableColumn>SIZE</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody isLoading={loading}>
                                {documentsData.data.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(doc)}
                                                <span className="font-medium">
                                                    {doc.title}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {doc.updated_at
                                                ? formatDate(doc.updated_at)
                                                : formatDate(doc.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat">
                                                {(
                                                    doc.file_extension ||
                                                    doc.file_path
                                                        .split('.')
                                                        .pop() ||
                                                    ''
                                                ).toUpperCase()}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {formatFileSize(doc.file_size_kb)}
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
                                                <DropdownMenu aria-label="Document actions">
                                                    <DropdownItem key="download">
                                                        Download
                                                    </DropdownItem>
                                                    <DropdownItem key="share">
                                                        Share
                                                    </DropdownItem>
                                                    <DropdownItem key="rename">
                                                        Rename
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        className="text-danger"
                                                        color="danger"
                                                    >
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                            onChange={(e) => handlePerPageChange(e.target.value)}
                        >
                            <SelectItem key="10">10</SelectItem>
                            <SelectItem key="25">25</SelectItem>
                            <SelectItem key="50">50</SelectItem>
                            <SelectItem key="100">100</SelectItem>
                        </Select>
                        <p className="text-sm text-default-500">
                            Menampilkan {documentsData.from}-{documentsData.to} dari
                            total {documentsData.total}
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
