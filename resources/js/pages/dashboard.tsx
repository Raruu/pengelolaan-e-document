import { Head } from '@inertiajs/react';
import RecentFiles from '@/components/RecentFiles';
import WelcomeBanner from '@/components/WelcomeBanner';
import AppLayout from '@/layouts/app';
import { index as documentsIndexOut } from '@/routes/documents/out';
import type { Document as typeDocument } from '@/types/models';
import { index as documentsIndexIn } from '@/routes/documents/in';

interface Document extends typeDocument {
    files_count: number;
}

interface DashboardProps {
    recentDocumentsIn: Document[];
    recentDocumentsOut: Document[];
}

export default function Dashboard({ recentDocumentsIn, recentDocumentsOut }: DashboardProps) {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <WelcomeBanner />

                <RecentFiles
                    title="Dokumen Masuk Terbaru"
                    documents={recentDocumentsIn}
                    viewAllLink={documentsIndexIn.url()}
                />

                <RecentFiles
                    title="Dokumen Keluar Terbaru"
                    documents={recentDocumentsOut}
                    viewAllLink={documentsIndexOut.url()}
                />
            </div>
        </AppLayout>
    );
}
