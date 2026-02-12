import { addToast, Button } from '@heroui/react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import Heading from '@/components/Heading';
import { defaultItems } from '@/lib/nav-items';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { usePreviewDialog } from '@/hooks/usePreviewDialog';
import { useSidebar } from '@/hooks/useSidebar';
import AppLayout from '@/layouts/app';
import { formatFileSize } from '@/lib/utils';
import { store, update, storeFile } from '@/routes/api/documents';
import { destroy as documentDestroy } from '@/routes/api/documents';
import { index as createRoute } from '@/routes/document/create';
import { index as editRoute } from '@/routes/document/edit';
import { index as previewRoute } from '@/routes/document/preview';
import { index as documentsIndex } from '@/routes/documents';
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
    const [starred, setStarred] = useState(document?.starred || false);

    const [dragActive, setDragActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

    const { confirm, DialogComponent: DialogComponentConfirm } =
        useConfirmDialog();
    const { preview, DialogComponent: DialogComponentPreview } =
        usePreviewDialog();
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

    const handleFiles = useCallback((files: File[]) => {
        const newFiles: UploadingFile[] = files.map((file) => ({
            id: `up-${Math.random().toString(36).substring(7)}`,
            file,
            progress: 0,
            status: 'wait upload',
        }));

        console.log(newFiles);

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

    const onHandlePreview = (file: UploadingFile) => {
        if (file.status === 'on server') {
            preview({
                url: file.uploadedData?.fileurl ?? '',
                filename: file.uploadedData?.filename ?? '',
                title: file.uploadedData?.filename ?? '',
                subtitle: formatFileSize(file.uploadedData?.size ?? 0),
            });
        } else if (file.file instanceof Blob) {
            const url = window.URL.createObjectURL(file.file);
            preview({
                url,
                filename: file.file.name,
                title: file.file.name,
                subtitle: formatFileSize(file.file.size),
            });
        }
    };

    const handleRemoveFile = async (file: UploadingFile) => {
        const yesDelete = await confirm({
            title: 'Anda yakin ingin menghapus file ini?',
            message: `File ${file.uploadedData?.filename || file.file.name} akan dihapus.`,
            variant: 'danger',
            noCancle: false,
            disabled: isSubmitting,
        });
        if (yesDelete) {
            setUploadingFiles((prev) =>
                prev.map((f) =>
                    f.id === file.id ? { ...f, status: 'deleted' } : f,
                ),
            );
        }
    };

    const uploadFile = async (
        fileId: string,
        file: File,
        documentId: string,
    ) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_id', documentId);

        try {
            const response = await axios.post(storeFile.url(), formData, {
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
                        prev.map((f) => {
                            return f.id === fileId
                                ? {
                                      ...f,
                                      progress,
                                      status: 'uploading',
                                  }
                                : f;
                        }),
                    );
                },
            });

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

        const nonDeletedFiles = uploadingFiles.filter(
            (file) => file.status !== 'deleted',
        );
        if (nonDeletedFiles.length === 0) {
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
        formData.append('starred', starred ? '1' : '0');

        if (description) {
            formData.append('description', description);
        }

        if (mode === 'edit') {
            const deletedFileIds = uploadingFiles
                .filter(
                    (file) =>
                        file.status === 'deleted' && file.uploadedData?.id,
                )
                .map((file) => file.uploadedData!.id);

            deletedFileIds.forEach((fileId) => {
                formData.append('deleted_files[]', String(fileId));
            });
        }

        try {
            const url =
                mode === 'edit' && document
                    ? update.url({ document: document.id })
                    : store.url();

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
                if (file.status === 'on server' || file.status === 'deleted')
                    continue;
                await uploadFile(file.id, file.file, documentId);
            }

            await confirm({
                title: 'Dokumen berhasil diupload',
                message: 'Dokumen berhasil diupload',
                variant: 'success',
                confirmText: 'OK',
                noCancle: true,
            });

            router.visit(previewRoute(response.data.document.id));
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

    const handleDeleteDocument = async (document: Document) => {
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `Apakah Anda yakin ingin menghapus permanen dokumen '${document.title}'? Aksi ini tidak dapat dibatalkan!`,
            variant: 'danger',
        });

        if (!yes) return;

        try {
            await axios.delete(documentDestroy.url(document.id), {
                data: {
                    id: document.id,
                    type: 'document',
                },
            });

            addToast({
                title: 'Dihapus!',
                description: `Dokumen ${document.title} berhasil dihapus!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'success',
            });
            router.visit(documentsIndex.url());
        } catch (error) {
            console.error('Error deleting document:', error);
            addToast({
                title: 'Gagal!',
                description: `Dokumen ${document.title} gagal dihapus!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'danger',
            });
        }
    };

    return (
        <AppLayout>
            <Head title={getPageTitle(mode)} />
            <div className="flex h-full flex-1 flex-col gap-6 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title={getPageTitle(mode)}
                    description="Upload dokumen Anda disini."
                    trailing={
                        mode === 'edit' && (
                            <Button
                                color="danger"
                                variant="flat"
                                startContent={<Trash2 className="h-4 w-4" />}
                                onPress={() => handleDeleteDocument(document!)}
                            >
                                Hapus Dokumen
                            </Button>
                        )
                    }
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
                            onHandlePreview={onHandlePreview}
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
                            starred={starred}
                            validationErrors={validationErrors}
                            isSubmitting={isSubmitting}
                            mode={mode}
                            handleSubmit={handleSubmit}
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
                            onStarredChange={(value) => setStarred(value)}
                        />
                    </div>
                </div>
            </div>
            {DialogComponentConfirm}
            {DialogComponentPreview}
        </AppLayout>
    );
}
