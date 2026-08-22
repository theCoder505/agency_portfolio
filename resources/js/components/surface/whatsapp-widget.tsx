import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { AppSettings } from '@/types';

interface WhatsAppWidgetProps {
    settings?: AppSettings;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ settings }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const whatsappNumber = settings?.whatsapp_number || '+15552345678';
    const whatsappPrompt = settings?.whatsapp_message_prompt || 'Hello CodeVenture Tech! I would like to discuss building a project.';
    const isEnabled = settings?.whatsapp_enabled !== '0' && settings?.whatsapp_enabled !== false;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 250) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isEnabled) return null;

    // Clean phone number format for WhatsApp url
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappPrompt)}`;

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
            }`}
        >
            {/* Interactive Chat Bubble Popup */}
            {isPopupOpen && (
                <div className="absolute bottom-16 right-0 w-80 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-all animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="relative">
                                <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                                    CV
                                </div>
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900"></span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">CodeVenture Support</h4>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Online • Typically replies instantly</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="py-3.5">
                        <div className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            👋 Hi there! Have an upcoming project or need a quote? Chat directly with our engineering team on WhatsApp!
                        </div>
                    </div>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span>Start WhatsApp Chat</span>
                    </a>
                </div>
            )}

            {/* Main Floating Trigger Button */}
            <div className="relative group">
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>

                <button
                    onClick={() => setIsPopupOpen(!isPopupOpen)}
                    aria-label="WhatsApp Contact"
                    className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                    <svg
                        className="h-7 w-7 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.485-4.484 9.969-9.969 9.969-1.724 0-3.342-.451-4.757-1.242l-5.274 1.383 1.408-5.143c-.886-1.463-1.377-3.178-1.377-4.967 0-5.485 4.485-9.969 9.969-9.969 5.485 0 9.969 4.484 9.969 9.969z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
