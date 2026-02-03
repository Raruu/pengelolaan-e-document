import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import WaveBackground from './WaveBackground';

const WelcomeBanner = () => {
    const { auth } = usePage<SharedData>().props;
    const name = auth.user.name;
    return (
        <div className="relative w-full rounded-2xl bg-linear-to-r from-primary-500/50 to-primary-700/80 p-8 text-white shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-full -z-1 blur-[2px]">
                <WaveBackground variant='component' />
            </div>
            <div className="flex flex-col z-1">
                <h1 className="mb-2 text-3xl font-bold tracking-tight">
                    Selamat Datang, {name}!
                </h1>
                <p className="text-lg text-blue-100">
                    Sistem pengelolaan E-Dokumen
                </p>
            </div>
        </div>
    );
};

export default WelcomeBanner;
