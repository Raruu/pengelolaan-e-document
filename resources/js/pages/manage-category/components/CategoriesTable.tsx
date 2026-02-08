import {
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    DropdownMenu,
    Avatar,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownTrigger,
} from '@heroui/react';
import { MoreVertical } from 'lucide-react';
import { initialsName } from '@/lib/utils';
import type { Category } from '@/types/models';

interface CategoryWithDocsCount extends Category {
    documents_count: number;
}

interface CategoriesTableProps {
    categories: (CategoryWithDocsCount & { sibling: CategoryWithDocsCount })[];
    loading: boolean;
    isCombined: boolean;
    onEdit: (category: CategoryWithDocsCount) => void;
    onDelete: (
        category: CategoryWithDocsCount & { sibling: CategoryWithDocsCount },
    ) => void;
}

export default function CategoriesTable({
    categories,
    loading,
    isCombined,
    onEdit,
    onDelete,
}: CategoriesTableProps) {
    return (
        <Card className="flex-1">
            <CardBody className="p-0">
                <Table
                    aria-label="Categories table"
                    removeWrapper
                    className="min-h-100"
                >
                    <TableHeader>
                        <TableColumn width={'70%'}>NAMA KATEGORI</TableColumn>
                        <TableColumn width={'10%'}>JUMLAH DOKUMEN</TableColumn>
                        <TableColumn width={'5%'}>ARAH</TableColumn>
                        <TableColumn width={'3%'}>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody isLoading={loading}>
                        {categories.length > 0 ? (
                            categories.map((category) => {
                                const direction =
                                    category.direction.substring(0, 1) +
                                    category.direction
                                        .toLowerCase()
                                        .substring(1);
                                return (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-primary-100">
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
                                                {category.documents_count || 0}{' '}
                                                file
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={
                                                    isCombined
                                                        ? 'primary'
                                                        : direction == 'Masuk'
                                                          ? 'success'
                                                          : 'danger'
                                                }
                                            >
                                                {isCombined
                                                    ? 'Gabungan'
                                                    : direction}
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
                                                            onEdit(category)
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        className="text-danger"
                                                        color="danger"
                                                        onPress={() =>
                                                            onDelete(category)
                                                        }
                                                    >
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center"
                                >
                                    Tidak ada Kategori
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
}
