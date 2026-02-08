import { Select, SelectItem, Switch, Input } from '@heroui/react';
import { Search } from 'lucide-react';

interface CategorySortFilterProps {
    searchValue?: string;
    onSortChange: (sortValue: string) => void;
    onToggleCombine?: (isCombined: boolean) => void;
    onSearchChange?: (search: string) => void;
    isCombined?: boolean;
}

export default function CategorySortFilter({
    searchValue = '',
    onSortChange,
    onToggleCombine,
    onSearchChange,
    isCombined = false,
}: CategorySortFilterProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Select
                        className="w-56"
                        size="sm"
                        variant="bordered"
                        label="Urutkan"
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
                {onToggleCombine && (
                    <div className="flex items-center gap-2">
                        <Switch
                            size="sm"
                            isSelected={isCombined}
                            onValueChange={onToggleCombine}
                        >
                            Gabungkan Jumlah Masuk & Keluar
                        </Switch>
                    </div>
                )}
            </div>
            <Input
                isClearable
                className="max-w-72"
                label={
                    <div className="flex flex-row items-center gap-2">
                        <Search className="h-4 w-4 text-default-400" /> Cari
                        Kategori...
                    </div>
                }
                size="sm"
                variant="bordered"
                value={searchValue}
                onValueChange={onSearchChange}
            />
        </div>
    );
}
