import type { ReactNode } from 'react';
import BubbleBackground from '@/components/BubbleBackground';
import { cn } from '@/lib/utils';
import { useSidebar } from '../../hooks/useSidebar';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';

type LayoutContentProps = {
    children: ReactNode;
    useBgBackground?: boolean;
};

const LayoutContent: React.FC<LayoutContentProps> = ({
    children,
    useBgBackground = false,
}) => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <>
            {!useBgBackground && (
                <div className="absolute top-0 left-0 -z-2 min-h-screen min-w-screen blur-3xl">
                    <BubbleBackground
                        bgColorA="rgb(255,255,255)"
                        bgColorB="rgb(255,255,255)"
                        bubbleColors={{
                            colorA: '252, 241, 204',
                            colorB: '0, 0, 246',
                            colorC: '252, 241, 204',
                            colorD: '0, 0, 246',
                            colorE: '137, 152, 205',
                            interactive: '74, 185, 221',
                        }}
                    />
                </div>
            )}

            <div
                className={cn(
                    'absolute top-0 left-0 -z-1 h-full w-full',
                    useBgBackground && 'bg-background',
                )}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.87)' }}
            ></div>
            <div className="relative z-1 min-h-screen xl:flex">
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
                    <div className="mx-auto max-w-(--breakpoint-2xl) overflow-auto p-4 md:p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

type AppLayoutProps = {
    children: ReactNode;
    useBgBackground?: boolean;
};

const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    useBgBackground = false,
}) => {
    return (
        <LayoutContent useBgBackground={useBgBackground}>
            {children}
        </LayoutContent>
    );
};

export default AppLayout;
