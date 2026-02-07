import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';
import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { isDoc } from '@/lib/utils';
import '@cyntler/react-doc-viewer/dist/index.css';

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

export function usePreviewDialog(): UseImagePreviewReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState<string>('');
    const [filename, setFilename] = useState<string>('image.jpg');
    const [title, setTitle] = useState<string>('Preview');
    const [subTitle, setSubtitle] = useState<string | null>('');
    const [isDocument, setIsDocument] = useState<boolean>(false);
    const [iframeError, setIframeError] = useState<boolean>(false);
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
        setIframeError(false);
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
            size={isDocument ? '5xl' : '2xl'}            
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
                            iframeError ? (
                                <div className="h-[70vh] w-full overflow-auto">
                                    <DocViewer
                                        documents={[
                                            { uri: url, fileName: filename },
                                        ]}
                                        pluginRenderers={DocViewerRenderers}
                                        config={{
                                            header: {
                                                disableHeader: true,
                                            },
                                        }}
                                    />
                                </div>
                            ) : (
                                <iframe
                                    src={url}
                                    className="h-[70vh] w-full rounded-lg"
                                    title="PDF Preview"
                                    onError={() => setIframeError(true)}
                                />
                            )
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
