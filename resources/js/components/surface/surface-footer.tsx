import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Mail, Phone, MapPin, ArrowUpRight, Github, Twitter, Linkedin, Facebook, Instagram, Youtube, Star, ShieldCheck, Heart } from 'lucide-react';
import { SharedData } from '@/types';

export const SurfaceFooter: React.FC = () => {
    const { app_settings } = usePage<SharedData>().props;

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const footerText = app_settings?.footer_text || 'Pioneering digital craftsmanship and modern web applications.';
    const copyrightText = app_settings?.copyright_text || `© ${new Date().getFullYear()} CodeVenture Technology. All rights reserved.`;
    const email = app_settings?.contact_email || 'hello@codeventure.tech';
    const phone = app_settings?.contact_phone || '+1 (555) 234-5678';
    const address = app_settings?.address_line1 || '100 Silicon Vista Way, Suite 400, San Francisco, CA';
    const trustpilotScore = app_settings?.trustpilot_score || '4.9';
    const trustpilotCount = app_settings?.trustpilot_reviews_count || '140+';
    const trustpilotUrl = app_settings?.trustpilot_url || 'https://www.trustpilot.com';

    return (
        <footer className="relative bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800/80 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
                    {/* Col 1 & 2: Brand Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center space-x-2.5">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px]">
                                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-bold text-base">
                                    CV
                                </div>
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">
                                {brandName}
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                            {footerText}
                        </p>

                        {/* Trustpilot Mini Ribbon */}
                        <a
                            href={trustpilotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group"
                        >
                            <div className="flex items-center space-x-1 text-emerald-400">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-xs font-bold text-white">Trustpilot</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-3.5 w-3.5 bg-emerald-500 rounded-sm flex items-center justify-center text-[9px] text-white">
                                        ★
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-slate-300">
                                {trustpilotScore} / 5.0 ({trustpilotCount})
                            </span>
                        </a>
                    </div>

                    {/* Col 3: Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Navigation
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/works" className="hover:text-white transition-colors">Portfolio & Works</Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-white transition-colors">About Us & Team</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-white transition-colors">Get in Touch</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Legal & Policies */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Legal & Trust
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <a href={trustpilotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 hover:text-white transition-colors">
                                    <span>Client Reviews</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Col 5: Contact Direct */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Contact Direct
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start space-x-2.5">
                                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                                <span className="text-xs leading-relaxed">{address}</span>
                            </li>
                            <li className="flex items-center space-x-2.5">
                                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                                <a href={`mailto:${email}`} className="text-xs hover:text-white transition-colors">
                                    {email}
                                </a>
                            </li>
                            <li className="flex items-center space-x-2.5">
                                <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                                <a href={`tel:${phone}`} className="text-xs hover:text-white transition-colors">
                                    {phone}
                                </a>
                            </li>
                        </ul>

                        {/* Social Links */}
                        <div className="flex items-center space-x-2 mt-5">
                            {app_settings?.social_github && (
                                <a href={app_settings.social_github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                    <Github className="h-4 w-4" />
                                </a>
                            )}
                            {app_settings?.social_linkedin && (
                                <a href={app_settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            )}
                            {app_settings?.social_twitter && (
                                <a href={app_settings.social_twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                            {app_settings?.social_youtube && (
                                <a href={app_settings.social_youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                    <Youtube className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
                    <p>{copyrightText}</p>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <span className="flex items-center space-x-1">
                            <span>Crafted with</span>
                            <Heart className="h-3 w-3 text-red-500 fill-current" />
                            <span>by CodeVenture</span>
                        </span>
                        <Link href="/admin/login" className="text-slate-600 hover:text-slate-400 transition-colors">
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
