import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';
import { Link } from '@inertiajs/react';
import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { isDoc } from '@/lib/utils';

interface PreviewParams {
    url: string;
    filename: string;
    title?: string;
    subtitle?: string | null;
    hideDownload?: boolean;
}

interface UseImagePreviewReturn {
    preview: ({ filename, title, subtitle, url }: PreviewParams) => void;
    DialogComponent: React.ReactNode;
}

export const isPreviewAble = (filename: string): boolean => {
    const previewAble = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
    const ext = filename.split('.').pop() || '';
    return previewAble.includes(ext);
};

export function usePreviewDialog(): UseImagePreviewReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState<string>('');
    const [filename, setFilename] = useState<string>('image.jpg');
    const [title, setTitle] = useState<string>('Preview');
    const [subTitle, setSubtitle] = useState<string | null>('');
    const [isDocument, setIsDocument] = useState<boolean>(false);
    const [hideDownload, setHideDownload] = useState<boolean>(false);

    const preview = ({
        url,
        filename = 'image.jpg',
        title = 'Preview',
        subtitle = '',
        hideDownload = false,
    }: PreviewParams) => {
        setUrl(url);
        setFilename(filename);
        setTitle(title);
        setSubtitle(subtitle);
        const ext = filename.toLowerCase();
        setIsDocument(isDoc(ext));
        setIsOpen(true);
        setHideDownload(hideDownload);
    };

    const handleDownload = () => {
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const DialogComponent = (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            size={isDocument ? '5xl' : '4xl'}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {subTitle && (
                        <p className="text-xs text-default-500">{subTitle}</p>
                    )}
                </ModalHeader>
                <ModalBody>
                    <div className="flex items-center justify-center">
                        {isDocument ? (
                            <object
                                data={url}
                                className="h-[70vh] w-full rounded-lg"
                                title="PDF Preview"
                                type="application/pdf"
                            >
                                <div className="flex items-center justify-center">
                                    <h1>
                                        Melihat pesan ini?{' '}
                                        <Link
                                            onClick={handleDownload}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            download
                                        </Link>{' '}
                                        dokumennya saja
                                    </h1>
                                </div>
                            </object>
                        ) : (
                            <img
                                src={url}
                                alt="Preview"
                                className="max-h-125 w-auto rounded-lg"
                            />
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    {!hideDownload && (
                        <Button
                            color="primary"
                            onPress={handleDownload}
                            startContent={<Download className="size-4" />}
                        >
                            Download
                        </Button>
                    )}
                    <Button
                        color="danger"
                        variant="light"
                        onPress={() => setIsOpen(false)}
                        startContent={<X className="size-4" />}
                    >
                        Tutup
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return { preview, DialogComponent };
}
