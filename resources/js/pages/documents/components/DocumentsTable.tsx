import {
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Avatar,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from '@heroui/react';
import { Star, MoreVertical } from 'lucide-react';
import { initialsName, formatDate } from '@/lib/utils';
import type { Document } from '@/types/models';

interface DocumentsTableProps {
    documents: Document[];
    loading: boolean;
    onEdit: (id: number) => void;
    onView?: (id: number) => void;
    onDownload?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export default function DocumentsTable({
    documents,
    loading,
    onEdit,
    onView,
    onDownload,
    onDelete,
}: DocumentsTableProps) {
    return (
        <Card className="flex-1">
            <CardBody className="p-0">
                <Table
                    aria-label="Documents table"
                    removeWrapper
                    className="min-h-100"
                >
                    <TableHeader>
                        <TableColumn width={'40%'}>NAMA DOKUMEN</TableColumn>
                        <TableColumn width={'15%'}>KATEGORI</TableColumn>
                        <TableColumn width={'1%'}>JUMLAH FILE</TableColumn>
                        <TableColumn width={'1%'}>TANGGAL DOKUMEN</TableColumn>
                        <TableColumn width={'1%'}>TERAKHIR DIUBAH</TableColumn>
                        <TableColumn width={'1%'}>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody isLoading={loading}>
                        {documents.length > 0 ? (
                            documents.map((doc) => (
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
                                                    {doc.category.icon_url && (
                                                        <Avatar
                                                            className="size-4 rounded-md"
                                                            src={
                                                                doc.category
                                                                    .icon_url
                                                            }
                                                            alt={initialsName(
                                                                doc.category
                                                                    .category,
                                                            )}
                                                        />
                                                    )}
                                                    <p>
                                                        {doc.category.category}
                                                    </p>
                                                </div>
                                            </Chip>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={
                                                    doc.category.direction ==
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
                                        {new Intl.DateTimeFormat('id-ID', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        }).format(new Date(doc.document_date))}
                                    </TableCell>
                                    <TableCell>
                                        {doc.updated_at
                                            ? formatDate(doc.updated_at)
                                            : formatDate(doc.created_at)}
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
                                                    if (key === 'edit') {
                                                        onEdit(doc.id);
                                                    } else if (
                                                        key === 'view' &&
                                                        onView
                                                    ) {
                                                        onView(doc.id);
                                                    } else if (
                                                        key === 'download' &&
                                                        onDownload
                                                    ) {
                                                        onDownload(doc.id);
                                                    } else if (
                                                        key === 'delete' &&
                                                        onDelete
                                                    ) {
                                                        onDelete(doc.id);
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center"
                                >
                                    Tidak ada dokumen
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
}
