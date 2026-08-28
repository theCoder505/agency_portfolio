import React, { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/surface/theme-toggle';

type AdminLoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm<AdminLoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login');
    };


    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
            <Head title="Admin Portal Login" />

            {/* Glowing background effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 blur-[130px] rounded-full pointer-events-none"></div>

            <div className="absolute top-6 right-6 flex items-center space-x-3">
                <ThemeToggle />
                <Link
                    href="/"
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    Back to Website ↗
                </Link>
            </div>

            <div className="relative w-full max-w-md space-y-6">
                {/* Brand Logo Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px] shadow-xl shadow-indigo-500/20 mb-2">
                        <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <ShieldCheck className="h-7 w-7 text-cyan-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white">
                        CodeVenture Admin
                    </h1>
                    <p className="text-xs text-slate-400">
                        Sign in with your verified administrator credentials
                    </p>
                </div>

                {/* Login Card */}
                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@gmail.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[11px] text-red-400 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[11px] text-red-400 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Keep me signed in</span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <span>{processing ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
