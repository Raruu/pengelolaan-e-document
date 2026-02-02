import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

interface UseImagePreviewReturn {
    preview: (url: string, filename: string, title?: string) => void;
    DialogComponent: React.ReactNode;
}

export function useImagePreview(): UseImagePreviewReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [filename, setFilename] = useState<string>('image.jpg');
    const [title, setTitle] = useState<string>('Preview');

    const preview = (url: string, filename: string = 'image.jpg', title: string = 'Preview') => {
        setImageUrl(url);
        setFilename(filename);
        setTitle(title);
        setIsOpen(true);
    };

    const handleDownload = () => {
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
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
            size="2xl"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {title}
                </ModalHeader>
                <ModalBody>
                    <div className="flex items-center justify-center">
                        <img
                            src={imageUrl}
                            alt="Preview"
                            className="max-h-125 w-auto rounded-lg"
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"                       
                        onPress={handleDownload}
                        startContent={<Download className="size-4" />}
                    >
                        Download
                    </Button>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={() => setIsOpen(false)}
                        startContent={<X className="size-4" />}                    >
                        Tutup
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return { preview, DialogComponent };
}
