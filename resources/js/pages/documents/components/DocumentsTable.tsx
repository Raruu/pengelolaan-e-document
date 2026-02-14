import {
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from '@heroui/react';
import { Star, MoreVertical, Eye } from 'lucide-react';
import { ChipKategori } from '@/components/ChipKategori';
import { formatDate } from '@/lib/utils';
import type { Document } from '@/types/models';

interface DocumentsTableProps {
    documents: Document[];
    loading: boolean;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
    onDownload: (document: Document) => void;
    onDelete: (document: Document) => void;
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
                        <TableColumn width={'10%'}>NO. DOKUMEN</TableColumn>
                        <TableColumn width={'30%'}>NAMA DOKUMEN</TableColumn>
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
                                         {doc.no_document}
                                    </TableCell>
                                    <TableCell className="max-w-96 overflow-hidden">
                                        <div className="flex flex-col truncate">
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
                                                <span className="truncate text-xs text-default-400">
                                                    {doc.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <ChipKategori
                                            category={doc.category}
                                            size="sm"
                                        />
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
                                    <TableCell className="flex flex-row items-center">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => onView(doc.id)}
                                        >
                                            <Eye className="size-4" />
                                        </Button>
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
                                                    switch (key) {
                                                        case 'edit':
                                                            onEdit(doc.id);
                                                            break;
                                                        case 'view':
                                                            onView(doc.id);
                                                            break;
                                                        case 'download':
                                                            onDownload(doc);
                                                            break;
                                                        case 'delete':
                                                            onDelete(doc);
                                                            break;
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
                                    colSpan={7}
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
