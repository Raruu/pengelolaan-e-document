import { Button, Card, CardBody, Divider } from '@heroui/react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { getFileIcon } from '@/components/FileIcon';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { DocumentFile } from '@/types/models';
import type { TrashDocument } from '@/types/models/trash';

interface DeletedFilesListViewProps {
    files: DocumentFile[];
    type: TrashDocument['deletion_type'];
    loading: boolean;
    onRestore: (doc: DocumentFile) => void;
    onDelete: (doc: DocumentFile) => void;
}

export default function DeletedFilesListView({
    files,
    type,
    loading,
    onRestore,
    onDelete,
}: DeletedFilesListViewProps) {
    return (
        <Card>
            <CardBody className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-default-700">
                            File yang Dihapus
                        </h3>
                        <p className="text-sm text-default-500">
                            {files.length} file telah dihapus
                        </p>
                    </div>
                </div>

                {files.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {files.map((file, index) => (
                            <div key={file.id}>
                                {index > 0 && <Divider className="mb-3" />}
                                <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-row items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-default-100">
                                            {getFileIcon(file.filename)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-default-700">
                                                {file.filename}
                                            </p>
                                            <div className="flex flex-row items-center gap-1 text-xs text-default-500">
                                                {formatFileSize(file.size)}
                                                <span>•</span>
                                                <span>
                                                    Dihapus:{' '}
                                                    {formatDate(
                                                        file.deleted_at || '',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {type === 'partial' && (
                                            <>
                                                <Button
                                                    color="success"
                                                    variant="flat"
                                                    size="sm"
                                                    startContent={
                                                        <RotateCcw className="h-4 w-4" />
                                                    }
                                                    onPress={() =>
                                                        onRestore(file)
                                                    }
                                                    isLoading={loading}
                                                >
                                                    Pulihkan
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    variant="flat"
                                                    size="sm"
                                                    startContent={
                                                        <Trash2 className="h-4 w-4" />
                                                    }
                                                    onPress={() =>
                                                        onDelete(file)
                                                    }
                                                    isLoading={loading}
                                                >
                                                    Hapus
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-32 items-center justify-center text-default-400">
                        Tidak ada file yang dihapus
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
