import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
} from '@heroui/react';
import { X, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface UseConfirmDialogOptions {
    title: string;
    message: ReactNode;
    children?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    disabled?: boolean;
    variant?: 'primary' | 'danger' | 'warning';
}

export const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<UseConfirmDialogOptions>({
        title: '',
        message: '',
    });
    const [resolveRef, setResolveRef] = useState<
        ((value: boolean) => void) | null
    >(null);

    const confirm = useCallback(
        (opts: UseConfirmDialogOptions): Promise<boolean> => {
            setOptions(opts);
            setIsOpen(true);

            return new Promise((resolve) => {
                setResolveRef(() => resolve);
            });
        },
        [],
    );

    const handleSave = useCallback(() => {
        setIsOpen(false);
        resolveRef?.(true);
    }, [resolveRef]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        resolveRef?.(false);
    }, [resolveRef]);

    const DialogComponent = (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="md"
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {options.title}
                </ModalHeader>
                <ModalBody>
                    {options.message}
                    {options.children && (
                        <Card
                            isBlurred
                            className={cn(
                                'border-none',
                                options.variant === 'danger' && 'bg-danger/30',
                                options.variant === 'warning' &&
                                    'bg-warning/30',
                                options.variant === 'primary' &&
                                    'bg-default/30',
                            )}
                            shadow="sm"
                        >
                            <CardBody>{options.children}</CardBody>
                        </Card>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={handleClose}
                        startContent={<X className="size-4" />}
                    >
                        {options.cancelText || 'Tidak'}
                    </Button>
                    <Button
                        color={options.variant || 'primary'}
                        onPress={handleSave}
                        isDisabled={options.disabled}
                        startContent={<Check className="size-4" />}
                    >
                        {options.confirmText || 'Ya'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return { confirm, DialogComponent };
};
