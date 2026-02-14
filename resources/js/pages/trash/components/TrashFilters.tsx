import {
    Select,
    SelectItem,
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Input,
} from '@heroui/react';
import { Search } from 'lucide-react';
import { initialsName } from '@/lib/utils';
import type { Category } from '@/types/models';

interface TrashFiltersProps {
    categories: Category[];
    directions: { direction: string }[];
    selectedCategory: string;
    searchValue?: string;
    onCategoryChange: (category: string | undefined) => void;
    onDirectionChange: (direction: string) => void;
    onDateRangeChange: (dateFrom: string) => void;
    onClearCategory: () => void;
    onSearchChange?: (search: string) => void;
}

export default function TrashFilters({
    categories,
    directions,
    selectedCategory,
    searchValue = '',
    onCategoryChange,
    onDirectionChange,
    onDateRangeChange,
    onClearCategory,
    onSearchChange,
}: TrashFiltersProps) {
    const handleDateRangeChange = (selected: string) => {
        if (selected === 'all' || selected === '') {
            onDateRangeChange('');
            return;
        }
        const date = new Date();
        switch (selected) {
            case 'today':
                date.setDate(date.getDate() - 1);
                break;
            case '7-days':
                date.setDate(date.getDate() - 7);
                break;
            case '30-days':
                date.setDate(date.getDate() - 30);
                break;
            case '90-days':
                date.setDate(date.getDate() - 90);
                break;
            default:
                break;
        }
        onDateRangeChange(date.toISOString().split('T')[0]);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <Select
                    label="Dihapus Dalam"
                    className="w-48 bg-background rounded-lg"
                    size="sm"
                    variant="bordered"
                    defaultSelectedKeys={['all']}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0]?.toString() || '';
                        handleDateRangeChange(selected);
                    }}
                >
                    <SelectItem key="all">Semua</SelectItem>
                    <SelectItem key="today">Hari ini</SelectItem>
                    <SelectItem key="7-days">7 Hari Terakhir</SelectItem>
                    <SelectItem key="30-days">30 Hari Terakhir</SelectItem>
                    <SelectItem key="90-days">90 Hari Terakhir</SelectItem>
                </Select>

                <Select
                    label="Arah"
                    className="w-48 bg-background rounded-lg"
                    size="sm"
                    variant="bordered"
                    defaultSelectedKeys={['all']}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0]?.toString() || '';
                        if (selected === 'all' || selected === '') {
                            onDirectionChange('');
                            return;
                        }
                        onDirectionChange(selected);
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
                    className="w-64 bg-background rounded-lg"
                    size="sm"
                    variant="bordered"
                    selectedKey={selectedCategory}
                    onSelectionChange={(key) => {
                        const categoryValue =
                            key == 'all' ? '' : key?.toString() || '';
                        onCategoryChange(categoryValue || undefined);
                    }}
                    isClearable
                    onClear={onClearCategory}
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
                                            {initialsName(category.category)}
                                        </span>
                                    )
                                }
                            >
                                {category.category}
                            </AutocompleteItem>
                        ))}
                    </>
                </Autocomplete>
            </div>{' '}
            <Input
                isClearable
                className="max-w-72 bg-background rounded-lg"
                label={
                    <div className="flex flex-row items-center gap-2">
                        <Search className="h-4 w-4 text-default-400" /> Cari
                        dokumen...
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
