import { Card, CardBody, Button, Divider } from '@heroui/react';
import { FileText, LucideImage, Download } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import type { DocumentFile } from '@/types/models';

interface FilesListViewProps {
    files: DocumentFile[];
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'docs' || ext === 'pdf' || ext === 'doc' || ext === 'docx') {
        return <FileText className="size-5 text-primary-500" />;
    } else {
        return <LucideImage className="size-5 text-danger-300" />;
    }
};

export default function FilesListView({ files }: FilesListViewProps) {
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

    return (
        <Card>
            <CardBody className="p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-default-700">
                        File Dokumen
                    </h3>
                    <p className="text-xs text-default-500">
                        {files.length} file tersedia
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {files.map((file, index) => (
                        <div key={file.id}>
                            {index > 0 && <Divider className="mb-3" />}
                            <div className="flex items-start gap-3 py-1">
                                <div className="mt-1 shrink-0">
                                    {getFileIcon(file.filename)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-default-700">
                                                {file.filename}
                                            </p>
                                            <p className="text-xs text-default-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="primary"
                                            onPress={() => {
                                                // Handle download
                                                if (file.fileurl) {
                                                    window.open(
                                                        file.fileurl,
                                                        '_blank',
                                                    );
                                                }
                                            }}
                                        >
                                            <Download className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
