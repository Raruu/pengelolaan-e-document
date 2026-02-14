import { Button, Input } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import Heading from '@/components/Heading';
import AppLayout from '@/layouts/app';
import SettingsLayout from '@/layouts/settings';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
        useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] =
        useState(false);

    return (
        <AppLayout useBgBackground>
            <Head title="Pengaturan Kata Sandi" />

            <h1 className="sr-only">Pengaturan Kata Sandi</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Perbarui Kata Sandi"
                        description="Pastikan akun Anda menggunakan kata sandi yang panjang dan acak untuk tetap aman"
                    />

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({
                            errors,
                            processing,
                            recentlySuccessful,
                            clearErrors,
                        }) => (
                            <>
                                <div className="grid gap-2">
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type={
                                            isCurrentPasswordVisible
                                                ? 'text'
                                                : 'password'
                                        }
                                        label="Kata sandi saat ini"
                                        labelPlacement="outside"
                                        placeholder="Kata sandi saat ini"
                                        radius="md"
                                        autoComplete="current-password"
                                        isInvalid={!!errors.current_password}
                                        errorMessage={errors.current_password}
                                        onChange={() =>
                                            clearErrors('current_password')
                                        }
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() =>
                                                    setIsCurrentPasswordVisible(
                                                        !isCurrentPasswordVisible,
                                                    )
                                                }
                                                aria-label="toggle password visibility"
                                            >
                                                {isCurrentPasswordVisible ? (
                                                    <EyeOff className="size-4 text-default-400" />
                                                ) : (
                                                    <Eye className="size-4 text-default-400" />
                                                )}
                                            </button>
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Input
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        type={
                                            isPasswordVisible
                                                ? 'text'
                                                : 'password'
                                        }
                                        label="Kata sandi baru"
                                        labelPlacement="outside"
                                        placeholder="Kata sandi baru"
                                        radius="md"
                                        autoComplete="new-password"
                                        isInvalid={!!errors.password}
                                        errorMessage={errors.password}
                                        onChange={() => clearErrors('password')}
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() =>
                                                    setIsPasswordVisible(
                                                        !isPasswordVisible,
                                                    )
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
                                </div>

                                <div className="grid gap-2">
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={
                                            isPasswordConfirmationVisible
                                                ? 'text'
                                                : 'password'
                                        }
                                        label="Konfirmasi kata sandi"
                                        labelPlacement="outside"
                                        placeholder="Konfirmasi kata sandi"
                                        radius="md"
                                        autoComplete="new-password"
                                        isInvalid={
                                            !!errors.password_confirmation
                                        }
                                        errorMessage={
                                            errors.password_confirmation
                                        }
                                        onChange={() =>
                                            clearErrors('password_confirmation')
                                        }
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() =>
                                                    setIsPasswordConfirmationVisible(
                                                        !isPasswordConfirmationVisible,
                                                    )
                                                }
                                                aria-label="toggle password visibility"
                                            >
                                                {isPasswordConfirmationVisible ? (
                                                    <EyeOff className="size-4 text-default-400" />
                                                ) : (
                                                    <Eye className="size-4 text-default-400" />
                                                )}
                                            </button>
                                        }
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        radius="md"
                                        isDisabled={processing}
                                        isLoading={processing}
                                        data-test="update-password-button"
                                        onPress={()=> {
                                            clearErrors('current_password')
                                            clearErrors('password')
                                            clearErrors('password_confirmation')
                                        }}
                                        startContent={<Save className="size-4" />}
                                    >
                                        Simpan kata sandi
                                    </Button>

                                    {recentlySuccessful && (
                                        <p className="text-sm text-neutral-600">
                                            Tersimpan
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
