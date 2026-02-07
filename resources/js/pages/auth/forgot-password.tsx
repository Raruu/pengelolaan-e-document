import { Button, Card, CardBody, CardFooter, Input } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/InputError';
import TextLink from '@/components/TextLink';
import AuthLayout from '@/layouts/auth';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Lupa Password"
            description="Masukkan email Anda untuk menerima link reset kata sandi"
        >
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Card className="px-6 py-8">
                <CardBody>
                    <Form {...email.form()}>
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        label="Alamat Email"
                                        labelPlacement="outside"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="email@example.com"
                                    />

                                    <InputError message={errors.email} />
                                </div>

                                <div className="my-6 flex items-center justify-start">
                                    <Button
                                        className="w-full"
                                        disabled={processing}
                                        data-test="email-password-reset-link-button"
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        )}
                                        Email password reset link
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </CardBody>
                <CardFooter className="flex items-center justify-center p-0">
                    <div className="text-muted-foreground space-x-1 text-center text-sm">
                        <span>Sudah ingat? Kembali ke halaman</span>
                        <TextLink
                            className="ml-auto text-sm font-semibold text-primary-700"
                            href={login()}
                        >
                            Masuk
                        </TextLink>
                    </div>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}
