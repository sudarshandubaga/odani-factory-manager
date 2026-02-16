import React from "react";
import { AlertCircle, Mail, Phone } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export const ExpiredPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="bg-red-500 p-8 flex flex-col items-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-6 border border-white/30 shadow-xl">
                        <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-center">
                        Software Expired
                    </h1>
                    <p className="text-red-100 text-sm mt-2 text-center font-medium opacity-90">
                        Your subscription for Odani Factory Manager has ended.
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                            Immediate Actions
                        </h2>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-brand-200">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                <Phone className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">
                                    Call Software Manager
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 font-bold">
                                    +91 9636150842
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-brand-200">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                <Mail className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">
                                    Email Support
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 font-bold">
                                    info.xpertcoders@gmail.com
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 text-center">
                            <p className="text-sm font-bold text-brand-900">
                                Contact Software Manager for Renewal
                            </p>
                        </div>
                        <button
                            className="w-full bg-white text-gray-500 py-3 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                            onClick={handleLogout}
                        >
                            Log out of Session
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">
                                +91 9636150842
                            </span>
                        </div>
                        <div className="w-px h-3 bg-gray-200"></div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            System Ref ID: {Date.now().toString().slice(-8)}
                        </p>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 font-medium">
                &copy; {new Date().getFullYear()} Odani Factory Management
                Systems. All data is securely preserved.
            </p>
        </div>
    );
};
