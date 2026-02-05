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
import { Copy, Edit2 } from 'lucide-react';
import { initialsName } from '@/lib/utils';
import { index as editRoute } from '@/routes/document/edit';
import type { Document } from '@/types/models';

interface DocumentDetailsViewProps {
    document: Document;
}

export default function DocumentDetailsView({
    document,
}: DocumentDetailsViewProps) {
    return (
        <Card>
            <CardBody className="flex flex-col gap-4 p-6">
                <div className="flex flex-row items-start justify-between">
                    <div>
                        <h3 className="mb-1 text-lg font-semibold text-default-700">
                            {document.title}
                        </h3>
                        <p className="text-sm text-default-500">
                            Tanggal dokumen:{' '}
                            {new Intl.DateTimeFormat('id-ID', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }).format(new Date(document.document_date))}
                        </p>
                        <p className="text-sm text-default-500">
                            Terakhir dirubah:{' '}
                            {new Intl.DateTimeFormat('id-ID', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }).format(
                                new Date(
                                    document.updated_at ?? document.created_at,
                                ),
                            )}
                        </p>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                        <Button
                            variant="flat"
                            onPress={() =>
                                router.visit(editRoute.url(document.id))
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
                                {document.category.icon_url ? (
                                    <Avatar
                                        className="size-4 rounded-md"
                                        src={document.category.icon_url}
                                        alt={initialsName(
                                            document.category.category,
                                        )}
                                    />
                                ) : (
                                    <span className="-mt-1 size-4 text-center text-sm font-semibold text-nowrap text-primary-600">
                                        {initialsName(
                                            document.category.category,
                                        )}
                                    </span>
                                )}
                                <p>{document.category.category}</p>
                            </div>
                        </Chip>

                        <Chip
                            variant="flat"
                            color={
                                document.category.direction == 'Masuk'
                                    ? 'success'
                                    : 'danger'
                            }
                        >
                            {document.category.direction}
                        </Chip>
                    </div>
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
                                const textToCopy = document.description || '';
                                if (
                                    typeof navigator !== 'undefined' &&
                                    typeof navigator.clipboard !== 'undefined'
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
    );
}
