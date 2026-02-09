import WaveBackground from '@/components/WaveBackground';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    ...props
}: {
    children: React.ReactNode;
    title: string;
}) {
    return (
        <div>
            <WaveBackground />
            <AuthLayoutTemplate title={title} {...props}>
                {children}
            </AuthLayoutTemplate>
        </div>
    );
}
