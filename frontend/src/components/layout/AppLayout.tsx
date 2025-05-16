import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

// Icons
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  requiresAuth: boolean;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, requiresAuth: true },
  { name: "Charts", href: "/charts", icon: ChartBarIcon, requiresAuth: true },
  {
    name: "New Query",
    href: "/query",
    icon: DocumentTextIcon,
    requiresAuth: true,
  },
  { name: "Profile", href: "/profile", icon: UserIcon, requiresAuth: true },
  {
    name: "Debug",
    href: "/debug",
    icon: CommandLineIcon,
    requiresAuth: true,
  },
];

const authNavigation: NavItem[] = [
  {
    name: "Login",
    href: "/login",
    icon: ArrowRightOnRectangleIcon,
    requiresAuth: false,
  },
  { name: "Register", href: "/register", icon: UserIcon, requiresAuth: false },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    // Redirect would happen automatically due to auth state change
  };

  // Filter navigation items based on auth status
  const navItems = isAuthenticated ? navigation : authNavigation;

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/80"
          aria-hidden="true"
          onClick={toggleSidebar}
        ></div>

        {/* Sidebar */}
        <div className="relative flex flex-col w-full max-w-xs pt-5 pb-4 h-full bg-dark-500 border-r border-dark-100">
          <div className="absolute top-0 right-0 pt-2 mr-2">
            <button
              type="button"
              className="flex items-center justify-center p-2 text-gray-300 hover:text-white"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-semibold text-white">
                Sol<span className="text-blue-500">Viz</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 h-0 mt-5 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-base font-medium
                      ${
                        isActive
                          ? "text-blue-500 border-l-2 border-blue-500 pl-[10px]"
                          : "text-gray-400 hover:text-white"
                      }
                    `}
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-400 hover:text-white mt-8"
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-3 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-dark-500 border-r border-dark-100">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-semibold text-white">
                  Sol<span className="text-blue-500">Viz</span>
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 mt-5 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                      ${
                        isActive
                          ? "bg-primary-600/20 text-white backdrop-blur-sm gradient-border"
                          : "text-gray-300 hover:bg-dark-300/50 hover:text-white"
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200
                        ${
                          isActive
                            ? "text-primary-400"
                            : "text-gray-400 group-hover:text-primary-400"
                        }
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-dark-300/50 hover:text-red-400 transition-all duration-200 ease-in-out"
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-400 transition-all duration-200"
                    aria-hidden="true"
                  />
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col lg:pl-64">
        {/* Navbar */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 h-16 bg-dark-500">
          <button
            type="button"
            className="px-4 text-gray-300 hover:text-white transition-colors duration-200 lg:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Navbar content split: left (title), right (actions) */}
          <div className="flex justify-between flex-1 px-4">
            {/* Left side: title */}
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold gradient-text">
                {pathname === "/" && "Welcome to SolViz Studio"}
                {pathname === "/dashboard" && "Dashboard"}
                {pathname === "/charts" && "My Charts"}
                {pathname === "/query" && "New Query"}
                {pathname === "/profile" && "Profile"}
                {pathname === "/login" && "Sign In"}
                {pathname === "/register" && "Create an Account"}
                {pathname === "/debug" && "Debug Console"}
              </h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-8">
            <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-10 animate-fade-in">
              <div className="">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
