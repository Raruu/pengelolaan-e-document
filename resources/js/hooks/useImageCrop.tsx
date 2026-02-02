import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Slider } from '@heroui/react';
import { Crop, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';

interface UseImageCropReturn {
    cropImage: (imageUrl: string) => Promise<File | null>;
    DialogComponent: React.ReactNode;
}

export function useImageCrop(): UseImageCropReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string>('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((file: File | null) => void) | null>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const cropImage = (imageUrl: string): Promise<File | null> => {
        return new Promise((resolve) => {
            setImageToCrop(imageUrl);
            setResolvePromise(() => resolve);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setIsOpen(true);
        });
    };

    const createCroppedImage = useCallback(async () => {
        if (!imageToCrop || !croppedAreaPixels) return null;

        const image = new Image();
        image.src = imageToCrop;
        await new Promise((resolve) => {
            image.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
        );

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    }, [imageToCrop, croppedAreaPixels]);

    const handleCropSave = async () => {
        const croppedBlob = await createCroppedImage();
        if (croppedBlob && resolvePromise) {
            const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
            resolvePromise(file);
        } else if (resolvePromise) {
            resolvePromise(null);
        }
        handleClose();
    };

    const handleClose = () => {
        if (resolvePromise) {
            resolvePromise(null);
        }
        setIsOpen(false);
        setImageToCrop('');
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setResolvePromise(null);
    };

    const DialogComponent = (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="3xl"
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Crop Foto Profil
                </ModalHeader>
                <ModalBody>
                    <div className="relative h-100 w-full">
                        {imageToCrop && (
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        )}
                    </div>
                    <div className="mt-4 px-4">
                        <label className="mb-2 block text-sm font-medium">
                            Zoom
                        </label>
                        <Slider
                            size="sm"
                            step={0.1}
                            minValue={1}
                            maxValue={3}
                            value={zoom}
                            onChange={(value) =>
                                setZoom(value as number)
                            }
                            className="max-w-full"
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={handleClose}
                        startContent={<X className="size-4" />}
                    >
                        Batal
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleCropSave}
                        startContent={<Crop className="size-4" />}
                    >
                        Crop
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return { cropImage, DialogComponent };
}
