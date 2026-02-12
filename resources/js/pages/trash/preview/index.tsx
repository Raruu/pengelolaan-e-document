import { addToast } from '@heroui/react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Heading from '@/components/Heading';
import { defaultItems } from '@/lib/nav-items';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useSidebar } from '@/hooks/useSidebar';
import AppLayout from '@/layouts/app';
import { forceDelete } from '@/routes/api/trash';
import { restore as trashRestore } from '@/routes/api/trash';
import { index as trashIndex } from '@/routes/trash';
import { index as trashPreview } from '@/routes/trash/preview';
import type { DocumentFile } from '@/types/models';
import type { TrashDocument } from '@/types/models/trash';
import DeletedFilesListView from './components/DeletedFilesListView';
import TrashDocumentDetailsView from './components/TrashDocumentDetailsView';

interface Props {
    document: TrashDocument;
    deletedFiles: DocumentFile[];
}

export default function TrashPreview({ document, deletedFiles }: Props) {
    const [loading, setLoading] = useState(false);
    const { confirm, DialogComponent } = useConfirmDialog();
    const { setNavItems } = useSidebar();

    useEffect(() => {
        const custom = defaultItems.map((item) => ({ ...item }));
        custom[3] = {
            ...custom[3],
            subItems: [
                { name: defaultItems[3].name, href: defaultItems[3].href },
                {
                    name: 'Detail',
                    href: trashPreview.url(document.id),
                },
            ],
        };
        setNavItems(custom);
    }, [document, setNavItems]);

    const handleRestoreDocument = async () => {
        const what =
            document.deletion_type === 'full' ? 'dokumen' : 'semua file';
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `Apakah Anda yakin ingin memulihkan ${what} ini?`,
            variant: 'success',
        });

        if (!yes) return;

        setLoading(true);
        try {
            await axios.post(trashRestore.url(), {
                id: document.id,
                type: 'document',
            });
            router.visit(trashIndex.url());
        } catch (error) {
            console.error('Error restoring document:', error);
            addToast({
                title: 'Gagal!',
                description: `${what} gagal dipulihkan!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDocument = async () => {
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `Apakah Anda yakin ingin menghapus permanen dokumen '${document.title}'? Aksi ini tidak dapat dibatalkan!`,
            variant: 'danger',
        });

        if (!yes) return;

        setLoading(true);
        try {
            await axios.delete(forceDelete.url(), {
                data: {
                    id: document.id,
                    type: 'document',
                },
            });
            router.visit(trashIndex.url());
        } catch (error) {
            console.error('Error deleting document:', error);
            addToast({
                title: 'Gagal!',
                description: `Dokumen ${document.title} gagal dihapus!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreFile = async (doc: DocumentFile) => {
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `Apakah Anda yakin ingin mengembalikan file '${doc.filename}?'`,
            variant: 'success',
        });

        if (!yes) return;

        setLoading(true);
        try {
            await axios.post(trashRestore.url(), {
                id: doc.id,
                type: 'file',
            });
            if (document.deleted_files_count! < 2) {
                router.visit(trashIndex.url());
            } else {
                router.reload();
            }
        } catch (error) {
            console.error('Error restoring file:', error);
            addToast({
                title: 'Gagal!',
                description: `Gagal memulihkan ${doc.filename}!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFile = async (doc: DocumentFile) => {
        const yes = await confirm({
            title: 'Apakah Anda yakin?',
            message: `Apakah Anda yakin ingin menghapus permanen file '${doc.filename}'? Aksi ini tidak dapat dibatalkan!`,
            variant: 'danger',
        });

        if (!yes) return;

        setLoading(true);
        try {
            await axios.delete(forceDelete.url(), {
                data: {
                    id: doc.id,
                    type: 'file',
                },
            });
            if (document.deleted_files_count! < 2) {
                router.visit(trashIndex.url());
            } else {
                router.reload();
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            addToast({
                title: 'Gagal!',
                description: `Gagal menghapus ${doc.filename}!`,
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title={`Sampah: ${document.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title="Detail Sampah"
                    description="Lihat detail dokumen dan file yang telah dihapus."
                />

                {/* Main Content */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left Side - Deleted Files List */}
                    <div className="flex flex-col gap-4 lg:flex-4">
                        <DeletedFilesListView
                            files={deletedFiles}
                            type={document.deletion_type}
                            loading={loading}
                            onRestore={handleRestoreFile}
                            onDelete={handleDeleteFile}
                        />
                    </div>

                    {/* Right Side - Document Details */}
                    <div className="lg:flex-3">
                        <TrashDocumentDetailsView
                            document={document}
                            loading={loading}
                            handleDeleteDocument={handleDeleteDocument}
                            handleRestoreDocument={handleRestoreDocument}
                        />
                    </div>
                </div>
            </div>
            {DialogComponent}
        </AppLayout>
    );
}
