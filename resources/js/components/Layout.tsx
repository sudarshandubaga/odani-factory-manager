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
    ChevronDown,
    Clock,
    LayoutDashboard,
    Package,
    BarChart3,
    UserCircle,
    Key,
    ShieldCheck,
    Truck,
    Tag,
    Receipt,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { RootState } from "../store";
import axios from "axios";
import { storage } from "../services/storage";
import { WorkType } from "../types";

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
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
        null,
    );
    const [rootWorkTypes, setRootWorkTypes] = React.useState<WorkType[]>([]);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        storage
            .getWorkTypes()
            .then((types) => {
                setRootWorkTypes(types.filter((t) => !t.parent_id));
            })
            .catch(() => {});
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const getDaysLeft = () => {
        if (!user?.tenant?.expires_at) return null;
        const expiry = new Date(user.tenant.expires_at);
        const today = new Date();
        const diff = expiry.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysLeft();
    const isPrintView = location.pathname.includes("/print");

    if (isPrintView) {
        return <>{children}</>;
    }

    const NavItem = ({
        to,
        label,
        icon: Icon,
    }: {
        to: string;
        label: string;
        icon: any;
    }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                        ? "text-brand-700 bg-brand-50 shadow-sm"
                        : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
                }`
            }
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </NavLink>
    );

    const Dropdown = ({
        label,
        items,
        id,
    }: {
        label: string;
        items: any[];
        id: string;
    }) => {
        const isOpen = activeDropdown === id;
        const hasActive = items.some((item) =>
            location.pathname.startsWith(item.to),
        );

        return (
            <div className="relative group">
                <button
                    onClick={() => setActiveDropdown(isOpen ? null : id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        hasActive
                            ? "text-brand-700 bg-brand-50"
                            : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
                    }`}
                >
                    <span>{label}</span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                        {items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setActiveDropdown(null)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        isActive
                                            ? "text-brand-700 bg-brand-50/50 font-bold"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                                    }`
                                }
                            >
                                <item.icon className="w-4 h-4 opacity-70" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Header */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 z-50 sticky top-0 no-print">
                <div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                    ref={dropdownRef}
                >
                    <div className="flex justify-between h-16">
                        {/* Left Side */}
                        <div className="flex items-center gap-8">
                            <NavLink
                                to="/"
                                className="flex items-center gap-2.5 group"
                            >
                                <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform">
                                    O
                                </div>
                                <span className="font-serif font-black text-xl tracking-tight text-gray-900">
                                    Odani
                                    <span className="text-brand-600">
                                        Factory
                                    </span>
                                </span>
                            </NavLink>

                            <div className="hidden lg:flex items-center gap-1">
                                <NavItem
                                    to="/"
                                    label="Dashboard"
                                    icon={LayoutDashboard}
                                />
                                <NavItem
                                    to="/purchase"
                                    label="Khilai"
                                    icon={Package}
                                />
                                {/* Dynamic Work Type links */}
                                {rootWorkTypes.length === 0 ? (
                                    <NavItem
                                        to="/work-orders"
                                        label="Work Orders"
                                        icon={ClipboardCheck}
                                    />
                                ) : rootWorkTypes.length === 1 ? (
                                    <NavItem
                                        to={`/work-orders?type=${rootWorkTypes[0].id}`}
                                        label={rootWorkTypes[0].name}
                                        icon={ClipboardCheck}
                                    />
                                ) : (
                                    <Dropdown
                                        label="Work Orders"
                                        id="work-types"
                                        items={rootWorkTypes.map((wt) => ({
                                            to: `/work-orders?type=${wt.id}`,
                                            label: wt.name,
                                            icon: ClipboardCheck,
                                        }))}
                                    />
                                )}
                                <NavItem
                                    to="/settings"
                                    label="Master"
                                    icon={Settings}
                                />
                                <Dropdown
                                    label="Reports"
                                    id="rep"
                                    items={[
                                        {
                                            to: "/reports/ledger",
                                            label: "Ledger Report",
                                            icon: FileText,
                                        },
                                        {
                                            to: "/vouchers",
                                            label: "Vouchers",
                                            icon: Receipt,
                                        },
                                        {
                                            to: "/reports/overdue",
                                            label: "Overdue Report",
                                            icon: AlertTriangle,
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {daysLeft !== null && (
                                <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-50 to-white rounded-xl border border-brand-100 shadow-sm transition-all hover:shadow-md">
                                    <div className="p-1 bg-white rounded-md shadow-xs">
                                        <Clock
                                            className={`w-3.5 h-3.5 ${daysLeft < 7 ? "text-red-500 animate-pulse" : "text-brand-600"}`}
                                        />
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[9px] uppercase font-black tracking-widest text-brand-400">
                                            Expires In
                                        </span>
                                        <span
                                            className={`text-sm font-black ${daysLeft < 7 ? "text-red-600" : "text-gray-900"}`}
                                        >
                                            {daysLeft} Days
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setActiveDropdown(
                                            activeDropdown === "user"
                                                ? null
                                                : "user",
                                        )
                                    }
                                    className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className="w-9 h-9 rounded-full bg-brand-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                        {user?.profile_photo ? (
                                            <img
                                                src={user.profile_photo}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle className="w-5 h-5 text-brand-600" />
                                        )}
                                    </div>
                                    <div className="hidden xl:block text-left leading-none">
                                        <p className="text-sm font-bold text-gray-900">
                                            {user?.name || "Member"}
                                        </p>
                                        <p className="text-[10px] text-brand-600 font-bold uppercase tracking-tighter">
                                            {user?.role || "Admin"}
                                        </p>
                                    </div>
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeDropdown === "user" ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {activeDropdown === "user" && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-5 bg-gray-50/50 border-b border-gray-100">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                                                My Account
                                            </p>
                                            <p className="font-bold text-gray-900 truncate">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    navigate("/profile");
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors"
                                            >
                                                <UserCircle className="w-4.5 h-4.5 opacity-70" />
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/profile");
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors"
                                            >
                                                <Key className="w-4.5 h-4.5 opacity-70" />
                                                Change Password
                                            </button>
                                            <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-4.5 h-4.5 opacity-70" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white shadow-xl animate-in slide-in-from-top duration-300">
                        <div className="p-4 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-brand-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                    {user?.profile_photo ? (
                                        <img
                                            src={user.profile_photo}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircle className="w-6 h-6 text-brand-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            {daysLeft !== null && (
                                <div
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${daysLeft < 7 ? "bg-red-50 text-red-700 border-red-100 animate-pulse" : "bg-green-50 text-green-700 border-green-100"}`}
                                >
                                    {daysLeft} Days
                                </div>
                            )}
                        </div>
                        <div className="p-4 space-y-3">
                            <NavItem
                                to="/"
                                label="Dashboard"
                                icon={LayoutDashboard}
                            />
                            <NavItem
                                to="/purchase"
                                label="Khilai"
                                icon={Package}
                            />
                            {/* Dynamic Work Type links */}
                            {rootWorkTypes.length === 0 ? (
                                <NavItem
                                    to="/work-orders"
                                    label="Work Orders"
                                    icon={ClipboardCheck}
                                />
                            ) : (
                                rootWorkTypes.map((wt) => (
                                    <NavItem
                                        key={wt.id}
                                        to={`/work-orders?type=${wt.id}`}
                                        label={wt.name}
                                        icon={ClipboardCheck}
                                    />
                                ))
                            )}
                            <NavItem
                                to="/settings"
                                label="Master"
                                icon={Settings}
                            />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-3 mt-4 mb-1">
                                Reports
                            </p>
                            <NavItem
                                to="/reports/ledger"
                                label="Ledger Report"
                                icon={FileText}
                            />
                            <NavItem
                                to="/vouchers"
                                label="Vouchers"
                                icon={Receipt}
                            />
                            <NavItem
                                to="/reports/overdue"
                                label="Overdue Report"
                                icon={AlertTriangle}
                            />
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-lg"
                                >
                                    <LogOut className="w-4.5 h-4.5" />
                                    Logout Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                {isLoading && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-all">
                        <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                            <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-brand-900 font-bold lowercase tracking-tight animate-pulse">
                                {loadingText}...
                            </p>
                        </div>
                    </div>
                )}
                {children}
            </main>

            <footer className="bg-white border-t border-gray-100 py-8 no-print mt-auto">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
                            O
                        </div>
                        <span className="font-serif font-black text-sm text-gray-900">
                            Odani
                            <span className="text-brand-600">Factory</span>
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                        &copy; {new Date().getFullYear()} Precision Factory
                        Management. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secure Environment
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
