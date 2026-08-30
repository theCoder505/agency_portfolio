import React, { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { User } from '@/types';
import { OtpModal } from '@/components/admin/otp-modal';
import {
    User as UserIcon,
    Mail,
    Phone,
    Building2,
    MapPin,
    Lock,
    Save,
    ShieldCheck,
    Eye,
    EyeOff,
    CheckCircle2,
    Sparkles,
    KeyRound
} from 'lucide-react';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

interface ProfileProps {
    user: User;
}

export default function CustomerProfile({ user }: ProfileProps) {
    // Basic Profile State
    const profileForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
        company_name: user.company_name || '',
        address: user.address || '',
    });

    // Email Change State
    const [newEmail, setNewEmail] = useState('');
    const [isRequestingEmailOtp, setIsRequestingEmailOtp] = useState(false);
    const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
    const [emailDevOtp, setEmailDevOtp] = useState<string | null>(null);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isRequestingPasswordOtp, setIsRequestingPasswordOtp] = useState(false);
    const [isPasswordOtpModalOpen, setIsPasswordOtpModalOpen] = useState(false);
    const [passwordDevOtp, setPasswordDevOtp] = useState<string | null>(null);

    // 1. Update Basic Profile
    const handleProfileSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.put('/customer/profile', {
            preserveScroll: true,
            onSuccess: () => showToast('Profile details updated successfully!', 'success'),
        });
    };

    // 2. Request OTP for Email Change
    const handleRequestEmailOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = newEmail.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            showErrorAlert('Invalid Email', 'Please enter a valid new email address.');
            return;
        }

        if (trimmedEmail === user.email.toLowerCase()) {
            showErrorAlert('Same Email', 'New email address must be different from your current email.');
            return;
        }

        setIsRequestingEmailOtp(true);
        try {
            const res = await fetch('/customer/profile/email/request-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ new_email: trimmedEmail }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setEmailDevOtp(data.dev_otp);
                setIsEmailOtpModalOpen(true);
                showToast(data.message || 'OTP verification code sent!', 'success');
            } else {
                showErrorAlert('Error', data.message || 'Could not send verification code.');
            }
        } catch {
            showErrorAlert('Network Error', 'Could not communicate with the server. Please try again.');
        } finally {
            setIsRequestingEmailOtp(false);
        }
    };

    // Confirm Email Change with OTP
    const handleVerifyEmailOtp = async (otp: string) => {
        const res = await fetch('/customer/profile/email/confirm', {
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
            showSuccessAlert('Email Updated!', data.message || 'Your account email address has been updated.');
            router.reload();
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
            const res = await fetch('/customer/profile/password/request-otp', {
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
        } catch {
            showErrorAlert('Network Error', 'Could not communicate with the server. Please try again.');
        } finally {
            setIsRequestingPasswordOtp(false);
        }
    };

    // Confirm Password Change with OTP
    const handleVerifyPasswordOtp = async (otp: string) => {
        const res = await fetch('/customer/profile/password/confirm', {
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
            showSuccessAlert('Password Updated!', data.message || 'Your account password has been changed successfully.');
        } else {
            showErrorAlert('Verification Failed', data.message || 'Invalid or expired OTP code.');
        }
    };

    return (
        <CustomerLayout
            title="Account Profile & Security"
            breadcrumbs={[{ title: 'Profile & Security' }]}
        >
            <div className="w-full space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Account Profile & Security Settings
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Manage your customer details, company billing information, verified account email, and password.
                    </p>
                </div>

                {/* Section 1: Personal & Company Details */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Personal & Company Details
                            </h2>
                            <p className="text-xs text-slate-400">Used for official SaaS deployments, contracts, and invoices.</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                                {profileForm.errors.name && <p className="text-red-500 text-[10px] mt-1">{profileForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Phone / WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    placeholder="+880 17XXXXXXXX"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                                {profileForm.errors.phone && <p className="text-red-500 text-[10px] mt-1">{profileForm.errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Company / Organization Name
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.company_name}
                                    onChange={(e) => profileForm.setData('company_name', e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Billing Address
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.address}
                                    onChange={(e) => profileForm.setData('address', e.target.value)}
                                    placeholder="Street address, city, country..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2"
                            >
                                <Save className="h-3.5 w-3.5" />
                                <span>{profileForm.processing ? 'Saving...' : 'Save Profile Changes'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Change Email with OTP Verification */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Update Account Email Address
                            </h2>
                            <p className="text-xs text-slate-400">Changing your account email requires email OTP verification for security.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Current Email Address (Verified)
                            </label>
                            <input
                                type="email"
                                disabled
                                value={user.email}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-xs font-mono text-slate-600 dark:text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                New Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new.email@example.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleRequestEmailOtp}
                            disabled={isRequestingEmailOtp || !newEmail}
                            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-all"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            <span>{isRequestingEmailOtp ? 'Sending OTP Code...' : 'Verify & Update Email'}</span>
                        </button>
                    </div>
                </div>

                {/* Section 3: Update Password with OTP Verification */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Update Account Password
                            </h2>
                            <p className="text-xs text-slate-400">Password changes require your current password and email OTP authorization.</p>
                        </div>
                    </div>

                    <form onSubmit={handleRequestPasswordOtp} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Current Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    New Password (Min. 8 chars) *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Confirm New Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isRequestingPasswordOtp || !currentPassword || !newPassword || !confirmPassword}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-all"
                            >
                                <Lock className="h-4 w-4" />
                                <span>{isRequestingPasswordOtp ? 'Sending OTP Code...' : 'Authorize & Change Password'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Email OTP Verification Modal */}
            <OtpModal
                isOpen={isEmailOtpModalOpen}
                title="Verify New Email Address"
                subtitle={`A 6-digit authorization code has been sent to ${user.email}. Enter it below to confirm your new email.`}
                devOtp={emailDevOtp}
                onVerify={handleVerifyEmailOtp}
                onClose={() => setIsEmailOtpModalOpen(false)}
            />

            {/* Password OTP Verification Modal */}
            <OtpModal
                isOpen={isPasswordOtpModalOpen}
                title="Authorize Password Change"
                subtitle={`A 6-digit security code has been sent to ${user.email}. Enter it below to finalize your new password.`}
                devOtp={passwordDevOtp}
                onVerify={handleVerifyPasswordOtp}
                onClose={() => setIsPasswordOtpModalOpen(false)}
            />
        </CustomerLayout>
    );
}
