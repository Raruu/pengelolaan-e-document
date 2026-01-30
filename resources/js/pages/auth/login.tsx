import { Button, Card, CardBody, Input } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useState } from 'react';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () =>
        setIsPasswordVisible(!isPasswordVisible);
    return (
        <AuthLayout
            title="Pengelolaan E-Dokumen"
            description="Manajemen E-Dokumen yang aman"
        >
            <Head title="Masuk" />

            <Card className="px-6 py-8">
                <CardBody>
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors, clearErrors }) => (
                            <>
                                <div className="grid gap-4">
                                    <Input
                                        radius="md"
                                        id="email"
                                        type="email"
                                        name="email"
                                        label="Alamat Email"
                                        labelPlacement="outside"
                                        placeholder="email@example.com"
                                        isRequired
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        isInvalid={!!errors.email}
                                        errorMessage={errors.email}
                                        onChange={() => clearErrors('email')}
                                        endContent={
                                            <Mail className="pointer-events-none size-4 shrink-0 text-default-400" />
                                        }
                                    />

                                    <Input
                                        radius="md"
                                        id="password"
                                        type={
                                            isPasswordVisible
                                                ? 'text'
                                                : 'password'
                                        }
                                        name="password"
                                        label="Password"
                                        labelPlacement="outside"
                                        placeholder="Password"
                                        isRequired
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        isInvalid={!!errors.password}
                                        errorMessage={errors.password}
                                        onChange={() => clearErrors('password')}
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={
                                                    togglePasswordVisibility
                                                }
                                                aria-label="toggle password visibility"
                                            >
                                                {isPasswordVisible ? (
                                                    <EyeOff className="size-4 text-default-400" />
                                                ) : (
                                                    <Eye className="size-4 text-default-400" />
                                                )}
                                            </button>
                                        }
                                    />

                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm font-semibold text-primary-700"
                                            tabIndex={5}
                                        >
                                            Lupa Password?
                                        </TextLink>
                                    )}

                                    <Button
                                        type="submit"
                                        className="mt-2 font-semibold"
                                        tabIndex={4}
                                        isDisabled={processing}
                                        isLoading={processing}
                                        data-test="login-button"
                                        color="primary"
                                        fullWidth
                                        onPress={() => {
                                            clearErrors('email');
                                            clearErrors('password');
                                        }}
                                    >
                                        Masuk
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>

                    {status && (
                        <div className="mb-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}
                </CardBody>
            </Card>
        </AuthLayout>
    );
}
