import {
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
    Textarea,
    Progress,
    Divider,
    DatePicker,
    Autocomplete,
    AutocompleteItem,
    Avatar,
} from '@heroui/react';
import { Head } from '@inertiajs/react';
import { parseDate } from '@internationalized/date';
import axios from 'axios';
import {
    Upload,
    X,
    FileText,
    CheckCircle,
    AlertCircle,
    LucideImage,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import Heading from '@/components/Heading';
import { defaultItems } from '@/constants/nav-items';
import { useSidebar } from '@/hooks/SidebarContext';
import AppLayout from '@/layouts/app';
import { formatFileSize, initialsName } from '@/lib/utils';
import { index as createRoute } from '@/routes/document/create';
import { index as editRoute } from '@/routes/document/edit';
import type { Category, Document } from '@/types/models';

interface Props {
    categories: Category[];
    directions: { direction: string }[];
    document?: Document;
    files?: UploadedFileData[];
    mode?: 'create' | 'edit';
}

interface UploadedFileData {
    id: number;
    filename: string;
    size: number;
    mime_type: string;
    path?: string;
    fileurl?: string;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'uploaded' | 'error' | 'on server';
    uploadedData?: UploadedFileData;
}

export default function AlterDocuments({
    categories,
    directions,
    document,
    files,
    mode = 'create',
}: Props) {
    const [title, setTitle] = useState(document?.title || '');
    const [category, setCategory] = useState<string>(
        document?.category.category || '',
    );
    const [direction, setDirection] = useState<string>(
        document?.category.direction || '',
    );
    const [description, setDescription] = useState(document?.description || '');
    const [documentDate, setDocumentDate] = useState(
        document?.document_date
            ? document.document_date.split('T')[0]
            : new Date().toISOString().split('T')[0],
    );

    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>(
        files?.map<UploadingFile>((file) => {
            return {
                id: String(file.id),
                file: new File([], file.filename),
                progress: 100,
                status: 'on server',
                uploadedData: file,
            };
        }) || [],
    );
    const [dragActive, setDragActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { setNavItems } = useSidebar();

    useEffect(() => {
        const custom = defaultItems.map((item) => ({ ...item }));
        custom[1] = {
            ...custom[1],
            subItems: [
                { name: defaultItems[1].name, href: defaultItems[1].href },
                {
                    name: mode === 'edit' ? 'Edit' : 'Upload',
                    href:
                        mode === 'edit'
                            ? editRoute.url(document!.id)
                            : createRoute.url(),
                },
            ],
        };
        setNavItems(custom);
    }, [document, mode, setNavItems]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const uploadFile = useCallback(
        async (fileId: string, file: File, documentId: string) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('document_id', documentId);

            try {
                const response = await axios.post(
                    '/api/documents/file',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        onUploadProgress: (progressEvent) => {
                            const progress = progressEvent.total
                                ? Math.round(
                                      (progressEvent.loaded * 100) /
                                          progressEvent.total,
                                  )
                                : 0;
                            setUploadingFiles((prev) =>
                                prev.map((f) =>
                                    f.id === fileId
                                        ? {
                                              ...f,
                                              progress,
                                              status: 'uploading',
                                          }
                                        : f,
                                ),
                            );
                        },
                    },
                );

                setUploadingFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId
                            ? {
                                  ...f,
                                  progress: 100,
                                  status: 'uploaded',
                                  uploadedData: response.data.data,
                              }
                            : f,
                    ),
                );
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setUploadingFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId ? { ...f, status: 'error' } : f,
                    ),
                );
            }
        },
        [],
    );

    const handleFiles = useCallback((files: File[]) => {
        const newFiles: UploadingFile[] = files.map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
            progress: 0,
            status: 'uploading',
        }));

        setUploadingFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFiles(Array.from(e.dataTransfer.files));
            }
        },
        [handleFiles],
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (fileId: string) => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const handleSubmit = async () => {
        setValidationErrors({});

        const errors: Record<string, string> = {};

        if (!title.trim()) {
            errors.title = 'Judul dokumen harus diisi';
        }
        if (!category) {
            errors.category_id = 'Silakan pilih kategori';
        }
        if (!direction) {
            errors.direction = 'Silakan pilih arah dokumen';
        }
        if (!documentDate) {
            errors.document_date = 'Tanggal dokumen harus diisi';
        }
        if (uploadingFiles.length === 0 && mode === 'create') {
            errors.files = 'Silakan unggah setidak kurang satu file';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('direction', direction);
        formData.append('document_date', documentDate);

        if (description) {
            formData.append('description', description);
        }

        try {
            const url =
                mode === 'edit' && document
                    ? `/api/documents/${document.id}`
                    : '/api/documents';

            if (mode === 'edit' && document) {
                formData.append('_method', 'PUT');
            }

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const documentId = response.data.document.id;

            for (const file of uploadingFiles) {
                if (file.status === 'on server') continue;
                uploadFile(file.id, file.file, documentId);
            }

            // router.visit(response.data.redirect || '/documents', {
            //     preserveScroll: true,
            // });
            console.log(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 422) {
                    setValidationErrors(error.response.data.errors || {});
                } else if (error.response.status === 302) {
                    console.error('302 Redirect detected:', error.response);
                } else {
                    console.error('Error submitting document:', error.response);
                    setValidationErrors({
                        general:
                            error.response.data.message || 'Terjadi kesalahan',
                    });
                }
            } else {
                console.error('Network error:', error);
                setValidationErrors({
                    general: 'Terjadi kesalahan jaringan',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFileIcon = (filename: string) => {
        console.log(filename);
        const ext = filename.split('.').pop()?.toLowerCase();
        console.log(ext);
        if (
            ext === 'docs' ||
            ext === 'pdf' ||
            ext === 'doc' ||
            ext === 'docx'
        ) {
            return <FileText className="size-5 text-primary-500" />;
        } else {
            return <LucideImage className="size-5 text-danger-300" />;
        }
    };

    const getPageTitle = (mode: Props['mode']) =>
        mode === 'edit' ? 'Edit Dokument' : 'Upload Dokumen';

    return (
        <AppLayout>
            <Head title={getPageTitle(mode)} />
            <div className="flex h-full flex-1 flex-col gap-6 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title={getPageTitle(mode)}
                    description="Upload dokumen Anda disini."
                />

                {/* Main Content */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left Side - File Upload */}
                    <div className="flex flex-col gap-8 lg:flex-4">
                        <div
                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 shadow-medium transition-colors ${
                                dragActive
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-default-300 bg-content1'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                                <Upload className="h-8 w-8 text-primary-600" />
                            </div>

                            <h3 className="mb-2 text-lg font-semibold text-default-700">
                                Tarik & drop file disini
                            </h3>
                            <p className="mb-4 text-sm text-default-500">
                                atau klik untuk memilih file
                            </p>
                            <p className="mb-6 text-xs text-default-400">
                                Dokumen dan gambar (up to 25MB)
                            </p>

                            <Button
                                color="primary"
                                variant="flat"
                                onPress={() => fileInputRef.current?.click()}
                            >
                                Pilih file
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                        </div>

                        <Card>
                            <CardBody className="p-6">
                                {/* List Uploads Section */}
                                {uploadingFiles.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="mb-3 text-sm font-semibold text-default-500 uppercase">
                                            Daftar dokumen
                                        </h4>
                                        <div className="space-y-3">
                                            {uploadingFiles.map(
                                                (uploadFile, index) => (
                                                    <div key={uploadFile.id}>
                                                        {index > 0 && (
                                                            <Divider className="mb-3" />
                                                        )}
                                                        <div className="flex items-start gap-3 py-1">
                                                            <div className="mt-1 shrink-0">
                                                                {getFileIcon(
                                                                    uploadFile
                                                                        .file
                                                                        .name,
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-default-700">
                                                                            {
                                                                                uploadFile
                                                                                    .file
                                                                                    .name
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-default-500">
                                                                            {uploadFile.status ===
                                                                            'on server' ? (
                                                                                <>
                                                                                    {formatFileSize(
                                                                                        uploadFile
                                                                                            .uploadedData
                                                                                            ?.size ||
                                                                                            0,
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    {formatFileSize(
                                                                                        uploadFile
                                                                                            .file
                                                                                            .size,
                                                                                    )}{' '}
                                                                                    •{' '}
                                                                                    {uploadFile.status ===
                                                                                    'uploaded'
                                                                                        ? 'Upload Selesai'
                                                                                        : isSubmitting
                                                                                          ? `${uploadFile.progress}% mengupload`
                                                                                          : 'Menunggu Upload...'}
                                                                                </>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="light"
                                                                        color="danger"
                                                                        className="text-foreground-800"
                                                                        onPress={() =>
                                                                            handleRemoveFile(
                                                                                uploadFile.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <X className="size-4" />
                                                                    </Button>
                                                                </div>
                                                                {uploadFile.status ===
                                                                'uploaded' ? (
                                                                    <div className="mt-2 flex items-center gap-2">
                                                                        <CheckCircle className="size-4 text-success-500" />
                                                                        <span className="text-xs text-success-500">
                                                                            Complete
                                                                        </span>
                                                                    </div>
                                                                ) : isSubmitting &&
                                                                  uploadFile.status ===
                                                                      'uploading' ? (
                                                                    <Progress
                                                                        value={
                                                                            uploadFile.progress
                                                                        }
                                                                        className="mt-2"
                                                                        color="primary"
                                                                    />
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {uploadingFiles.length < 1 && (
                                    <>
                                        <h4 className="mb-3 text-sm font-semibold text-default-500 uppercase">
                                            Daftar dokumen
                                        </h4>

                                        {/* Files Error */}
                                        {validationErrors.files ? (
                                            <div className="m-2 flex items-start gap-2 rounded-lg bg-danger-50 p-3 text-danger-600">
                                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                                <p className="text-sm">
                                                    {validationErrors.files}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-foreground-10 m-2 flex items-start gap-2 rounded-lg bg-primary-50 p-3">
                                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                                <p className="text-sm">
                                                    Upload setidaknya 1 dokumen
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Right Side - Document Details */}
                    <div className="lg:flex-3">
                        <Card className="h-full">
                            <CardBody className="flex flex-col gap-4 p-6">
                                <div>
                                    <h3 className="mb-1 text-lg font-semibold text-default-700">
                                        Detail Dokumen
                                    </h3>
                                    <p className="text-xs text-default-500">
                                        Detail berlaku untuk file yang sedang
                                        dipilih.
                                    </p>
                                </div>

                                <Input
                                    label="Judul Dokumen"
                                    labelPlacement="outside"
                                    placeholder="Dokumen A..."
                                    isRequired
                                    value={title}
                                    onValueChange={(value) => {
                                        setTitle(value);
                                        if (validationErrors.title) {
                                            setValidationErrors((prev) => {
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                const { title, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
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
                                        setCategory(categoryValue);
                                        if (validationErrors.category_id) {
                                            setValidationErrors((prev) => {
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                const { category_id, ...rest } =
                                                    prev;
                                                return rest;
                                            });
                                        }
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
                                            if (selected === undefined)
                                                return null;
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
                                                    {initialsName(
                                                        selected.category,
                                                    )}
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
                                            Array.from(keys)[0]?.toString() ||
                                            '';
                                        setDirection(selected);
                                        if (validationErrors.direction) {
                                            setValidationErrors((prev) => {
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                const { direction, ...rest } =
                                                    prev;
                                                return rest;
                                            });
                                        }
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
                                    errorMessage={
                                        validationErrors.document_date
                                    }
                                    defaultValue={parseDate(documentDate)}
                                    onChange={(date) => {
                                        setDocumentDate(date?.toString() || '');
                                        if (validationErrors.document_date) {
                                            setValidationErrors((prev) => {
                                                const {
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    document_date,
                                                    ...rest
                                                } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                />

                                <Textarea
                                    label="Deskripsi"
                                    labelPlacement="outside"
                                    placeholder="Berikan deskripsi singkat tentang isi dokumen ini..."
                                    value={description}
                                    onValueChange={(value) => {
                                        setDescription(value);
                                        if (validationErrors.description) {
                                            setValidationErrors((prev) => {
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                const { description, ...rest } =
                                                    prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                    variant="bordered"
                                    minRows={4}
                                    isInvalid={!!validationErrors.description}
                                    errorMessage={validationErrors.description}
                                />
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
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
                            !isSubmitting && <CheckCircle className="size-4" />
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
        </AppLayout>
    );
}
