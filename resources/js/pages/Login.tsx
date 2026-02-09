import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    loginStart,
    loginSuccess,
    loginFailure,
} from "../store/slices/authSlice";
import { RootState } from "../store";
import api from "../services/api";

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const { isLoading, loadingText } = useSelector(
        (state: RootState) => state.ui,
    );
    const [mode, setMode] = useState<"login" | "forgot" | "change">("login");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const response = await api.post("/login", {
                email,
                password,
            });
            dispatch(loginSuccess(response.data));
            navigate("/");
        } catch (err: any) {
            dispatch(
                loginFailure(err.response?.data?.message || "Login failed"),
            );
        }
    };

    const handleForgot = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Reset link sent to registered email.");
        setMode("login");
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Password changed successfully.");
        setMode("login");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
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
            <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-lg rounded-xl">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        O
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {mode === "login"
                            ? "Sign in to account"
                            : mode === "forgot"
                              ? "Reset Password"
                              : "Change Password"}
                    </h2>
                </div>

                {mode === "login" && (
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="relative">
                                <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                            >
                                Sign in
                            </button>
                        </div>

                        <div className="flex justify-between text-sm">
                            <button
                                type="button"
                                onClick={() => setMode("forgot")}
                                className="text-brand-600 hover:text-brand-500"
                            >
                                Forgot password?
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("change")}
                                className="text-brand-600 hover:text-brand-500"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                )}

                {(mode === "forgot" || mode === "change") && (
                    <form
                        className="mt-8 space-y-6"
                        onSubmit={
                            mode === "forgot"
                                ? handleForgot
                                : handleChangePassword
                        }
                    >
                        <div className="relative">
                            <input
                                type={mode === "forgot" ? "email" : "password"}
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                placeholder={
                                    mode === "forgot"
                                        ? "Enter email address"
                                        : "New Password"
                                }
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
                            >
                                {mode === "forgot"
                                    ? "Send Reset Link"
                                    : "Update Password"}
                            </button>
                        </div>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
