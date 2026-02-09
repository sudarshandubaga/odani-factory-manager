import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    LogOut,
    Factory,
    FileText,
    Users,
    ClipboardCheck,
    Settings,
    Menu,
    X,
    AlertTriangle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { RootState } from "../store";
import axios from "axios";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { isLoading, loadingText } = useSelector(
        (state: RootState) => state.ui,
    );
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("ofm_token");
            await axios.post(
                "/api/logout",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
        } catch (e) {
            console.error("Logout failed", e);
        }
        dispatch(logout());
        navigate("/login");
    };

    const navItems = [
        { to: "/", label: "Dashboard", icon: Factory },
        { to: "/purchase", label: "Purchases", icon: FileText },
        { to: "/work-orders", label: "Work Orders", icon: ClipboardCheck },
        { to: "/workers", label: "Workers", icon: Users },
        {
            to: "/reports/overdue",
            label: "Overdue Report",
            icon: AlertTriangle,
        },
        { to: "/settings", label: "Masters", icon: Settings },
    ];

    const isPrintView = location.pathname.includes("/print");

    if (isPrintView) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-white shadow-md z-10 sticky top-0 no-print border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    O
                                </div>
                                <span className="font-serif font-bold text-xl text-gray-800">
                                    Odani
                                    <span className="text-brand-600">
                                        Factory
                                    </span>
                                </span>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                isActive
                                                    ? "text-brand-700 bg-brand-50"
                                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                            }`
                                        }
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 hover:bg-red-50 focus:outline-none"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setMobileMenuOpen(!mobileMenuOpen)
                                    }
                                    className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-gray-200">
                        <div className="pt-2 pb-3 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                                            isActive
                                                ? "bg-brand-50 border-brand-500 text-brand-700"
                                                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                                        }`
                                    }
                                >
                                    <div className="flex items-center">
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </div>
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                                <div className="flex items-center">
                                    <LogOut className="w-5 h-5 mr-3" />
                                    Logout
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-brand-700 font-medium animate-pulse">
                                {loadingText}
                            </p>
                        </div>
                    </div>
                )}
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 py-4 no-print">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Odani Factory Manager. All
                    rights reserved.
                </div>
            </footer>
        </div>
    );
};
