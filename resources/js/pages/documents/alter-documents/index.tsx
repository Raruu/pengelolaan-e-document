import { Button } from '@heroui/react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { X, Upload, Save } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import Heading from '@/components/Heading';
import { defaultItems } from '@/constants/nav-items';
import { useSidebar } from '@/hooks/SidebarContext';
import AppLayout from '@/layouts/app';
import { index as createRoute } from '@/routes/document/create';
import { index as editRoute } from '@/routes/document/edit';
import type {
    Category,
    Document,
    DocumentFile,
    UploadingFile,
} from '@/types/models';
import DocumentDetailsForm from './components/DocumentDetailsForm';
import FileUploadZone from './components/FileUploadZone';
import UploadedFilesList from './components/UploadedFilesList';

interface Props {
    categories: Category[];
    directions: { direction: string }[];
    document?: Document;
    files?: DocumentFile[];
    mode?: 'create' | 'edit';
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

    const getPageTitle = (mode: Props['mode']) =>
        mode === 'edit' ? 'Edit Dokument' : 'Upload Dokumen';

    const clearValidationError = (field: string) => {
        setValidationErrors((prev) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    };

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
                        <FileUploadZone
                            dragActive={dragActive}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onFileSelect={handleFiles}
                        />

                        <UploadedFilesList
                            uploadingFiles={uploadingFiles}
                            isSubmitting={isSubmitting}
                            validationError={validationErrors.files}
                            onRemoveFile={handleRemoveFile}
                        />
                    </div>

                    {/* Right Side - Document Details */}
                    <div className="lg:flex-3">
                        <DocumentDetailsForm
                            title={title}
                            category={category}
                            direction={direction}
                            description={description}
                            documentDate={documentDate}
                            categories={categories}
                            directions={directions}
                            validationErrors={validationErrors}
                            onTitleChange={(value) => {
                                setTitle(value);
                                if (validationErrors.title) {
                                    clearValidationError('title');
                                }
                            }}
                            onCategoryChange={(value) => {
                                setCategory(value);
                                if (validationErrors.category_id) {
                                    clearValidationError('category_id');
                                }
                            }}
                            onDirectionChange={(value) => {
                                setDirection(value);
                                if (validationErrors.direction) {
                                    clearValidationError('direction');
                                }
                            }}
                            onDescriptionChange={(value) => {
                                setDescription(value);
                                if (validationErrors.description) {
                                    clearValidationError('description');
                                }
                            }}
                            onDocumentDateChange={(value) => {
                                setDocumentDate(value);
                                if (validationErrors.document_date) {
                                    clearValidationError('document_date');
                                }
                            }}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-4">
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
                                    !isSubmitting && mode === 'edit' ? (
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
            </div>
        </AppLayout>
    );
}
