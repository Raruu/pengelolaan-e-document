import {
    LayoutGrid,
    LucideLogIn,
    LucideLogOut,
    LucideTrash2,
    UserCircle,
} from 'lucide-react';
import MaterialCategoryRounded from '@/components/custom-icons/MaterialCategoryRounded';
import { dashboard } from '@/routes';
import { index as categoriesIndex } from '@/routes/categories';
import { index as documentsIndexIn } from '@/routes/documents/in';
import { index as documentsIndexOut } from '@/routes/documents/out';
import { edit } from '@/routes/profile';
import { index as trashIndex } from '@/routes/trash';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types/navigation';

export const defaultItems: NavItem[] = [
    {
        icon: <LayoutGrid />,
        name: 'Dashboard',
        href: dashboard.url(),
    },
    {
        icon: <LucideLogIn />,
        name: 'Dokumen Masuk',
        href: documentsIndexIn.url(),
    },
    {
        icon: <LucideLogOut />,
        name: 'Dokumen Keluar',
        href: documentsIndexOut.url(),
    },
    {
        icon: <LucideTrash2 />,
        name: 'Sampah',
        href: trashIndex.url(),
    },
    {
        icon: <MaterialCategoryRounded />,
        name: 'Manajemen Kategori',
        href: categoriesIndex.url(),
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
