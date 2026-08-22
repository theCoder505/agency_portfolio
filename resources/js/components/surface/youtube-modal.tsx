import React from 'react';
import { X, Play } from 'lucide-react';

interface YouTubeModalProps {
    videoUrl?: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ videoUrl, isOpen, onClose }) => {
    if (!isOpen || !videoUrl) return null;

    // Helper to extract YouTube video ID
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYouTubeId(videoUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;

    if (!embedUrl) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl"
            >
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
                    <div className="flex items-center space-x-2 text-white text-xs font-bold">
                        <Play className="h-4 w-4 text-red-500 fill-current" />
                        <span>Agency Project Case Study & Video Demo</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* 16:9 Video Player */}
                <div className="relative aspect-[16/9] w-full">
                    <iframe
                        src={embedUrl}
                        title="YouTube video player"
                        className="absolute inset-0 h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};
