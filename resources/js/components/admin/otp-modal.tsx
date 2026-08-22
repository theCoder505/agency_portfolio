import React, { useState, useEffect } from 'react';
import { X, KeyRound, CheckCircle2 } from 'lucide-react';

interface OtpModalProps {
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    devOtp?: string | null;
    onVerify: (otp: string) => Promise<void>;
    onClose: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
    isOpen,
    title = 'Security OTP Verification',
    subtitle = 'Please enter the 6-digit code sent to your admin email address.',
    devOtp,
    onVerify,
    onClose,
}) => {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setOtp('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        setIsSubmitting(true);
        try {
            await onVerify(otp);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xl space-y-6">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
                        <KeyRound className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                {devOtp && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] font-mono text-amber-700 dark:text-amber-300 text-center">
                        ⚡ <strong>Local Dev OTP:</strong> {devOtp}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex justify-center">
                        <input
                            type="text"
                            maxLength={6}
                            required
                            autoFocus
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="••••••"
                            className="w-48 px-4 py-3 rounded-2xl border-2 border-indigo-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center text-2xl tracking-[0.5em] font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={otp.length !== 6 || isSubmitting}
                            className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{isSubmitting ? 'Verifying...' : 'Confirm'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
