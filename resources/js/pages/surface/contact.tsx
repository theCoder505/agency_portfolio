import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    ShieldCheck,
    CheckCircle2,
    RefreshCw,
    Lock,
    KeyRound,
    MessageSquare,
    Sparkles,
    Clock
} from 'lucide-react';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

export default function Contact() {
    const { app_settings, errors } = usePage<SharedData>().props;

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const email = app_settings?.contact_email || 'hello@codeventure.tech';
    const phone = app_settings?.contact_phone || '+1 (555) 234-5678';
    const address1 = app_settings?.address_line1 || '100 Silicon Vista Way, Suite 400';
    const address2 = app_settings?.address_line2 || 'San Francisco, CA 94107, USA';
    const mapEmbedUrl = app_settings?.google_map_embed_url;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service_interested: 'SaaS Platform Development',
        subject: '',
        message: '',
        captcha_id: '',
        captcha_answer: '',
    });

    // Captcha state
    const [captchaQuestion, setCaptchaQuestion] = useState('Loading challenge...');
    const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);

    // OTP state
    const [otpCode, setOtpCode] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    // Fetch initial captcha
    const fetchCaptcha = async () => {
        setIsCaptchaLoading(true);
        try {
            const res = await fetch('/contact/captcha');
            const data = await res.json();
            setFormData((prev) => ({ ...prev, captcha_id: data.captcha_id, captcha_answer: '' }));
            setCaptchaQuestion(data.question);
        } catch (err) {
            setCaptchaQuestion('5 + 3 = ?');
        } finally {
            setIsCaptchaLoading(false);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // Send OTP to visitor's email
    const handleSendOtp = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            showErrorAlert('Email Required', 'Please enter a valid email address first.');
            return;
        }

        setIsSendingOtp(true);
        try {
            const response = await fetch('/contact/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setIsOtpSent(true);
                setCountdown(60);
                if (data.dev_otp) {
                    setDevOtp(data.dev_otp);
                }
                showToast(data.message || 'OTP verification code sent!', 'success');
            } else {
                showErrorAlert('Error', data.message || 'Could not send verification code.');
            }
        } catch (err) {
            showErrorAlert('Error', 'Network error. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Verify OTP code entered by visitor
    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) {
            showErrorAlert('Invalid Code', 'Please enter the 6-digit verification code.');
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const response = await fetch('/contact/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ email: formData.email, otp: otpCode }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setIsOtpVerified(true);
                showSuccessAlert('Email Verified!', 'Your email has been authenticated. You can now submit your project inquiry.');
            } else {
                showErrorAlert('Verification Failed', data.message || 'Invalid or expired code.');
            }
        } catch (err) {
            showErrorAlert('Error', 'Network error during verification.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // Final Form Submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isOtpVerified) {
            showErrorAlert('Email Not Verified', 'Please verify your email address using the Send OTP button before submitting.');
            return;
        }

        if (!formData.captcha_answer) {
            showErrorAlert('Captcha Required', 'Please answer the security math question.');
            return;
        }

        router.post('/contact', formData, {
            onSuccess: () => {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    service_interested: 'SaaS Platform Development',
                    subject: '',
                    message: '',
                    captcha_id: '',
                    captcha_answer: '',
                });
                setIsOtpSent(false);
                setIsOtpVerified(false);
                setOtpCode('');
                setDevOtp(null);
                fetchCaptcha();
            },
            onError: () => {
                fetchCaptcha();
            },
        });
    };

    return (
        <SurfaceLayout
            title="Contact Us & Get a Quote"
            description="Connect with CodeVenture Tech architects to discuss your web application or SaaS platform."
        >
            {/* Header */}
            <section className="pt-16 pb-16 bg-slate-900/40 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-850">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold mb-3">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Initiate Collaboration</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        Let's Engineer Something Exceptional
                    </h1>
                    <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
                        Fill out the inquiry form below. Every inquiry is reviewed by our principal software engineers and receives a response within 24 hours.
                    </p>
                </div>
            </section>

            {/* Main Form & Contact Info Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Side: Contact Information & Direct Channels */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"></div>

                                <h3 className="text-2xl font-black tracking-tight">Direct Channels</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Have an urgent RFP or technical inquiry? Reach out directly to our engineering coordinators.
                                </p>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs uppercase font-bold text-slate-400">Office Location</div>
                                            <div className="text-sm font-semibold text-white mt-0.5">{address1}</div>
                                            <div className="text-xs text-slate-400">{address2}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs uppercase font-bold text-slate-400">Inquiry Email</div>
                                            <a href={`mailto:${email}`} className="text-sm font-semibold text-cyan-400 hover:underline mt-0.5 block">
                                                {email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs uppercase font-bold text-slate-400">Direct Telephone</div>
                                            <a href={`tel:${phone}`} className="text-sm font-semibold text-white hover:underline mt-0.5 block">
                                                {phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Google Map Embed */}
                            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md h-72 bg-slate-950">
                                {mapEmbedUrl ? (
                                    <iframe
                                        src={mapEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                                        Map Preview
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: OTP-Verified and Captcha-Protected Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-xl space-y-6">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                        Project Inquiry Form
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Security verification (OTP + Captcha) required before submission.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name & Phone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Your Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Jonathan Vance"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Phone Number (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Email + OTP Verification Engine */}
                                    <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950/60 border border-indigo-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                                                <span>Work Email (OTP Verified)</span> <span className="text-red-500">*</span>
                                            </label>

                                            {isOtpVerified && (
                                                <span className="inline-flex items-center space-x-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>Verified</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-2">
                                            <input
                                                type="email"
                                                required
                                                disabled={isOtpVerified}
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    setIsOtpVerified(false);
                                                    setIsOtpSent(false);
                                                }}
                                                placeholder="you@company.com"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                                            />

                                            {!isOtpVerified && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    disabled={isSendingOtp || countdown > 0}
                                                    className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                                                >
                                                    {isSendingOtp ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Send OTP'}
                                                </button>
                                            )}
                                        </div>

                                        {/* OTP Input Field when sent */}
                                        {isOtpSent && !isOtpVerified && (
                                            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    placeholder="Enter 6-digit code"
                                                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl border-2 border-indigo-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm font-bold focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyOtp}
                                                    disabled={isVerifyingOtp}
                                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                                                >
                                                    {isVerifyingOtp ? 'Checking...' : 'Verify OTP'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Local Dev OTP helper */}
                                        {devOtp && !isOtpVerified && (
                                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                                                ⚡ <strong>Dev Preview Code:</strong> {devOtp} (Sent via Mailer)
                                            </div>
                                        )}
                                    </div>

                                    {/* Service Interested & Subject */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Service Required
                                            </label>
                                            <select
                                                value={formData.service_interested}
                                                onChange={(e) => setFormData({ ...formData, service_interested: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="SaaS Platform Development">SaaS Platform Development</option>
                                                <option value="AI & Intelligent Workspace">AI & Intelligent Workspace</option>
                                                <option value="Headless E-Commerce">Headless E-Commerce</option>
                                                <option value="Custom Enterprise Portal">Custom Enterprise Portal</option>
                                                <option value="Interactive 3D Web App">Interactive 3D Web App</option>
                                                <option value="Codebase Audit & Optimization">Codebase Audit & Optimization</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Subject <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="e.g. Next-Gen FinTech Portal"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Project Scope & Details <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us about your project requirements, target timeline, and tech preferences..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                                        />
                                    </div>

                                    {/* Security Captcha Challenge */}
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Anti-Bot Verification
                                                </div>
                                                <div className="text-xs font-mono text-indigo-600 dark:text-cyan-400 font-bold">
                                                    {captchaQuestion}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={fetchCaptcha}
                                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                                title="Refresh challenge"
                                            >
                                                <RefreshCw className={`h-4 w-4 ${isCaptchaLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>

                                        <input
                                            type="number"
                                            required
                                            value={formData.captcha_answer}
                                            onChange={(e) => setFormData({ ...formData, captcha_answer: e.target.value })}
                                            placeholder="Your answer"
                                            className="w-full sm:w-32 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!isOtpVerified}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Submit Project Inquiry</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </SurfaceLayout>
    );
}
