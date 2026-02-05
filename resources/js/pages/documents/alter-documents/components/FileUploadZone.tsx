import { Button } from '@heroui/react';
import { Upload } from 'lucide-react';
import { useRef } from 'react';

interface FileUploadZoneProps {
    dragActive: boolean;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileSelect: (files: File[]) => void;
}

export default function FileUploadZone({
    dragActive,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onFileSelect,
}: FileUploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(Array.from(e.target.files));
        }
    };

    return (
        <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 shadow-medium transition-colors ${
                dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-default-300 bg-content1'
            }`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Upload className="h-8 w-8 text-primary-600" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-default-700">
                Tarik & drop file disini
            </h3>
            <p className="mb-4 text-sm text-default-500">
                atau klik untuk memilih file
            </p>
            <p className="mb-6 text-xs text-default-400">
                Dokumen dan gambar (up to 25MB)
            </p>

            <Button
                color="primary"
                variant="flat"
                onPress={() => fileInputRef.current?.click()}
            >
                Pilih file
            </Button>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
        </div>
    );
}
