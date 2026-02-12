import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import Heading from '@/components/Heading';
import { defaultItems } from '@/lib/nav-items';
import { useSidebar } from '@/hooks/useSidebar';
import AppLayout from '@/layouts/app';
import { index as previewRoute } from '@/routes/document/preview';
import type { Document, DocumentFile } from '@/types/models';
import DocumentDetailsView from './components/DocumentDetailsView';
import FilesListView from './components/FilesListView';

interface Props {
    document: Document;
    files: DocumentFile[];
}

export default function PreviewDocuments({ document, files }: Props) {
    const { setNavItems } = useSidebar();

    useEffect(() => {
        const custom = defaultItems.map((item) => ({ ...item }));
        custom[1] = {
            ...custom[1],
            subItems: [
                { name: defaultItems[1].name, href: defaultItems[1].href },
                {
                    name: 'Detail',
                    href: previewRoute.url(document.id),
                },
            ],
        };
        setNavItems(custom);
    }, [document, setNavItems]);

    return (
        <AppLayout>
            <Head title={`Preview: ${document.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 px-4 py-2">
                <Heading
                    variant="default-small-margin"
                    title="Preview Dokumen"
                    description="Lihat detail dokumen dan file yang telah diupload."
                />

                {/* Main Content */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left Side - Files List */}
                    <div className="flex flex-col gap-8 lg:flex-4">
                        <FilesListView files={files} />
                    </div>

                    {/* Right Side - Document Details */}
                    <div className="lg:flex-3">
                        <DocumentDetailsView document={document} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
