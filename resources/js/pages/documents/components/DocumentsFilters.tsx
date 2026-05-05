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
    selectedCategory: string;
    searchValue?: string;
    onCategoryChange: (category: string) => void;
    onDateRangeChange: (dateFrom: string) => void;
    onSearchChange?: (search: string) => void;
}

export default function DocumentsFilters({
    categories,
    selectedCategory,
    searchValue = '',
    onCategoryChange,
    onDateRangeChange,
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
            case '1-weeks':
                date.setDate(date.getDate() - 7);
                break;
            case '1-months':
                date.setMonth(date.getMonth() - 1);
                break;
            case '1-years':
                date.setFullYear(date.getFullYear() - 1);
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
                    className="w-48 rounded-lg bg-background"
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
                    <SelectItem key="1-weeks">1 Minggu lalu</SelectItem>
                    <SelectItem key="1-months">1 Bulan lalu</SelectItem>
                    <SelectItem key="1-years">1 Tahun lalu</SelectItem>
                </Select>

                <Autocomplete
                    label="Kategori"
                    placeholder="Cari kategori..."
                    className="w-64 rounded-lg bg-background"
                    size="sm"
                    variant="bordered"
                    selectedKey={selectedCategory}
                    onSelectionChange={(key) => {
                        const categoryValue =
                            key == 'all' ? '' : key?.toString() || '';
                        onCategoryChange(categoryValue || '');
                    }}
                    isClearable
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
                className="max-w-72 rounded-lg bg-background"
                label={
                    <div className="flex flex-row items-center gap-2">
                        <Search className="h-4 w-4 text-default-400" /> Cari
                        dokumen. No/Nama
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
