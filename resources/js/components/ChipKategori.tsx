import { Chip, Avatar } from '@heroui/react';
import { cn, initialsName } from '@/lib/utils';
import type { Category } from '@/types/models';

interface Props {
    category: Category;
    size?: 'sm' | 'md';
}

export const ChipKategori = ({ category, size = 'md' }: Props) => {
    return (
        <div
            className={cn(
                'flex flex-row items-center',
                size === 'md' && 'gap-2',
                size === 'sm' && 'gap-1',
            )}
        >
            <Chip variant="flat" color="default">
                <div className="flex flex-row items-center gap-1">
                    {category.icon_url ? (
                        <Avatar
                            className={cn('mr-1 size-4 rounded-md')}
                            src={category.icon_url}
                            alt={initialsName(category.category)}
                        />
                    ) : (
                        <span
                            className={cn(
                                'text-center font-semibold text-nowrap text-primary-600',
                                size === 'md' && '-mt-1 size-4 text-sm',
                                size === 'sm' && '-mt-2 mr-2 size-2 text-xs',
                            )}
                        >
                            {initialsName(category.category)}
                        </span>
                    )}
                    <p className={cn(size === 'sm' && 'text-xs')}>
                        {category.category}
                    </p>
                </div>
            </Chip>

            <Chip
                variant="flat"
                size={size}
                color={category.direction == 'Masuk' ? 'success' : 'danger'}
            >
                {category.direction}
            </Chip>
        </div>
    );
};
