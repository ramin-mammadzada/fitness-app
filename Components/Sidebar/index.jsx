"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Dumbbell,
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "İstifadəçilər",
    href: "/gym-users",
    icon: <Users size={20} />,
    emoji: "👥",
  },
  {
    label: "Məşqçilər",
    href: "/trainers",
    icon: <Users size={20} />,
    emoji: "💪",
  },
  {
    label: "İşçilər",
    href: "/staff",
    icon: <UserCog size={20} />,
    emoji: "👔",
  },
  {
    label: "Xidmət Kateqoriyaları",
    href: "/service-categories",
    icon: <Dumbbell size={20} />,
    emoji: "🏷️",
  },
  {
    label: "Servislər",
    href: "/services",
    icon: <Dumbbell size={20} />,
    emoji: "⚡",
  },
  {
    label: "Kartlar",
    href: "/cards",
    icon: <UserCog size={20} />,
    emoji: "💳",
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-gradient-to-b from-indigo-50 via-white to-purple-50 border-r border-indigo-100 transition-all duration-300 h-full shadow-xl ${
        open ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="relative">
        <div className="bg-white rounded-r-2xl shadow-lg border border-indigo-100 mx-2 mt-4 mb-6">
          <div className="flex items-center justify-between h-16 px-4">
            {open ? (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Gym Panel
                </h1>
                <p className="text-xs text-gray-500">İdarə Paneli</p>
              </div>
            ) : (
              <div className="text-2xl">🏋️</div>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="px-3 space-y-2">
        {navItems.map(({ label, href, emoji }, index) => {
          const isActive = pathname === href;

          return (
            <Link
              key={index}
              href={href}
              className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:bg-white hover:shadow-md hover:border-indigo-100 hover:transform hover:scale-102"
              } ${!open && "justify-center"}`}
            >
              {/* Background for non-active items */}
              {!isActive && (
                <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-transparent group-hover:border-indigo-100"></div>
              )}

              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={`text-xl flex-shrink-0 ${
                    isActive ? "animate-pulse" : ""
                  }`}
                >
                  {emoji}
                </div>
                {open && (
                  <span
                    className={`text-sm font-medium truncate transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 group-hover:text-indigo-600"
                    }`}
                  >
                    {label}
                  </span>
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}

              {/* Tooltip for collapsed state */}
              {!open && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {label}
                  <div className="absolute top-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45 transform -translate-y-1/2"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
