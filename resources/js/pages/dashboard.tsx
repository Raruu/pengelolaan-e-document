import { Head } from '@inertiajs/react';
import { Star } from 'lucide-react';
import RecentFiles from '@/components/RecentFiles';
import WelcomeBanner from '@/components/WelcomeBanner';
import AppLayout from '@/layouts/app';
import { index as documentsIndex } from '@/routes/documents';
import { index as documentsStarredIndex } from '@/routes/documents_starred';
import type { Document as typeDocument } from '@/types/models';


interface Document extends typeDocument {
    files_count: number;
}

interface DashboardProps {
    recentDocuments: Document[];
    starredDocuments: Document[];
}

export default function Dashboard({
    recentDocuments,
    starredDocuments,
}: DashboardProps) {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <WelcomeBanner />

                <RecentFiles
                    title="Dokumen Terbaru"
                    documents={recentDocuments}
                    viewAllLink={documentsIndex.url()}
                />

                <RecentFiles
                    title={
                        <div className="flex flex-row items-center gap-2">
                            <Star
                                className="size-5 text-[#ede05d]"
                                fill="#ede05d"
                            />
                            <div>Dokumen Favorit</div>
                        </div>
                    }
                    documents={starredDocuments}
                    viewAllLink={documentsStarredIndex.url()}
                />
            </div>
        </AppLayout>
    );
}
