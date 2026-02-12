import { useEffect, type PropsWithChildren } from 'react';
import Heading from '@/components/Heading';
import { settingsItems } from '@/lib/nav-items';
import { useSidebar } from '@/hooks/useSidebar';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { setNavItems } = useSidebar();

    useEffect(() => {
        setNavItems(settingsItems);
    }, [setNavItems]);
    
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-2">
            <Heading
                title="Pengaturan"
                description="Kelola profil dan pengaturan akun Anda"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
