import { Button, Card, CardBody, Input } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '@/layouts/auth';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);

    const togglePasswordVisibility = () =>
        setIsPasswordVisible(!isPasswordVisible);
    const toggleConfirmPasswordVisibility = () =>
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <Card className="px-6 py-8">
                <CardBody>
                    <Form
                        {...update.form()}
                        transform={(data) => ({ ...data, token, email })}
                        resetOnSuccess={['password', 'password_confirmation']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors, clearErrors }) => (
                            <div className="grid gap-4">
                                <Input
                                    radius="md"
                                    id="email"
                                    type="email"
                                    name="email"
                                    label="Email"
                                    labelPlacement="outside"
                                    autoComplete="email"
                                    value={email}
                                    isReadOnly
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
                                    autoFocus
                                    autoComplete="new-password"
                                    isInvalid={!!errors.password}
                                    errorMessage={errors.password}
                                    onChange={() => clearErrors('password')}
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={togglePasswordVisibility}
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

                                <Input
                                    radius="md"
                                    id="password_confirmation"
                                    type={
                                        isConfirmPasswordVisible
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="password_confirmation"
                                    label="Confirm password"
                                    labelPlacement="outside"
                                    placeholder="Confirm password"
                                    isRequired
                                    autoComplete="new-password"
                                    isInvalid={!!errors.password_confirmation}
                                    errorMessage={errors.password_confirmation}
                                    onChange={() =>
                                        clearErrors('password_confirmation')
                                    }
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={
                                                toggleConfirmPasswordVisibility
                                            }
                                            aria-label="toggle password visibility"
                                        >
                                            {isConfirmPasswordVisible ? (
                                                <EyeOff className="size-4 text-default-400" />
                                            ) : (
                                                <Eye className="size-4 text-default-400" />
                                            )}
                                        </button>
                                    }
                                />

                                <Button
                                    type="submit"
                                    className="mt-2 font-semibold"
                                    isDisabled={processing}
                                    isLoading={processing}
                                    data-test="reset-password-button"
                                    color="primary"
                                    fullWidth
                                    onPress={() => {
                                        clearErrors('email');
                                        clearErrors('password');
                                        clearErrors('password_confirmation');
                                    }}
                                >
                                    Reset password
                                </Button>
                            </div>
                        )}
                    </Form>
                </CardBody>
            </Card>
        </AuthLayout>
    );
}
