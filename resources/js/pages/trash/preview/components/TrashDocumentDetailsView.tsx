import {
    addToast,
    Button,
    Card,
    CardBody,
    Chip,
    Textarea,
} from '@heroui/react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Copy, RotateCcw, Star, Trash2 } from 'lucide-react';
import { ChipKategori } from '@/components/ChipKategori';
import { formatDate } from '@/lib/utils';
import { index as trashIndex } from '@/routes/trash';
import type { TrashDocument } from '@/types/models/trash';

interface TrashDocumentDetailsViewProps {
    document: TrashDocument;
    loading: boolean;
    handleRestoreDocument: () => void;
    handleDeleteDocument: () => void;
}

export default function TrashDocumentDetailsView({
    document,
    loading,
    handleRestoreDocument,
    handleDeleteDocument,
}: TrashDocumentDetailsViewProps) {
    return (
        <div className="h-full">
            <div className="sticky top-24">
                <Card>
                    <CardBody className="flex flex-col gap-4 p-6">
                        <div className="flex flex-row items-start justify-between">
                            <div>
                                <p className="text-sm text-foreground">
                                    No. Dokumen: {document.no_document}
                                </p>
                                <h3 className="mb-1 text-lg font-semibold text-default-700">
                                    {document.title}
                                </h3>
                                <p className="text-sm text-default-500">
                                    Tanggal dokumen:{' '}
                                    {formatDate(
                                        document.document_date || '',
                                        false,
                                    )}
                                </p>

                                <p className="text-sm text-danger-500">
                                    Dihapus pada:{' '}
                                    {formatDate(document.deleted_at || '')}
                                </p>
                            </div>
                            {document.starred && (
                                <Star
                                    className="size-6 text-[#ede05d]"
                                    fill="#ede05d"
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <h4 className="text-sm">Kategori</h4>
                            <ChipKategori category={document.category} />
                        </div>

                        <Textarea
                            label="Deskripsi"
                            labelPlacement="outside"
                            placeholder="Opsional"
                            isReadOnly
                            value={document.description || ''}
                            variant="flat"
                            minRows={4}
                            maxRows={6}
                            endContent={
                                <Button
                                    isIconOnly
                                    size="sm"
                                    onPress={async () => {
                                        const textToCopy =
                                            document.description || '';
                                        if (
                                            typeof navigator !== 'undefined' &&
                                            typeof navigator.clipboard !==
                                                'undefined'
                                        ) {
                                            try {
                                                await navigator.clipboard.writeText(
                                                    textToCopy,
                                                );
                                                addToast({
                                                    title: 'Berhasil disalin',
                                                    description:
                                                        'Tersalin di clipboard',
                                                    timeout: 1000,
                                                    shouldShowTimeoutProgress: true,
                                                    color: 'success',
                                                });
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                            } catch (_) {
                                                addToast({
                                                    title: 'Gagal disalin',
                                                    description:
                                                        'Gagal menyalin teks di clipboard',
                                                    timeout: 3000,
                                                    shouldShowTimeoutProgress: true,
                                                });
                                            }
                                        }
                                    }}
                                >
                                    <Copy className="size-3" />
                                </Button>
                            }
                        />

                        <div className="flex flex-col gap-4">
                            {/* Deletion Status */}
                            <div className="flex flex-col gap-2">
                                <h4 className="text-sm">Jenis Penghapusan</h4>
                                <div className="flex flex-col gap-2">
                                    <Chip
                                        variant="flat"
                                        color={
                                            document.deletion_type === 'full'
                                                ? 'danger'
                                                : 'warning'
                                        }
                                    >
                                        {document.deletion_type === 'full'
                                            ? 'Dokumen'
                                            : 'Sebagian File'}
                                    </Chip>
                                    <p className="text-xs text-default-500">
                                        {document.deleted_files_count}/
                                        {document.total_files} file dihapus
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <div className="mt-4 flex justify-end gap-3">
                    <Button
                        color="default"
                        variant="flat"
                        startContent={<ArrowLeft className="h-4 w-4" />}
                        onPress={() => router.visit(trashIndex.url())}
                    >
                        Kembali
                    </Button>
                    <Button
                        color="success"
                        variant="flat"
                        startContent={
                            !loading && <RotateCcw className="h-4 w-4" />
                        }
                        onPress={handleRestoreDocument}
                        isLoading={loading}
                    >
                        Pulihkan{' '}
                        {document.deletion_type === 'full'
                            ? 'Dokumen'
                            : 'Semua File'}
                    </Button>
                    <Button
                        color="danger"
                        variant="flat"
                        startContent={
                            !loading && <Trash2 className="h-4 w-4" />
                        }
                        onPress={handleDeleteDocument}
                        isLoading={loading}
                    >
                        Hapus Permanen
                    </Button>
                </div>
            </div>
        </div>
    );
}
