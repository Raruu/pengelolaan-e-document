import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import WaveBackground from './WaveBackground';

const WelcomeBanner = () => {
    const { auth } = usePage<SharedData>().props;
    const name = auth.user.name;
    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-primary-500/50 to-primary-700/80 p-8 text-white shadow-lg">
            <div className="absolute top-0 left-0 h-full w-full blur-[2px]">
                <WaveBackground variant="component" />
            <div className="absolute top-0 left-0 h-full w-full bg-linear-to-r from-primary-500/50 to-primary-700/80"></div>
            </div>
            <div className="relative z-1 flex flex-col">
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
