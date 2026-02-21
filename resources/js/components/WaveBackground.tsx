import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Persist start time at module level so animation doesn't restart on remount
let persistentStartTime: number | null = null;

export default function WaveBackground({
    variant = 'full-screen',
}: {
    variant?: 'full-screen' | 'component';
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        if (persistentStartTime === null) {
            persistentStartTime = performance.now();
        }
        const startTime = persistentStartTime;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // from light to dark blue
        const colors = [
            '#91D3EE',
            '#61C0E2',
            '#82D0EA',
            '#53BBDF',
            '#2898CB',
            '#4AB5DD',
            '#35A8D6',
            '#0B6CA3',
            '#0A5F95',
            '#075389',
        ];

        const animate = (currentTime: number) => {
            const time = (currentTime - startTime) * 0.001; // Convert to seconds
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw waves
            colors.forEach((color, index) => {
                ctx.fillStyle = color;
                ctx.beginPath();

                const amplitude = 150 + index * 7;
                const frequency = 0.003 - index * 0.0001;
                const baseHeight = canvas.height * 0.6 + index * 30;
                const phaseShift = index * 0.3;

                // Start path
                ctx.moveTo(0, canvas.height);

                const incrementBy = variant === 'full-screen' ? 1 : 2;

                // Draw wave from center outward
                for (let x = 0; x <= canvas.width; x += incrementBy) {
                    // Calculate distance from center
                    const centerX = canvas.width / 2;
                    const distanceFromCenter = Math.abs(x - centerX);

                    // Wave propagates from center
                    const wave1 =
                        Math.sin(
                            (x - centerX) * frequency + time + phaseShift,
                        ) * amplitude;
                    const wave2 =
                        Math.sin(
                            (x - centerX) * frequency * 1.5 -
                                time * 1.2 +
                                phaseShift,
                        ) *
                        amplitude *
                        0.5;

                    // Damping based on distance from center for ripple effect
                    const damping =
                        Math.cos(distanceFromCenter * 0.002 - time) * 0.3 + 0.7;

                    const y = baseHeight + (wave1 + wave2) * damping;
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate(performance.now());

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [variant]);

    return (
        <div
            className={cn(
                'h-full w-full',
                variant == 'full-screen' ? 'absolute' : '',
            )}
        >
            <div
                className={cn(
                    'relative w-full overflow-hidden',
                    variant == 'full-screen'
                        ? 'h-screen bg-[#EDF4FC]'
                        : 'h-full',
                )}
            >
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 h-full w-full"
                />
            </div>
        </div>
    );
}
