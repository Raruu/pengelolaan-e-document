import { addToast } from '@heroui/react';
import axios from 'axios';
import { downloadAll } from '@/routes/api/documents';
import type { Document } from '@/types/models';

export const downloadAllDocument = async ({
    theDocument,
    onStart,
    onEnd,
}: {
    theDocument: Document;
    onStart?: () => void;
    onEnd?: () => void;
}) => {
    onStart?.();
    try {
        const response = await axios.get(
            downloadAll.url({ document: theDocument.id }),
            {
                responseType: 'blob',
            },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `document_${theDocument.id}_${theDocument.title}_${Date.now()}.zip`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        addToast({
            title: 'Download berhasil',
            description: 'Semua file telah diunduh',
            timeout: 2000,
            shouldShowTimeoutProgress: true,
            color: 'success',
        });
    } catch (error) {
        console.error('Download error:', error);
        addToast({
            title: 'Download gagal',
            description: 'Terjadi kesalahan saat mengunduh file',
            timeout: 3000,
            shouldShowTimeoutProgress: true,
            color: 'danger',
        });
    } finally {
        onEnd?.();
    }
};
