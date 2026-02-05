import { Select, SelectItem, Pagination } from '@heroui/react';

interface PaginationControlsProps {
    currentPage: number;
    lastPage: number;
    from: number;
    to: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: string) => void;
}

export default function PaginationControls({
    currentPage,
    lastPage,
    from,
    to,
    total,
    perPage,
    onPageChange,
    onPerPageChange,
}: PaginationControlsProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Select
                    label="Tampilkan"
                    size="sm"
                    variant="bordered"
                    className="w-32"
                    selectedKeys={[perPage.toString()]}
                    onChange={(e) => onPerPageChange(e.target.value)}
                >
                    <SelectItem key="10">10</SelectItem>
                    <SelectItem key="25">25</SelectItem>
                    <SelectItem key="50">50</SelectItem>
                    <SelectItem key="100">100</SelectItem>
                </Select>
                <p className="text-sm text-default-500">
                    Menampilkan {from}-{to} dari total {total}
                </p>
            </div>
            <Pagination
                total={lastPage}
                page={currentPage}
                onChange={onPageChange}
                showControls
            />
        </div>
    );
}
