import { Card, CardBody } from '@heroui/react';
import { AlertCircle } from 'lucide-react';
import UploadedFileItem from './UploadedFileItem';

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

interface UploadedFilesListProps {
    uploadingFiles: UploadingFile[];
    isSubmitting: boolean;
    validationError?: string;
    onRemoveFile: (fileId: string) => void;
}

export default function UploadedFilesList({
    uploadingFiles,
    isSubmitting,
    validationError,
    onRemoveFile,
}: UploadedFilesListProps) {
    return (
        <Card>
            <CardBody className="p-6">
                {uploadingFiles.length > 0 ? (
                    <div className="mt-6">
                        <h4 className="mb-3 text-sm font-semibold text-default-500 uppercase">
                            Daftar dokumen
                        </h4>
                        <div className="space-y-3">
                            {uploadingFiles.map((uploadFile, index) => (
                                <UploadedFileItem
                                    key={uploadFile.id}
                                    uploadFile={uploadFile}
                                    isSubmitting={isSubmitting}
                                    showDivider={index > 0}
                                    onRemove={onRemoveFile}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <h4 className="mb-3 text-sm font-semibold text-default-500 uppercase">
                            Daftar dokumen
                        </h4>

                        {validationError ? (
                            <div className="m-2 flex items-start gap-2 rounded-lg bg-danger-50 p-3 text-danger-600">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                <p className="text-sm">{validationError}</p>
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
    );
}
