/**
 * High Performance AOS (Animate On Scroll) Engine for Inertia & React
 * Uses IntersectionObserver to trigger hardware-accelerated animations
 * Supports data-aos, data-aos-delay, data-aos-duration, data-aos-offset, data-aos-once
 */

interface AOSOptions {
    offset?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
}

class AOSManager {
    private observer: IntersectionObserver | null = null;
    private options: AOSOptions = {
        offset: 50,
        delay: 0,
        duration: 700,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        once: true,
    };
    private initialized = false;

    public init(customOptions?: AOSOptions) {
        if (typeof window === 'undefined') return;

        this.options = { ...this.options, ...customOptions };

        if (!this.observer) {
            this.createObserver();
        }

        this.refresh();
        this.initialized = true;
    }

    private createObserver() {
        const rootMargin = `0px 0px -${this.options.offset || 50}px 0px`;

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const el = entry.target as HTMLElement;
                    const isOnce = el.getAttribute('data-aos-once') !== 'false' && (this.options.once ?? true);

                    if (entry.isIntersecting) {
                        el.classList.add('aos-animate');
                        if (isOnce && this.observer) {
                            this.observer.unobserve(el);
                        }
                    } else if (!isOnce) {
                        el.classList.remove('aos-animate');
                    }
                });
            },
            {
                root: null,
                rootMargin,
                threshold: 0.1,
            }
        );
    }

    public refresh() {
        if (typeof window === 'undefined') return;

        // Request animation frame for smooth layout recalculation
        requestAnimationFrame(() => {
            const elements = document.querySelectorAll<HTMLElement>('[data-aos]');

            elements.forEach((el) => {
                // Apply custom inline delay/duration if specified
                const delay = el.getAttribute('data-aos-delay');
                const duration = el.getAttribute('data-aos-duration');
                const easing = el.getAttribute('data-aos-easing');

                if (delay) {
                    el.style.transitionDelay = `${delay}ms`;
                }
                if (duration) {
                    el.style.transitionDuration = `${duration}ms`;
                }
                if (easing) {
                    el.style.transitionTimingFunction = easing;
                }

                // Check if already in viewport on initial load
                const rect = el.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;

                if (rect.top < windowHeight - (this.options.offset || 50) && rect.bottom > 0) {
                    el.classList.add('aos-animate');
                } else if (this.observer) {
                    this.observer.observe(el);
                }
            });
        });
    }

    public refreshHard() {
        if (typeof window === 'undefined') return;
        const elements = document.querySelectorAll<HTMLElement>('[data-aos]');
        elements.forEach((el) => {
            el.classList.remove('aos-animate');
        });
        this.refresh();
    }
}

export const AOS = new AOSManager();
export const initAOS = (options?: AOSOptions) => AOS.init(options);
export const refreshAOS = () => AOS.refresh();
