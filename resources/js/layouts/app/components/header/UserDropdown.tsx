import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { SharedData } from '@/types';

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        router.post(logout.url());
    };

    if (!user) return null;

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                    {initials}
                </div>
                <div className="hidden text-left lg:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                    </p>
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <div className="py-2">
                        <Link
                            href={edit.url()}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </Link>
                    </div>
                    <div className="border-t border-gray-200 py-2 dark:border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800"
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
