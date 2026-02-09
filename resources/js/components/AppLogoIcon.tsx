import logo from '@/../../public/lanal_kendari.webp';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    variant = 'default',
}: {
    variant?: 'default' | 'big';
}) {
    return (
        <div
            className={cn(
                'w-26 rounded-xl p-2.5 text-white',
                variant === 'big' && 'w-32',
            )}
        >
            <img src={logo} className="h-auto w-full" />
        </div>
    );
}
