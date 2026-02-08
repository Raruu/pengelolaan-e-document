import { Card, CardBody, Button, Divider } from '@heroui/react';
import { Download, Eye } from 'lucide-react';
import { getFileIcon } from '@/components/FileIcon';
import { usePreviewDialog } from '@/hooks/usePreviewDialog';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { DocumentFile } from '@/types/models';

interface FilesListViewProps {
    files: DocumentFile[];
}

export default function FilesListView({ files }: FilesListViewProps) {
    const { preview, DialogComponent } = usePreviewDialog();

    if (files.length === 0) {
        return (
            <Card>
                <CardBody className="p-6">
                    <p className="text-center text-default-500">
                        Tidak ada file yang diupload
                    </p>
                </CardBody>
            </Card>
        );
    }

    const handlePreview = (file: DocumentFile) => {
        if (file.fileurl === undefined) return;
        preview({
            url: file.fileurl,
            filename: file.filename,
            title: file.filename,
            subtitle: formatFileSize(file.size),
        });
    };

    const handleDownload = (file: DocumentFile) => {
        if (file.fileurl) {
            const link = document.createElement('a');
            link.href = file.fileurl;
            link.setAttribute('download', file.filename);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <Card>
                <CardBody className="p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-default-700">
                            File Dokumen
                        </h3>
                        <p className="text-sm text-default-500">
                            {files.length} file tersedia
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {files.map((file, index) => (
                            <div key={file.id}>
                                {index > 0 && <Divider className="mb-3" />}
                                <div className="flex items-start gap-3 py-1">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-default-100">
                                        {getFileIcon(file.filename)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-default-700">
                                                    {file.filename}
                                                </p>
                                                <p className="text-xs text-default-500">
                                                    {formatFileSize(file.size)}{' '}
                                                    •{' '}
                                                    {formatDate(
                                                        file.uploaded_at || '',
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-row items-center gap-2">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="default"
                                                    onPress={() =>
                                                        handlePreview(file)
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="primary"
                                                    onPress={() =>
                                                        handleDownload(file)
                                                    }
                                                >
                                                    <Download className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
            {DialogComponent}
        </>
    );
}
