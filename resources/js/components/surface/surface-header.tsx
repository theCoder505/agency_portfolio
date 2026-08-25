import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, ArrowUpRight, Sparkles, Code, ShieldCheck } from 'lucide-react';
import { SharedData } from '@/types';
import { ThemeToggle } from './theme-toggle';

export const SurfaceHeader: React.FC = () => {
    const { app_settings, auth } = usePage<SharedData>().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHeroMode, setIsHeroMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { url } = usePage();

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const logoUrl = app_settings?.logo;

    useEffect(() => {
        const handleScroll = () => {
            const whatWeBuildEl = document.getElementById('what-we-build') || document.getElementById('services-section');
            const heroEl = document.getElementById('hero-section');

            if (whatWeBuildEl && heroEl) {
                const rect = whatWeBuildEl.getBoundingClientRect();
                // Check if user has scrolled to or past 'What We Build' section
                const reachedSecondSection = rect.top <= 85;
                setIsScrolled(reachedSecondSection);
                setIsHeroMode(!reachedSecondSection);
            } else {
                const scrolled = window.scrollY > 20;
                setIsScrolled(scrolled);
                setIsHeroMode(false);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [url]);

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Our Works', href: '/works' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return url === '/' || url === '';
        return url.startsWith(href);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'py-3 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm'
                    : isHeroMode
                    ? 'py-5 bg-transparent'
                    : 'py-5 bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Brand Logo & Name */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={brandName}
                                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                                <div className="h-full w-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                                    <Code className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                </div>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav
                        className={`hidden md:flex items-center space-x-1 p-1.5 rounded-full border transition-all duration-300 ${
                            isHeroMode
                                ? 'border-slate-700/60 text-slate-300'
                                : 'dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80'
                        }`}
                    >
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                                        active
                                            ? isHeroMode
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                                                : 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                                            : isHeroMode
                                            ? 'text-slate-300 hover:text-white hover:bg-white/10'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right CTAs & Theme Toggle */}
                    <div className="hidden md:flex items-center space-x-3">
                        <ThemeToggle isHeroMode={isHeroMode} />

                        {auth?.admin ? (
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-all shadow-md"
                            >
                                <ShieldCheck className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                                <span>Admin Panel</span>
                            </Link>
                        ) : (
                            <Link
                                href="/contact"
                                className="relative group inline-flex items-center justify-center p-[2px] rounded-xl overflow-hidden font-bold text-xs"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 group-hover:from-indigo-600 group-hover:to-cyan-500 transition-all"></span>
                                <span className="relative flex items-center space-x-1.5 px-4 py-2 rounded-[10px] bg-slate-950 text-white transition-all group-hover:bg-opacity-90">
                                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                                    <span>Let's Talk</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center space-x-2">
                        <ThemeToggle isHeroMode={isHeroMode} />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`p-2 rounded-xl border backdrop-blur-md transition-all duration-200 ${
                                isHeroMode
                                    ? 'border-slate-700/60 bg-slate-900/60 text-white hover:bg-slate-800/80'
                                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-4">
                    <div className="space-y-1">
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold ${
                                        active
                                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
                        {auth?.admin ? (
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950"
                            >
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span>Go to Admin Panel</span>
                            </Link>
                        ) : (
                            <Link
                                href="/contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-lg"
                            >
                                <span>Get a Free Consultation</span>
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
