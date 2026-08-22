import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Admin, SharedData } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import { OtpModal } from '@/components/admin/otp-modal';
import {
    ShieldCheck,
    Mail,
    Lock,
    KeyRound,
    User,
    Save,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

export default function AdminProfile() {
    const { auth } = usePage<SharedData>().props;
    const admin = auth?.admin;

    // Basic Info State
    const [name, setName] = useState(admin?.name || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [existingAvatar, setExistingAvatar] = useState<string | null>(admin?.avatar || null);
    const [isUpdatingBasic, setIsUpdatingBasic] = useState(false);

    // Email Change State
    const [newEmail, setNewEmail] = useState('');
    const [isRequestingEmailOtp, setIsRequestingEmailOtp] = useState(false);
    const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
    const [emailDevOtp, setEmailDevOtp] = useState<string | null>(null);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRequestingPasswordOtp, setIsRequestingPasswordOtp] = useState(false);
    const [isPasswordOtpModalOpen, setIsPasswordOtpModalOpen] = useState(false);
    const [passwordDevOtp, setPasswordDevOtp] = useState<string | null>(null);

    // 1. Update Basic Profile (Name & Avatar with Live Preview)
    const handleUpdateBasic = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingBasic(true);

        const formData = new FormData();
        formData.append('name', name);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        router.post('/admin/profile/basic', formData, {
            preserveScroll: true,
            onFinish: () => setIsUpdatingBasic(false),
        });
    };

    // 2. Request OTP for Email Change
    const handleRequestEmailOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newEmail.includes('@')) {
            showErrorAlert('Invalid Email', 'Please provide a valid new email address.');
            return;
        }

        setIsRequestingEmailOtp(true);
        try {
            const res = await fetch('/admin/profile/email/request-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ new_email: newEmail }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setEmailDevOtp(data.dev_otp);
                setIsEmailOtpModalOpen(true);
                showToast(data.message || 'OTP verification code sent!', 'success');
            } else {
                showErrorAlert('Error', data.message || 'Could not initiate email change.');
            }
        } catch (err) {
            showErrorAlert('Error', 'Network error. Please try again.');
        } finally {
            setIsRequestingEmailOtp(false);
        }
    };

    // Confirm Email Change with OTP
    const handleVerifyEmailOtp = async (otp: string) => {
        const res = await fetch('/admin/profile/email/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({ otp }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
            setIsEmailOtpModalOpen(false);
            setNewEmail('');
            showSuccessAlert('Email Updated!', data.message || 'Administrator email updated successfully.');
            router.reload({ preserveScroll: true });
        } else {
            showErrorAlert('Verification Failed', data.message || 'Invalid or expired OTP code.');
        }
    };

    // 3. Request OTP for Password Change
    const handleRequestPasswordOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            showErrorAlert('Password Too Short', 'New password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showErrorAlert('Password Mismatch', 'New password and confirmation do not match.');
            return;
        }

        setIsRequestingPasswordOtp(true);
        try {
            const res = await fetch('/admin/profile/password/request-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setPasswordDevOtp(data.dev_otp);
                setIsPasswordOtpModalOpen(true);
                showToast(data.message || 'OTP verification code sent!', 'success');
            } else {
                showErrorAlert('Security Error', data.message || 'Could not verify current password.');
            }
        } catch (err) {
            showErrorAlert('Error', 'Network error. Please try again.');
        } finally {
            setIsRequestingPasswordOtp(false);
        }
    };

    // Confirm Password Change with OTP
    const handleVerifyPasswordOtp = async (otp: string) => {
        const res = await fetch('/admin/profile/password/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({ otp }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
            setIsPasswordOtpModalOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showSuccessAlert('Password Changed!', data.message || 'Administrator password changed successfully.');
        } else {
            showErrorAlert('Verification Failed', data.message || 'Invalid or expired OTP code.');
        }
    };

    return (
        <AdminLayout
            title="Profile & OTP Security"
            breadcrumbs={[{ title: 'Profile & Security' }]}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Administrator Profile & OTP Security
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage your super admin credentials. Email and password changes require OTP two-factor confirmation.
                    </p>
                </div>

                {/* Section 1: Basic Information */}
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Basic Administrator Info
                            </h3>
                            <p className="text-xs text-slate-500">Update your public administrator display name and avatar.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateBasic} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                            />
                        </div>

                        {/* Avatar Image Uploader with Live Preview */}
                        <ImageUploader
                            label="Profile Avatar (Live Preview)"
                            multiple={false}
                            existingImages={existingAvatar}
                            onChange={(file) => setAvatarFile(file instanceof File ? file : null)}
                        />

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isUpdatingBasic}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md"
                            >
                                {isUpdatingBasic ? 'Saving...' : 'Update Profile Info'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Change Email with OTP Verification */}
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Update Email Address (OTP Protected)
                            </h3>
                            <p className="text-xs text-slate-500">
                                Current verified email: <strong className="font-mono text-slate-800 dark:text-slate-200">{admin?.email}</strong>
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleRequestEmailOtp} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                New Administrator Email Address
                            </label>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <input
                                    type="email"
                                    required
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="new.email@codeventure.tech"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isRequestingEmailOtp}
                                    className="w-full sm:w-auto shrink-0 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    <span>{isRequestingEmailOtp ? 'Sending OTP...' : 'Send OTP to Verify'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Section 3: Change Password with OTP Verification */}
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Change Password (OTP Protected)
                            </h3>
                            <p className="text-xs text-slate-500">Requires entering your current password and confirming with an OTP code.</p>
                        </div>
                    </div>

                    <form onSubmit={handleRequestPasswordOtp} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Current Password
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    New Password (Min 8 chars)
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isRequestingPasswordOtp}
                                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                            >
                                <KeyRound className="h-4 w-4" />
                                <span>{isRequestingPasswordOtp ? 'Verifying...' : 'Request Password Change OTP'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Email OTP Verification Modal */}
            <OtpModal
                isOpen={isEmailOtpModalOpen}
                title="Verify Email Update"
                subtitle={`Enter the 6-digit verification code sent to ${admin?.email} to confirm updating your email to ${newEmail}.`}
                devOtp={emailDevOtp}
                onVerify={handleVerifyEmailOtp}
                onClose={() => setIsEmailOtpModalOpen(false)}
            />

            {/* Password OTP Verification Modal */}
            <OtpModal
                isOpen={isPasswordOtpModalOpen}
                title="Verify Password Change"
                subtitle={`Enter the 6-digit verification code sent to ${admin?.email} to confirm updating your password.`}
                devOtp={passwordDevOtp}
                onVerify={handleVerifyPasswordOtp}
                onClose={() => setIsPasswordOtpModalOpen(false)}
            />
        </AdminLayout>
    );
}
