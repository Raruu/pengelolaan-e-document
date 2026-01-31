import { createContext, useContext, useState, useEffect } from 'react';
import { defaultItems } from '@/constants/nav-items';
import type { NavItem } from '@/types/navigation';

type OpenSubmenu = {
    type: 'main' | 'others';
    index: number;
} | null;

type SidebarContextType = {
    isExpanded: boolean;
    isMobileOpen: boolean;
    isHovered: boolean;
    activeItem: string | null;
    openSubmenu: OpenSubmenu;
    navItems: NavItem[];
    toggleSidebar: () => void;
    toggleMobileSidebar: () => void;
    setIsHovered: (isHovered: boolean) => void;
    setActiveItem: (item: string | null) => void;
    setOpenSubmenu: (
        submenu: OpenSubmenu | ((prev: OpenSubmenu) => OpenSubmenu),
    ) => void;
    setNavItems: (items: NavItem[]) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null);
    const [navItems, setNavItems] = useState<NavItem[]>(defaultItems);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setIsExpanded((prev) => !prev);
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen((prev) => !prev);
    };

    return (
        <SidebarContext.Provider
            value={{
                isExpanded: isMobile ? false : isExpanded,
                isMobileOpen,
                isHovered,
                activeItem,
                openSubmenu,
                toggleSidebar,
                toggleMobileSidebar,
                setIsHovered,
                setActiveItem,
                setOpenSubmenu,
                navItems,
                setNavItems,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};
