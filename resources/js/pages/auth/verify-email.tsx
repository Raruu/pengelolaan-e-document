import { Button, Card, CardBody } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/TextLink';
import AuthLayout from '@/layouts/auth';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            <Card className="px-6 py-8">
                <CardBody>
                    {status === 'verification-link-sent' && (
                        <div className="mb-4 text-center text-sm font-medium text-success">
                            A new verification link has been sent to the email
                            address you provided during registration.
                        </div>
                    )}

                    <Form
                        {...send.form()}
                        className="flex flex-col items-center gap-4"
                    >
                        {({ processing }) => (
                            <>
                                <Button
                                    type="submit"
                                    className="font-semibold"
                                    isDisabled={processing}
                                    isLoading={processing}
                                    color="secondary"
                                    fullWidth
                                >
                                    Resend verification email
                                </Button>

                                <TextLink
                                    href={logout()}
                                    className="text-sm"
                                >
                                    Log out
                                </TextLink>
                            </>
                        )}
                    </Form>
                </CardBody>
            </Card>
        </AuthLayout>
    );
}
