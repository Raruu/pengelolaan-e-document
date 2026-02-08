import type { ReactNode } from 'react';
import { useSidebar } from '../../hooks/useSidebar';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';

type LayoutContentProps = {
    children: ReactNode;
};

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <div className="min-h-screen xl:flex">
            <div>
                <AppSidebar />
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered ? 'lg:ml-72.5' : 'lg:ml-22.5'
                } ${isMobileOpen ? 'ml-0' : ''}`}
            >
                <AppHeader />
                <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

type AppLayoutProps = {
    children: ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return <LayoutContent>{children}</LayoutContent>;
};

export default AppLayout;
