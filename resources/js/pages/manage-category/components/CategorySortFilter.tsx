import { Select, SelectItem } from '@heroui/react';

interface CategorySortFilterProps {
    onSortChange: (sortValue: string) => void;
}

export default function CategorySortFilter({
    onSortChange,
}: CategorySortFilterProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">Urutkan:</span>
                <Select
                    className="w-56"
                    size="sm"
                    variant="bordered"
                    defaultSelectedKeys={['category_asc']}
                    onChange={(e) => onSortChange(e.target.value)}
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
    );
}
