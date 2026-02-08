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

interface DocumentsFiltersProps {
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

export default function DocumentsFilters({
    categories,
    directions,
    selectedCategory,
    searchValue = '',
    onCategoryChange,
    onDirectionChange,
    onDateRangeChange,
    onClearCategory,
    onSearchChange,
}: DocumentsFiltersProps) {
    const handleDateRangeChange = (selected: string) => {
        if (selected === 'all' || selected === '') {
            onDateRangeChange('');
            return;
        }
        const date = new Date();
        switch (selected) {
            case 'today':
                date.setDate(date.getDate());
                break;
            case '2-years':
                date.setFullYear(date.getFullYear() - 2);
                break;
            case '5-years':
                date.setFullYear(date.getFullYear() - 5);
                break;
            case '15-years':
                date.setFullYear(date.getFullYear() - 15);
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
                    label="Dokumen Dari"
                    className="w-48"
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
                    className="w-64"
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
            </div>

            <Input
                isClearable
                className="max-w-72"
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
