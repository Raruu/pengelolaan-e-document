import { Select, SelectItem, Switch } from '@heroui/react';

interface CategorySortFilterProps {
    onSortChange: (sortValue: string) => void;
    onToggleCombine?: (isCombined: boolean) => void;
    isCombined?: boolean;
}

export default function CategorySortFilter({
    onSortChange,
    onToggleCombine,
    isCombined = false,
}: CategorySortFilterProps) {
    return (
        <div className="flex items-center gap-3">
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
    );
}
