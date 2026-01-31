export type NavItem = {
    name: string;
    href: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    subItems?: { name: string; href: string; new?: boolean }[];
};
