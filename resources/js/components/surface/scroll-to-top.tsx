import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
    const { url } = usePage();
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            if (windowHeight > 0) {
                setScrollProgress((totalScroll / windowHeight) * 100);
            }

            const whatWeBuildEl = document.getElementById('what-we-build') || document.getElementById('services-section');
            const heroEl = document.getElementById('hero-section');

            if (whatWeBuildEl && heroEl) {
                const rect = whatWeBuildEl.getBoundingClientRect();
                // Show scroll to top button when scrolling to 'What We Build' section
                setIsVisible(rect.top <= window.innerHeight * 0.75);
            } else {
                setIsVisible(totalScroll > 300);
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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed bottom-6 left-6 z-40 flex items-center justify-center h-11 w-11 rounded-full bg-slate-900/80 dark:bg-slate-800/80 text-white backdrop-blur-md border border-slate-700 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
            }`}
        >
            <ArrowUp className="h-5 w-5 text-indigo-400" />
            <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                <path
                    className="text-indigo-500 stroke-current"
                    strokeWidth="2"
                    strokeDasharray={`${scrollProgress}, 100`}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
        </button>
    );
};
