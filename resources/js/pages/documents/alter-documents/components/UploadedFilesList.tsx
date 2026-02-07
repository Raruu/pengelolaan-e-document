import { Card, CardBody } from '@heroui/react';
import { AlertCircle } from 'lucide-react';
import type { UploadingFile } from '@/types/models';
import UploadedFileItem from './UploadedFileItem';

interface UploadedFilesListProps {
    uploadingFiles: UploadingFile[];
    isSubmitting: boolean;
    validationError?: string;
    onHandlePreview: (file: UploadingFile) => void;
    onRemoveFile: (file: UploadingFile) => void;
}

const Header = ({ uploadingFiles }: { uploadingFiles: UploadingFile[] }) => {
    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-default-700">
                Daftar Dokumen
            </h3>
            <p className="text-xs text-default-500">
                {uploadingFiles.length} file
            </p>
        </div>
    );
};

export default function UploadedFilesList({
    uploadingFiles,
    isSubmitting,
    validationError,
    onHandlePreview,
    onRemoveFile,
}: UploadedFilesListProps) {
    const filteredFiles = uploadingFiles.filter(
        (file) => file.status !== 'deleted',
    );

    return (
        <Card>
            <CardBody className="p-6">
                {filteredFiles.length > 0 ? (
                    <div>
                        <Header uploadingFiles={filteredFiles} />
                        <div className="space-y-3">
                            {filteredFiles
                                .slice()
                                .reverse()
                                .map((uploadFile, index) => {
                                    return (
                                        <UploadedFileItem
                                            key={uploadFile.id}
                                            uploadFile={uploadFile}
                                            isSubmitting={isSubmitting}
                                            showDivider={index > 0}
                                            handlePreview={onHandlePreview}
                                            onRemove={onRemoveFile}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                ) : (
                    <>
                        <Header uploadingFiles={uploadingFiles} />

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
