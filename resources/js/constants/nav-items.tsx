import { LayoutGrid, UserCircle } from 'lucide-react';
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
];

export const settingsItems: NavItem[] = [
    {
        icon: <LayoutGrid />,
        name: 'Dashboard',
        href: dashboard.url(),
    },
    {
        icon: <UserCircle />,
        name: 'User Profile',
        href: edit.url(),
        subItems: [
            { name: 'Profile', href: edit.url() },
            { name: 'Password', href: editPassword.url() },
        ],
    },
];
