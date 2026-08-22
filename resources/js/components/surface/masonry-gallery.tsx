import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface MasonryGalleryProps {
    images: string[];
    projectTitle?: string;
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({ images, projectTitle = 'Project Showcase' }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = 'auto';
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1));
        }
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % images.length);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-indigo-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Project Screenshot Gallery (Masonry View)
                </h3>
            </div>

            {/* Masonry Columns Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {images.map((imgUrl, index) => (
                    <div
                        key={index}
                        onClick={() => openLightbox(index)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md transition-all hover:shadow-2xl hover:border-indigo-500 break-inside-avoid"
                    >
                        <img
                            src={imgUrl}
                            alt={`${projectTitle} screenshot ${index + 1}`}
                            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
                                <Maximize2 className="h-4 w-4" />
                                <span>Click to View Full Size</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fullscreen Lightbox Modal */}
            {selectedImageIndex !== null && (
                <div
                    onClick={closeLightbox}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200"
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Close image modal"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Nav Prev */}
                    {images.length > 1 && (
                        <button
                            onClick={prevImage}
                            className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    {/* Main Image */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl"
                    >
                        <img
                            src={images[selectedImageIndex]}
                            alt={`${projectTitle} full view`}
                            className="max-h-[85vh] w-auto object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-center text-xs text-slate-300 font-medium">
                            {projectTitle} • Image {selectedImageIndex + 1} of {images.length}
                        </div>
                    </div>

                    {/* Nav Next */}
                    {images.length > 1 && (
                        <button
                            onClick={nextImage}
                            className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
