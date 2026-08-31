import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
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
    Clock,
    Globe,
    Zap,
    Activity,
    Check,
    Copy,
    Radio
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
    const whatsappNumber = app_settings?.whatsapp_number;
    const whatsappPrompt = app_settings?.whatsapp_message_prompt || 'Hello CodeVenture Tech! I would like to discuss building a project.';
    const cleanWhatsapp = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappPrompt)}` : '';

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
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(label);
        showToast(`${label} copied to clipboard!`, 'info');
        setTimeout(() => setCopiedField(null), 2000);
    };

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
            {/* HERO BANNER */}
            <section className="relative pt-20 pb-20 overflow-hidden">
                {/* specialized ambient backlights */}
                <div className="absolute -top-32 -left-20 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute -top-24 -right-20 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10">
                    {/* Pulsing Status Badge */}
                    <div data-aos="fade-down" className="cv-badge mb-5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                        </span>
                        <span className="tracking-wide uppercase font-black text-[11px]">Engineering Dispatch Portal</span>
                    </div>

                    {/* Headline */}
                    <h1 data-aos="fade-up" data-aos-delay="100" className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        Let's Engineer <span className="cv-gradient-text">Something Exceptional</span>
                    </h1>

                    {/* Subtitle */}
                    <p data-aos="fade-up" data-aos-delay="200" className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Connect directly with our principal software architects. Every project inquiry is evaluated with architectural rigor and receives a response within 24 hours.
                    </p>

                    {/* Live Telemetry Status Bar */}
                    <div data-aos="fade-up" data-aos-delay="300" className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                        <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl cv-card shadow-lg">
                            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</div>
                                <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Online & Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl cv-card shadow-lg">
                            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SLA Response</div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">&lt; 24 Hours</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl cv-card shadow-lg">
                            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security</div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">OTP + Anti-Bot</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl cv-card shadow-lg">
                            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                                <Globe className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Coverage</div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">Global Relays</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Form & Contact Info Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Side: Contact Information & Direct Channels */}
                        <div className="lg:col-span-5 space-y-8" data-aos="fade-right">
                            <div className="cv-card p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Direct Channels</h3>
                                        <span className="cv-badge text-[10px]">
                                            Priority Connect
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Have an urgent RFP or specific technical inquiry? Reach out directly to our engineering coordination desk.
                                    </p>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#01121e]/80 border border-slate-200/60 dark:border-cyan-500/15">
                                            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 shrink-0">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs uppercase font-bold text-slate-400">Office Location</div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{address1}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{address2}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#01121e]/80 border border-slate-200/60 dark:border-cyan-500/15">
                                            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 shrink-0">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs uppercase font-bold text-slate-400">Inquiry Email</div>
                                                <div className="flex items-center justify-between mt-0.5">
                                                    <a href={`mailto:${email}`} className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                                                        {email}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(email, 'Email')}
                                                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded transition-colors"
                                                        title="Copy email"
                                                    >
                                                        {copiedField === 'Email' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#01121e]/80 border border-slate-200/60 dark:border-cyan-500/15">
                                            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 shrink-0">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs uppercase font-bold text-slate-400">Direct Telephone</div>
                                                <div className="flex items-center justify-between mt-0.5">
                                                    <a href={`tel:${phone}`} className="text-sm font-bold text-slate-900 dark:text-white hover:underline">
                                                        {phone}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(phone, 'Phone')}
                                                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded transition-colors"
                                                        title="Copy phone"
                                                    >
                                                        {copiedField === 'Phone' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {whatsappUrl && (
                                            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                                                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
                                                    <WhatsAppIcon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs uppercase font-bold text-slate-500 dark:text-slate-300">Instant WhatsApp</div>
                                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 block">
                                                        {whatsappNumber}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Google Map Embed with Cyber Frame */}
                            <div className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-cyan-500/20 shadow-xl h-72 bg-[#01121e] relative">
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
                        <div className="lg:col-span-7" data-aos="fade-left">
                            <div className="cv-card rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-cyan-500/15 pb-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                            Project Inquiry Form
                                        </h3>
                                        <span className="cv-badge text-xs">
                                            <Zap className="h-3 w-3 text-cyan-400" />
                                            <span>Direct Architecture Queue</span>
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                        Authenticated security verification (OTP + Anti-Bot challenge) required before submission.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
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
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white/70 dark:bg-[#01121e]/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
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
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white/70 dark:bg-[#01121e]/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Email + OTP Verification Engine */}
                                    <div className="space-y-3 p-4 rounded-2xl bg-cyan-50/50 dark:bg-[#01121e]/80 border border-cyan-100 dark:border-cyan-500/20">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                <KeyRound className="h-3.5 w-3.5 text-cyan-500" />
                                                <span>Work Email (OTP Verified)</span> <span className="text-red-500">*</span>
                                            </label>

                                            {isOtpVerified && (
                                                <span className="inline-flex items-center space-x-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
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
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-[#010a10] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
                                            />

                                            {!isOtpVerified && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    disabled={isSendingOtp || countdown > 0}
                                                    className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-slate-950 text-xs font-black transition-all shadow-sm shadow-cyan-500/20"
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
                                                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl border-2 border-cyan-400 bg-white dark:bg-[#010a10] text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm font-bold focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyOtp}
                                                    disabled={isVerifyingOtp}
                                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition-all"
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
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white/70 dark:bg-[#01121e]/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
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
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white/70 dark:bg-[#01121e]/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
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
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white/70 dark:bg-[#01121e]/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed transition-all"
                                        />
                                    </div>

                                    {/* Security Captcha Challenge */}
                                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#01121e]/80 border border-slate-200 dark:border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Anti-Bot Verification
                                                </div>
                                                <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                                                    {captchaQuestion}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={fetchCaptcha}
                                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
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
                                            className="w-full sm:w-32 px-4 py-2 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-[#010a10] text-slate-900 dark:text-white text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!isOtpVerified}
                                        className="w-full cv-btn-primary justify-center text-sm py-4 shadow-xl disabled:opacity-50"
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
