import { Button, Divider, Progress } from '@heroui/react';
import { CheckCircle, Eye, FileText, LucideImage, Trash2 } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { UploadingFile } from '@/types/models';

interface UploadedFileItemProps {
    uploadFile: UploadingFile;
    isSubmitting: boolean;
    showDivider: boolean;
    handlePreview: (file: UploadingFile) => void;
    onRemove: (file: UploadingFile) => void;
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'docs' || ext === 'pdf' || ext === 'doc' || ext === 'docx') {
        return <FileText className="size-5 text-primary-500" />;
    } else {
        return <LucideImage className="size-5 text-danger-300" />;
    }
};

export default function UploadedFileItem({
    uploadFile,
    isSubmitting,
    showDivider,
    handlePreview,
    onRemove,
}: UploadedFileItemProps) {
    return (
        <div>
            {showDivider && <Divider className="mb-3" />}
            <div className="flex items-start gap-3 py-1">
                <div className="mt-1 shrink-0">
                    {getFileIcon(uploadFile.file.name)}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-default-700">
                                {uploadFile.file.name}
                            </p>
                            <p className="text-xs text-default-500">
                                {formatFileSize(
                                    uploadFile.uploadedData?.size ??
                                        uploadFile.file.size,
                                )}{' '}
                                •{' '}
                                {uploadFile.status === 'on server'
                                    ? formatDate(
                                          uploadFile.uploadedData!.uploaded_at!,
                                      )
                                    : uploadFile.status === 'uploaded'
                                      ? 'Upload Selesai'
                                      : isSubmitting
                                        ? `${uploadFile.progress}% mengupload`
                                        : 'Menunggu Upload...'}
                            </p>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="default"
                                onPress={() => handlePreview(uploadFile)}
                            >
                                <Eye className="size-4" />
                            </Button>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                className="text-foreground-800"
                                onPress={() => onRemove(uploadFile)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                    {uploadFile.status === 'uploaded' ? (
                        <div className="mt-2 flex items-center gap-2">
                            <CheckCircle className="size-4 text-success-500" />
                            <span className="text-xs text-success-500">
                                Upload Selesai
                            </span>
                        </div>
                    ) : isSubmitting && uploadFile.status === 'uploading' ? (
                        <Progress
                            value={uploadFile.progress}
                            className="mt-2"
                            color="primary"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
