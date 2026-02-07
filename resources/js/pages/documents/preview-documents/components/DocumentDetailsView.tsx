import {
    Card,
    CardBody,
    Textarea,
    Avatar,
    Chip,
    Button,
    addToast,
} from '@heroui/react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Copy, Download, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { downloadAllDocument } from '@/lib/donwload-all';
import { initialsName } from '@/lib/utils';
import { index as editRoute } from '@/routes/document/edit';
import { index as documentsIndex } from '@/routes/documents';
import type { Document } from '@/types/models';

interface DocumentDetailsViewProps {
    document: Document;
}

export default function DocumentDetailsView({
    document: theDocument,
}: DocumentDetailsViewProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    return (
        <div className="h-full">
            <div className="sticky top-24">
                <Card>
                    <CardBody className="flex flex-col gap-4 p-6">
                        <div className="flex flex-row items-start justify-between">
                            <div>
                                <h3 className="mb-1 text-lg font-semibold text-default-700">
                                    {theDocument.title}
                                </h3>
                                <p className="text-sm text-default-500">
                                    Tanggal dokumen:{' '}
                                    {new Intl.DateTimeFormat('id-ID', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }).format(
                                        new Date(theDocument.document_date),
                                    )}
                                </p>
                                <p className="text-sm text-default-500">
                                    Terakhir dirubah:{' '}
                                    {new Intl.DateTimeFormat('id-ID', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }).format(
                                        new Date(
                                            theDocument.updated_at ??
                                                theDocument.created_at,
                                        ),
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-row items-center gap-2">
                                <Button
                                    variant="flat"
                                    onPress={() =>
                                        router.visit(
                                            editRoute.url(theDocument.id),
                                        )
                                    }
                                >
                                    <Edit2 className="mt-0.5 mr-1 size-4" />
                                    Edit
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h4 className="text-sm">Kategori</h4>
                            <div className="flex flex-row items-center gap-2">
                                <Chip variant="flat" color="default">
                                    <div className="flex flex-row items-center gap-1">
                                        {theDocument.category.icon_url ? (
                                            <Avatar
                                                className="size-4 rounded-md"
                                                src={
                                                    theDocument.category
                                                        .icon_url
                                                }
                                                alt={initialsName(
                                                    theDocument.category
                                                        .category,
                                                )}
                                            />
                                        ) : (
                                            <span className="-mt-1 size-4 text-center text-sm font-semibold text-nowrap text-primary-600">
                                                {initialsName(
                                                    theDocument.category
                                                        .category,
                                                )}
                                            </span>
                                        )}
                                        <p>{theDocument.category.category}</p>
                                    </div>
                                </Chip>

                                <Chip
                                    variant="flat"
                                    color={
                                        theDocument.category.direction ==
                                        'Masuk'
                                            ? 'success'
                                            : 'danger'
                                    }
                                >
                                    {theDocument.category.direction}
                                </Chip>
                            </div>
                        </div>

                        <Textarea
                            label="Deskripsi"
                            labelPlacement="outside"
                            placeholder="Opsional"
                            isReadOnly
                            value={theDocument.description || ''}
                            variant="flat"
                            minRows={4}
                            maxRows={6}
                            endContent={
                                <Button
                                    isIconOnly
                                    size="sm"
                                    onPress={async () => {
                                        const textToCopy =
                                            theDocument.description || '';
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
                    </CardBody>
                </Card>
                {/* Action Buttons */}
                <div className="mt-4 flex justify-end gap-3">
                    <Button
                        variant="bordered"
                        onPress={() => router.visit(documentsIndex.url())}
                        startContent={<ArrowLeft className="mt-0.5 size-4" />}
                    >
                        Kembali
                    </Button>
                    <Button
                        color="primary"
                        startContent={
                            isDownloading ? null : (
                                <Download className="size-4" />
                            )
                        }
                        onPress={() =>
                            downloadAllDocument({
                                theDocument,
                                onStart() {
                                    setIsDownloading(true);
                                },
                                onEnd() {
                                    setIsDownloading(false);
                                },
                            })
                        }
                        isLoading={isDownloading}
                        isDisabled={isDownloading}
                    >
                        {isDownloading ? 'Mengunduh...' : 'Download Semua'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
