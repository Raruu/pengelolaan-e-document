import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/AppLogoIcon';

type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
};

export default function AuthSimpleLayout({ children, title }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="relative flex flex-col items-center gap-2">
                        <div className="flex flex-col items-center justify-center gap-0">
                            <AppLogoIcon variant="big" />
                            <h1 className="text-xl font-bold text-black">
                                {title}
                            </h1>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
