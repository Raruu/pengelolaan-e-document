import { Button, Card, CardBody, Input } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '@/layouts/auth';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () =>
        setIsPasswordVisible(!isPasswordVisible);

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <Card className="px-6 py-8">
                <CardBody>
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors, clearErrors }) => (
                            <div className="grid gap-4">
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
                                    autoComplete="current-password"
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

                                <Button
                                    type="submit"
                                    className="mt-2 font-semibold"
                                    isDisabled={processing}
                                    isLoading={processing}
                                    data-test="confirm-password-button"
                                    color="primary"
                                    fullWidth
                                    onPress={() => clearErrors('password')}
                                >
                                    Confirm password
                                </Button>
                            </div>
                        )}
                    </Form>
                </CardBody>
            </Card>
        </AuthLayout>
    );
}
