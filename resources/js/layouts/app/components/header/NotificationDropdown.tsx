import { Bell } from "lucide-react";

export default function NotificationDropdown() {
  return (
    <button
      className="relative flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      <span className="absolute flex w-2 h-2 rounded-full top-1.5 right-1.5 bg-brand-500" />
    </button>
  );
}
