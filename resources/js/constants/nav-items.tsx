import { LayoutGrid, LucideFiles, LucideStar, LucideTrash2, UserCircle } from 'lucide-react';
import MaterialCategoryRounded from '@/components/custom-icons/MaterialCategoryRounded';
import { dashboard } from '@/routes';
import { edit } from '@/routes/profile';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types/navigation';

export const defaultItems: NavItem[] = [
    {
        icon: <LayoutGrid />,
        name: 'Dashboard',
        href: dashboard.url(),
    },
    {
        icon: <LucideFiles />,
        name: 'Dokumen Ku',
        href: dashboard.url(),
    },
    {
        icon: <LucideStar />,
        name: 'Berbintang',
        href: dashboard.url(),
    },
    {
        icon: <LucideTrash2 />,
        name: 'Sampah',
        href: dashboard.url(),
    },
    {
        icon: <MaterialCategoryRounded />,
        name: 'Manajemen Kategori',
        href: dashboard.url(),
    },
];

export const settingsItems: NavItem[] = [
    {
        icon: <LayoutGrid />,
        name: 'Dashboard',
        href: dashboard.url(),
    },
    {
        icon: <UserCircle />,
        name: 'Akun',
        href: edit.url(),
        subItems: [
            { name: 'Profil', href: edit.url() },
            { name: 'Password', href: editPassword.url() },
        ],
    },
];
