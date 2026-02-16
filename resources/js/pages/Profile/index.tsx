import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { loginSuccess } from "../../store/slices/authSlice";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { User, Lock, Camera, Save, Key } from "lucide-react";

export const ProfilePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        profile_photo: user?.profile_photo || "",
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post("/profile", profileForm);
            dispatch(
                loginSuccess({
                    user: response.data.user,
                    token: localStorage.getItem("ofm_token"),
                }),
            );
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to update profile",
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.password !== passwordForm.password_confirmation) {
            return toast.error("Passwords do not match");
        }
        setLoading(true);
        try {
            await api.post("/profile/change-password", passwordForm);
            toast.success("Password changed successfully!");
            setPasswordForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to change password",
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileForm({
                    ...profileForm,
                    profile_photo: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Edit Section */}
                <div className="flex-1 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b bg-gray-50 flex items-center gap-2">
                        <User className="w-5 h-5 text-brand-600" />
                        <h2 className="text-lg font-bold text-gray-900">
                            Edit Profile
                        </h2>
                    </div>
                    <form
                        onSubmit={handleProfileSubmit}
                        className="p-6 space-y-6"
                    >
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-brand-100 border-2 border-brand-200 flex items-center justify-center overflow-hidden">
                                    {profileForm.profile_photo ? (
                                        <img
                                            src={profileForm.profile_photo}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-brand-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-1.5 bg-brand-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-brand-700 transition-colors">
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">
                                Click camera to upload new photo
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border p-2 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full border p-2 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-600 text-white py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="flex-1 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b bg-gray-50 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-brand-600" />
                        <h2 className="text-lg font-bold text-gray-900">
                            Change Password
                        </h2>
                    </div>
                    <form
                        onSubmit={handlePasswordSubmit}
                        className="p-6 space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.current_password}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        current_password: e.target.value,
                                    })
                                }
                                className="w-full border p-2 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                required
                            />
                        </div>
                        <div className="h-px bg-gray-100 my-4"></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.password}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full border p-2 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.password_confirmation}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        password_confirmation: e.target.value,
                                    })
                                }
                                className="w-full border p-2 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-800 text-white py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-50"
                        >
                            <Key className="w-4 h-4" />
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                    <div className="p-6 bg-yellow-50 border-t border-yellow-100">
                        <p className="text-xs text-yellow-800 leading-relaxed italic">
                            <b>Security Tip:</b> Use a strong password with at
                            least 8 characters, including symbols and numbers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
