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
import type { TrashDocument } from '@/types/models/trash';

interface TrashTableProps {
    items: TrashDocument[];
    loading: boolean;
    onView: (id: number) => void;
    onRestore: (doc: TrashDocument, type: 'document' | 'file') => void;
    onPermanentDelete: (doc: TrashDocument, type: 'document' | 'file') => void;
}

export default function TrashTable({
    items,
    loading,
    onView,
    onRestore,
    onPermanentDelete,
}: TrashTableProps) {
    return (
        <Card className="flex-1">
            <CardBody className="p-0">
                <Table
                    aria-label="Trash table"
                    removeWrapper
                    className="min-h-100"
                >
                    <TableHeader>
                        <TableColumn width={'10%'}>NO. DOKUMEN</TableColumn>
                        <TableColumn width={'30%'}>NAMA DOKUMEN</TableColumn>
                        <TableColumn width={'7%'}>KATEGORI</TableColumn>
                        <TableColumn width={'1%'}>PENGHAPUSAN</TableColumn>
                        <TableColumn width={'1%'}>JUMLAH FILE</TableColumn>
                        <TableColumn width={'1%'}>TANGGAL DIHAPUS</TableColumn>
                        <TableColumn width={'1%'}>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody isLoading={loading}>
                        {items.length > 0 ? (
                            items.map((doc) => (
                                <TableRow key={`document-${doc.id}`}>
                                    <TableCell>
                                        <span className="text-sm text-default-500">
                                            {doc.no_document}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-96 overflow-hidden">
                                        <div className="m-0 flex flex-col truncate">
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
                                            color={
                                                doc.deletion_type === 'full'
                                                    ? 'danger'
                                                    : 'warning'
                                            }
                                        >
                                            {doc.deletion_type === 'full'
                                                ? 'Dokumen'
                                                : 'Sebagian'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color="default"
                                        >
                                            {doc.deletion_type === 'partial'
                                                ? `${doc.deleted_files_count}/${doc.files_count} file`
                                                : `${doc.files_count} file`}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {doc.deleted_at
                                            ? formatDate(doc.deleted_at)
                                            : '-'}
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
                                                        case 'view':
                                                            onView(doc.id);
                                                            break;
                                                        case 'restore':
                                                            onRestore(
                                                                doc,
                                                                'document',
                                                            );
                                                            break;
                                                        case 'delete':
                                                            onPermanentDelete(
                                                                doc,
                                                                'document',
                                                            );
                                                            break;
                                                    }
                                                }}
                                            >
                                                <DropdownItem key="view">
                                                    Lihat Detail
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="restore"
                                                    color="success"
                                                >
                                                    Pulihkan{' '}
                                                    {doc.deletion_type ===
                                                    'full'
                                                        ? 'Dokumen'
                                                        : 'Semua File'}
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="delete"
                                                    className="text-danger"
                                                    color="danger"
                                                >
                                                    Hapus Permanen
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
                                    Tidak ada item di tong sampah
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
}
