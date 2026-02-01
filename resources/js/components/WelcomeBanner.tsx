import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

const WelcomeBanner = () => {
    const { auth } = usePage<SharedData>().props;
    const name = auth.user.name;
    return (
        <div className="w-full rounded-2xl bg-linear-to-r from-primary-500 to-primary-700 p-8 text-white shadow-lg">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
                Selamat Datang, {name}!
            </h1>
            <p className="text-lg text-blue-100">
                Sistem pengelolaan E-Dokumen
            </p>
        </div>
    );
};

export default WelcomeBanner;
