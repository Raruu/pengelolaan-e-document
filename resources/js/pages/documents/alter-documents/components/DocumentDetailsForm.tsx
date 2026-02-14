import {
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
    Textarea,
    DatePicker,
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Button,
} from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { Save, Star, Upload, X } from 'lucide-react';
import { initialsName } from '@/lib/utils';
import type { Category } from '@/types/models';

interface DocumentDetailsFormProps {
    title: string;
    noDocument: string;
    category: string;
    direction: string;
    description: string;
    documentDate: string;
    categories: Category[];
    directions: { direction: string }[];
    starred: boolean;
    validationErrors: Record<string, string>;
    isSubmitting: boolean;
    mode: 'create' | 'edit';
    handleSubmit: () => void;
    onTitleChange: (value: string) => void;
    onNoDocumentChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onDirectionChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onDocumentDateChange: (value: string) => void;
    onStarredChange: (value: boolean) => void;
}

export default function DocumentDetailsForm({
    title,
    noDocument,
    category,
    direction,
    description,
    documentDate,
    categories,
    directions,
    starred,
    validationErrors,
    isSubmitting,
    mode,
    handleSubmit,
    onTitleChange,
    onNoDocumentChange,
    onCategoryChange,
    onDirectionChange,
    onDescriptionChange,
    onDocumentDateChange,
    onStarredChange,
}: DocumentDetailsFormProps) {
    return (
        <div className="h-full">
            <div className="sticky top-24">
                <Card>
                    <CardBody className="flex flex-col gap-4 p-6">
                        <div className="flex flex-row items-start justify-between">
                            <div>
                                <h3 className="mb-1 text-lg font-semibold text-default-700">
                                    Detail Dokumen
                                </h3>
                                <p className="text-xs text-default-500">
                                    Detail berlaku untuk file yang sedang
                                    dipilih.
                                </p>
                            </div>
                            <Button
                                isIconOnly
                                variant="light"
                                onPress={() => onStarredChange(!starred)}
                            >
                                {starred ? (
                                    <Star
                                        className="size-5 text-[#ede05d]"
                                        fill="#ede05d"
                                    />
                                ) : (
                                    <Star className="size-5" />
                                )}
                            </Button>
                        </div>

                        <Input
                            label="Nomor Dokumen"
                            labelPlacement="outside"
                            placeholder="xxx"
                            isRequired
                            value={noDocument}
                            onValueChange={onNoDocumentChange}
                            variant="bordered"
                            isInvalid={!!validationErrors.no_document}
                            errorMessage={validationErrors.no_document}
                        />

                        <Input
                            label="Judul Dokumen"
                            labelPlacement="outside"
                            placeholder="Dokumen A..."
                            isRequired
                            value={title}
                            onValueChange={onTitleChange}
                            variant="bordered"
                            isInvalid={!!validationErrors.title}
                            errorMessage={validationErrors.title}
                        />

                        <Autocomplete
                            label="Kategori"
                            labelPlacement="outside"
                            placeholder="Cari kategori..."
                            variant="bordered"
                            selectedKey={category}
                            onSelectionChange={(key) => {
                                if (key == null) return;
                                const categoryValue = key.toString();
                                onCategoryChange(categoryValue);
                            }}
                            isRequired
                            isInvalid={!!validationErrors.category_id}
                            errorMessage={validationErrors.category_id}
                            startContent={
                                category &&
                                (() => {
                                    const selected = categories.find(
                                        (c) => c.category === category,
                                    );
                                    if (selected === undefined) return null;
                                    return selected.icon_url ? (
                                        <Avatar
                                            className="size-4 rounded-md"
                                            src={selected.icon_url}
                                            alt={initialsName(
                                                selected.category,
                                            )}
                                        />
                                    ) : (
                                        <span className="size-4 text-center text-sm font-semibold text-nowrap text-primary-600">
                                            {initialsName(selected.category)}
                                        </span>
                                    );
                                })()
                            }
                        >
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
                                                {initialsName(
                                                    category.category,
                                                )}
                                            </span>
                                        )
                                    }
                                >
                                    {category.category}
                                </AutocompleteItem>
                            ))}
                        </Autocomplete>

                        <Select
                            label="Arah"
                            labelPlacement="outside"
                            placeholder="Masuk/Keluar"
                            variant="bordered"
                            isRequired
                            defaultSelectedKeys={[direction]}
                            onSelectionChange={(keys) => {
                                const selected =
                                    Array.from(keys)[0]?.toString() || '';
                                onDirectionChange(selected);
                            }}
                            isInvalid={!!validationErrors.direction}
                            errorMessage={validationErrors.direction}
                        >
                            {directions.map((dir) => (
                                <SelectItem key={dir.direction}>
                                    {dir.direction}
                                </SelectItem>
                            ))}
                        </Select>

                        <DatePicker
                            label="Tanggal Dokumen"
                            labelPlacement="outside"
                            showMonthAndYearPickers
                            isRequired
                            variant="bordered"
                            isInvalid={!!validationErrors.document_date}
                            errorMessage={validationErrors.document_date}
                            defaultValue={parseDate(documentDate)}
                            onChange={(date) => {
                                onDocumentDateChange(date?.toString() || '');
                            }}
                        />

                        <Textarea
                            label="Deskripsi"
                            labelPlacement="outside"
                            placeholder="Berikan deskripsi singkat tentang isi dokumen ini..."
                            value={description}
                            onValueChange={onDescriptionChange}
                            variant="bordered"
                            minRows={4}
                            isInvalid={!!validationErrors.description}
                            errorMessage={validationErrors.description}
                        />
                    </CardBody>
                </Card>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-end gap-3">
                    <Button
                        variant="bordered"
                        onPress={() => window.history.back()}
                        isDisabled={isSubmitting}
                        startContent={<X className="size-4" />}
                    >
                        Batal
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSubmit}
                        isDisabled={isSubmitting}
                        isLoading={isSubmitting}
                        startContent={
                            isSubmitting ? null : mode === 'edit' ? (
                                <Save className="size-4" />
                            ) : (
                                <Upload className="size-4" />
                            )
                        }
                    >
                        {isSubmitting
                            ? 'Uploading...'
                            : mode === 'edit'
                              ? 'Perbarui'
                              : 'Upload'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
