import { Avatar, Button, Input } from '@heroui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Camera, Save } from 'lucide-react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/Heading';
import { useImageCrop } from '@/hooks/useImageCrop';
import { useImagePreview } from '@/hooks/useImagePreview';
import AppLayout from '@/layouts/app';
import SettingsLayout from '@/layouts/settings';
import { initialsName } from '@/lib/utils';
import { send } from '@/routes/verification';
import type { SharedData } from '@/types';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const { preview, DialogComponent: PreviewDialog } = useImagePreview();
    const { cropImage, DialogComponent: CropDialog } = useImageCrop();

    const initials = initialsName(auth.user.name);

    const handlePhotoChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                const croppedFile = await cropImage(result);

                if (croppedFile) {
                    const croppedUrl = URL.createObjectURL(croppedFile);
                    setPhotoPreview(croppedUrl);

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(croppedFile);
                    const input = document.getElementById(
                        'photo',
                    ) as HTMLInputElement;
                    if (input) {
                        input.files = dataTransfer.files;
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Profil" />

            <h1 className="sr-only">Pengaturan Profil</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Informasi Profil"
                        description="Perbarui nama dan alamat email Anda"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => {
                            if (recentlySuccessful) {
                                setTimeout(
                                    () => window.location.reload(),
                                    1000,
                                );
                            }

                            return (
                                <>
                                    <div className="grid gap-4">
                                        <label className="text-sm font-medium">
                                            Foto Profil
                                        </label>
                                        <div className="flex items-center gap-6">
                                            <Avatar
                                                src={
                                                    photoPreview ||
                                                    auth.user.profile_photo_url
                                                }
                                                icon={initials}
                                                className="size-20 cursor-pointer bg-primary text-sm font-semibold text-white transition-opacity hover:opacity-80"
                                                radius="full"
                                                onClick={() => {
                                                    const url =
                                                        photoPreview ||
                                                        auth.user
                                                            .profile_photo_url;
                                                    if (url) {
                                                        preview(
                                                            url,
                                                            `${auth.user.name}-profile-photo.jpg`,
                                                            'Foto Profil',
                                                        );
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-col gap-2">
                                                <label
                                                    htmlFor="photo"
                                                    className="group relative z-0 box-border inline-flex h-10 w-fit min-w-20 transform-gpu cursor-pointer appearance-none items-center justify-center gap-2 overflow-hidden rounded-medium border bg-background px-4 text-small font-normal whitespace-nowrap text-foreground subpixel-antialiased outline-transparent transition-transform-colors-opacity outline-solid select-none tap-highlight-transparent hover:bg-primary hover:text-white data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus data-[hover=true]:opacity-hover data-[pressed=true]:scale-[0.97] motion-reduce:transition-none [&>svg]:max-w-8"
                                                >
                                                    <Camera className="size-4" />
                                                    Pilih Foto
                                                </label>
                                                <input
                                                    id="photo"
                                                    type="file"
                                                    name="profile_photo_path"
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                    className="hidden"
                                                />
                                                <p className="text-muted-foreground text-xs">
                                                    (Maks. 2MB setelah dicrop)
                                                </p>
                                                {errors.profile_photo_path && (
                                                    <p className="text-xs text-danger">
                                                        {
                                                            errors.profile_photo_path
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Input
                                            id="name"
                                            name="name"
                                            label="Nama"
                                            labelPlacement="outside"
                                            placeholder="Nama lengkap"
                                            radius="md"
                                            defaultValue={auth.user.name}
                                            isRequired
                                            autoComplete="name"
                                            isInvalid={!!errors.name}
                                            errorMessage={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            label="Alamat Email"
                                            labelPlacement="outside"
                                            placeholder="Alamat email"
                                            radius="md"
                                            defaultValue={auth.user.email}
                                            isRequired
                                            autoComplete="username"
                                            isInvalid={!!errors.email}
                                            errorMessage={errors.email}
                                        />
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at ===
                                            null && (
                                            <div>
                                                <p className="text-muted-foreground -mt-4 text-sm">
                                                    Alamat email Anda belum
                                                    diverifikasi.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                    >
                                                        Klik di sini untuk
                                                        mengirim ulang email
                                                        verifikasi.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        Link verifikasi baru
                                                        telah dikirim ke alamat
                                                        email Anda.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="submit"
                                            color="primary"
                                            radius="md"
                                            isDisabled={
                                                processing || recentlySuccessful
                                            }
                                            isLoading={processing}
                                            data-test="update-profile-button"
                                            startContent={
                                                <Save className="size-4" />
                                            }
                                        >
                                            Simpan
                                        </Button>

                                        {recentlySuccessful && (
                                            <p className="text-sm text-neutral-600">
                                                Tersimpan
                                            </p>
                                        )}
                                    </div>
                                </>
                            );
                        }}
                    </Form>

                    {PreviewDialog}
                    {CropDialog}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
