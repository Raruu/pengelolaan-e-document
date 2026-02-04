import {
    Avatar,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';
import { LucideFile, Plus, Save, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import MaterialCategoryRounded from '@/components/custom-icons/MaterialCategoryRounded';
import { useImageCrop } from '@/hooks/useImageCrop';
import { useImagePreview } from '@/hooks/useImagePreview';
import type { Category } from '@/types/models';

interface UseCategoryDialogReturn {
    openCategoryDialog: (
        category?: Category,
    ) => Promise<{ categoryData: Category; iconFile: File | null } | null>;
    DialogComponent: React.ReactNode;
}

const initialCategoryData: Category = {
    id: 0,
    category: '',
    direction: '',
    icon_path: null,
};

export function useCategoryDialog(): UseCategoryDialogReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [categoryData, setCategoryData] =
        useState<Category>(initialCategoryData);
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState<{ category?: string; icon?: string }>(
        {},
    );
    const [resolvePromise, setResolvePromise] = useState<
        | ((
              data: { categoryData: Category; iconFile: File | null } | null,
          ) => void)
        | null
    >(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const { preview, DialogComponent: PreviewDialog } = useImagePreview();
    const { cropImage, DialogComponent: CropDialog } = useImageCrop();

    const openDialog = (
        category?: Category,
    ): Promise<{ categoryData: Category; iconFile: File | null } | null> => {
        return new Promise((resolve) => {
            if (category) {
                setCategoryData(category);
                setIconPreview(category.icon_path);
                setIsEditMode(true);
            } else {
                setCategoryData(initialCategoryData);
                setIconPreview(null);
                setIsEditMode(false);
            }
            setIconFile(null);
            setErrors({});
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    };

    const handleClose = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(null);
        }
        setIsOpen(false);
        setCategoryData(initialCategoryData);
        setIconPreview(null);
        setIconFile(null);
        setErrors({});
        setResolvePromise(null);
        setIsEditMode(false);
    }, [resolvePromise]);

    const validateForm = useCallback(() => {
        const newErrors: { category?: string; icon?: string } = {};

        if (!categoryData.category.trim()) {
            newErrors.category = 'Nama kategori harus diisi';
        } else if (categoryData.category.length > 255) {
            newErrors.category = 'Nama kategori maksimal 255 karakter';
        }

        if (iconFile) {
            const maxSize = 2 * 1024 * 1024;
            if (iconFile.size > maxSize) {
                newErrors.icon = 'Ukuran file maksimal 2MB';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [categoryData, iconFile]);

    const handleSave = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        if (resolvePromise) {
            resolvePromise({ categoryData, iconFile });
        }
        handleClose();
    }, [categoryData, iconFile, validateForm, resolvePromise, handleClose]);

    const handleInputChange = (value: string) => {
        setCategoryData({ ...categoryData, category: value });
        if (errors.category) {
            setErrors({ ...errors, category: undefined });
        }
    };

    const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (errors.icon) {
                setErrors({ ...errors, icon: undefined });
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                const croppedFile = await cropImage(result);

                if (croppedFile) {
                    const croppedUrl = URL.createObjectURL(croppedFile);
                    setIconPreview(croppedUrl);
                    setIconFile(croppedFile);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const DialogComponent = (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="md"
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {isEditMode ? 'Edit Kategori' : 'Buat Kategori Baru'}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-6">
                        <div className="grid gap-4">
                            <div className="flex items-center gap-6">
                                <Avatar
                                    src={iconPreview || undefined}
                                    className="size-20 cursor-pointer bg-primary text-sm font-semibold text-white transition-opacity hover:opacity-80"
                                    radius="md"
                                    icon={<MaterialCategoryRounded />}
                                    onClick={() => {
                                        const url = iconPreview;
                                        if (url) {
                                            preview(
                                                url,
                                                `${categoryData.category}-icon.jpg`,
                                                'Ikon Kategori',
                                            );
                                        }
                                    }}
                                />
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="icon_path"
                                        className="group relative z-0 box-border inline-flex h-10 w-fit min-w-20 transform-gpu cursor-pointer appearance-none items-center justify-center gap-2 overflow-hidden rounded-medium border bg-background px-4 text-small font-normal whitespace-nowrap text-foreground subpixel-antialiased outline-transparent transition-transform-colors-opacity outline-solid select-none tap-highlight-transparent hover:bg-primary hover:text-white data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus data-[hover=true]:opacity-hover data-[pressed=true]:scale-[0.97] motion-reduce:transition-none [&>svg]:max-w-8"
                                    >
                                        <LucideFile className="size-4" />
                                        Pilih Ikon
                                    </label>
                                    <input
                                        id="icon_path"
                                        type="file"
                                        name="icon_path"
                                        accept="image/*"
                                        onChange={handleIconChange}
                                        className="hidden"
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        (Maks. 2MB setelah dicrop)
                                    </p>
                                    {errors.icon && (
                                        <p className="text-xs text-danger">
                                            {errors.icon}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Input
                            label="Nama Kategori"
                            placeholder="Masukkan nama kategori"
                            value={categoryData.category}
                            onValueChange={handleInputChange}
                            isInvalid={!!errors.category}
                            errorMessage={errors.category}
                            autoFocus
                            isRequired
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={handleClose}
                        startContent={<X className="size-4" />}
                    >
                        Batal
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        startContent={
                            isEditMode ? (
                                <Save className="size-4" />
                            ) : (
                                <Plus className="size-4" />
                            )
                        }
                    >
                        {isEditMode ? 'Simpan' : 'Buat'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return {
        openCategoryDialog: openDialog,
        DialogComponent: (
            <>
                {DialogComponent}
                {PreviewDialog}
                {CropDialog}
            </>
        ),
    };
}
