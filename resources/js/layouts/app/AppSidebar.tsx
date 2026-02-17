import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppLogoIcon from '@/components/AppLogoIcon';
import { defaultItems } from '@/lib/nav-items';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types/navigation';
import { useSidebar } from '../../hooks/useSidebar';

const AppSidebar: React.FC = () => {
    const {
        isExpanded,
        isMobileOpen,
        isHovered,
        setIsHovered,
        openSubmenu,
        setOpenSubmenu,
        navItems,
        setNavItems,
        toggleMobileSidebar,
    } = useSidebar();
    const page = usePage();
    const currentPath = page.url;

    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {},
    );
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const closeMobileSidebar = () => {
        if (isMobileOpen) {
            toggleMobileSidebar();
        }
    };

    const isActive = useCallback(
        (path: string) => currentPath === path,
        [currentPath],
    );

    useEffect(() => {
        setNavItems(defaultItems);
    }, [setNavItems]);

    useEffect(() => {
        let submenuMatched = false;
        for (const nav of navItems) {
            if (nav.subItems) {
                for (const subItem of nav.subItems) {
                    if (isActive(subItem.href)) {
                        setOpenSubmenu({
                            type: 'main',
                            index: navItems.indexOf(nav),
                        });
                        submenuMatched = true;
                        return; // break
                    }
                }
            }
        }

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [currentPath, isActive, navItems, setOpenSubmenu]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (
        index: number,
        menuType: 'main' | 'others',
    ) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    };

    const renderMenuItems = (items: NavItem[], menuType: 'main') => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`group menu-item ${
                                openSubmenu?.type === menuType &&
                                openSubmenu?.index === index
                                    ? 'menu-item-active'
                                    : 'menu-item-inactive'
                            } cursor-pointer ${
                                !isExpanded && !isHovered
                                    ? 'lg:justify-center'
                                    : 'lg:justify-start'
                            }`}
                        >
                            <span
                                className={`menu-item-icon-size ${
                                    openSubmenu?.type === menuType &&
                                    openSubmenu?.index === index
                                        ? 'menu-item-icon-active'
                                        : 'menu-item-icon-inactive'
                                }`}
                            >
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">
                                    {nav.name}
                                </span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDown
                                    className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? 'rotate-180 text-brand-500'
                                            : ''
                                    }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.href && (
                            <Link
                                href={nav.href}
                                className={`group menu-item ${
                                    isActive(nav.href)
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                }`}
                                preserveState
                                onClick={closeMobileSidebar}
                            >
                                <span
                                    className={`menu-item-icon-size ${
                                        isActive(nav.href)
                                            ? 'menu-item-icon-active'
                                            : 'menu-item-icon-inactive'
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">
                                        {nav.name}
                                    </span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems &&
                        (isExpanded || isHovered || isMobileOpen) && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[
                                        `${menuType}-${index}`
                                    ] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height:
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                            : '0px',
                                }}
                            >
                                <ul className="mt-2 ml-9 space-y-1">
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                href={subItem.href}
                                                className={`menu-dropdown-item ${
                                                    isActive(subItem.href)
                                                        ? 'menu-dropdown-item-active'
                                                        : 'menu-dropdown-item-inactive'
                                                }`}
                                                preserveState
                                                onClick={closeMobileSidebar}
                                            >
                                                {subItem.name}
                                                <span className="ml-auto flex items-center gap-1">
                                                    {subItem.new && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(
                                                                    subItem.href,
                                                                )
                                                                    ? 'menu-dropdown-badge-active'
                                                                    : 'menu-dropdown-badge-inactive'
                                                            } menu-dropdown-badge`}
                                                        >
                                                            new
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r bg-[#ecf4fa] border-gray-200 px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 ${
                isExpanded || isMobileOpen
                    ? 'w-72.5'
                    : isHovered
                      ? 'w-72.5'
                      : 'w-22.5'
            } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isExpanded || isHovered || isMobileOpen ? (
                <div
                    className={`flex py-5.5 ${
                        !isExpanded && !isHovered
                            ? 'lg:justify-center'
                            : 'justify-center'
                    }`}
                >
                    <Link
                        href={dashboard.url()}
                        className="flex flex-col items-center justify-center gap-4 whitespace-nowrap"
                        preserveState
                    >
                        <AppLogoIcon />
                        <h1 className="-mt-6 text-xl font-bold text-foreground">
                            E-Dokumen
                        </h1>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-row items-center justify-center gap-4 py-5.5 whitespace-nowrap">
                    <AppLogoIcon />
                </div>
            )}

            <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 flex text-xs leading-5 text-gray-400 uppercase ${
                                    !isExpanded && !isHovered
                                        ? 'lg:justify-center'
                                        : 'justify-start'
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    'Menu'
                                ) : (
                                    <MoreHorizontal className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems, 'main')}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
