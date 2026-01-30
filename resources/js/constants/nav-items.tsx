import { LayoutGrid, UserCircle, FileText, Table } from 'lucide-react';
import { dashboard } from '@/routes';
import { edit } from '@/routes/appearance';
import type { NavItem } from '@/types/navigation';

// export type NavItem = {
//     name: string;
//     icon: React.ReactNode;
//     href?: string;
//     subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
// };

export const navItems: NavItem[] = [
    {
        icon: <LayoutGrid />,
        name: 'Dashboard',
        href: dashboard.url(),
    },
    {
        icon: <UserCircle />,
        name: 'User Profile',
        href: edit.url(),
    },
    {
        name: 'Forms',
        icon: <FileText />,
        href: '',
        subItems: [
            { name: 'Form Elements', href: '/form-elements', pro: false },
        ],
    },
    {
        name: 'Tables',
        icon: <Table />,
        href: '',
        subItems: [{ name: 'Basic Tables', href: '/basic-tables', pro: false }],
    },
    {
        name: 'Pages',
        icon: <FileText />,
        href: '',
        subItems: [
            { name: 'Blank Page', href: '/blank', pro: false },
            { name: '404 Error', href: '/error-404', pro: false },
        ],
    },
];
