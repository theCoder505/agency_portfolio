import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
    label?: string;
    multiple?: boolean;
    existingImages?: string | string[] | null;
    onChange: (files: File | File[] | null, existingToKeep?: string[]) => void;
    maxFiles?: number;
    helperText?: string;
    heightClass?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    label = 'Upload Image',
    multiple = false,
    existingImages,
    onChange,
    maxFiles = 10,
    helperText = 'PNG, JPG, SVG, WebP up to 10MB',
    heightClass = 'h-48 sm:h-56',
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Array of existing URL strings (for multi mode) or single string
    const [existingList, setExistingList] = useState<string[]>([]);
    // Newly selected File objects
    const [newFiles, setNewFiles] = useState<File[]>([]);
    // Object URL preview strings for newly selected files
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        if (!existingImages) {
            setExistingList([]);
        } else if (Array.isArray(existingImages)) {
            setExistingList(existingImages.filter(Boolean));
        } else if (typeof existingImages === 'string' && existingImages) {
            setExistingList([existingImages]);
        }
    }, [existingImages]);

    // Handle File Selection with Instant Live Preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const incoming = Array.from(e.target.files);

        if (!multiple) {
            const singleFile = incoming[0];
            setNewFiles([singleFile]);
            setPreviews([URL.createObjectURL(singleFile)]);
            onChange(singleFile, []);
        } else {
            const combined = [...newFiles, ...incoming].slice(0, maxFiles);
            setNewFiles(combined);
            const combinedPreviews = combined.map((f) => URL.createObjectURL(f));
            setPreviews(combinedPreviews);
            onChange(combined, existingList);
        }
    };

    // Remove a newly selected file preview before upload
    const removeNewFile = (index: number) => {
        const updatedFiles = newFiles.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setNewFiles(updatedFiles);
        setPreviews(updatedPreviews);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (!multiple) {
            onChange(null, existingList);
        } else {
            onChange(updatedFiles, existingList);
        }
    };

    // Remove an existing image already saved on server
    const removeExisting = (index: number) => {
        const updated = existingList.filter((_, i) => i !== index);
        setExistingList(updated);
        onChange(multiple ? newFiles : null, updated);
    };

    // SINGLE IMAGE MODE
    if (!multiple) {
        const currentPreviewUrl = previews[0] || existingList[0] || null;
        const isNewSelection = Boolean(previews[0]);

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                )}

                {currentPreviewUrl ? (
                    /* Filled Full-Size Image Element */
                    <div
                        className={`relative w-full ${heightClass} rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-transparent-pattern overflow-hidden flex items-center justify-center group cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-xs`}
                    >
                        {/* Hidden file input across entire element */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple={false}
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {/* Full Size Image Taking Up the Container */}
                        <img
                            src={currentPreviewUrl}
                            alt="Asset Preview"
                            className="max-h-full max-w-full w-auto h-auto object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Badge Indicator */}
                        <div className="absolute top-3 left-3 z-20 pointer-events-none">
                            {isNewSelection ? (
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shadow-md flex items-center space-x-1">
                                    <span>New Selection</span>
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-200 text-[10px] font-bold shadow-md border border-white/10">
                                    Current Asset
                                </span>
                            )}
                        </div>

                        {/* Remove Button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isNewSelection) removeNewFile(0);
                                else removeExisting(0);
                            }}
                            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white shadow-lg transition-all opacity-90 group-hover:opacity-100 hover:scale-110"
                            title="Remove image"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Hover Overlay with Replace prompt */}
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                            <div className="p-3 rounded-full bg-white/20 mb-2 group-hover:scale-110 transition-transform">
                                <RefreshCw className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs font-bold text-white">Click or Drop to Replace</span>
                            <span className="text-[10px] text-slate-300 mt-0.5">{helperText}</span>
                        </div>
                    </div>
                ) : (
                    /* Empty Full-Size Dropzone Element */
                    <div
                        className={`relative w-full ${heightClass} rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple={false}
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-3">
                            <UploadCloud className="h-7 w-7" />
                        </div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            <span className="text-indigo-600 dark:text-cyan-400">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{helperText}</p>
                    </div>
                )}
            </div>
        );
    }

    // MULTIPLE IMAGES MODE
    return (
        <div className="space-y-3">
            {label && (
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}

            {/* Dropzone Area */}
            <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl bg-slate-50 dark:bg-slate-900/50 transition-colors cursor-pointer group">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={true}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="flex flex-col items-center text-center space-y-2 pointer-events-none">
                    <div className="p-3 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-6 w-6" />
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-indigo-600 dark:text-cyan-400">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-[11px] text-slate-400">
                        {helperText} {`(Max ${maxFiles} images)`}
                    </p>
                </div>
            </div>

            {/* Multiple Previews Grid */}
            {(existingList.length > 0 || previews.length > 0) && (
                <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-slate-500">
                        Live Preview ({existingList.length + previews.length} images):
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {/* Existing Saved Images */}
                        {existingList.map((url, i) => (
                            <div key={`existing-${i}`} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group">
                                <img src={url} alt="Saved asset" className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-medium">
                                    Saved
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeExisting(i)}
                                    className="absolute top-1 right-1 p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md transition-all opacity-90 group-hover:opacity-100"
                                    title="Remove image"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}

                        {/* Newly Added File Previews */}
                        {previews.map((previewUrl, i) => (
                            <div key={`new-${i}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500 bg-slate-950 group animate-in fade-in zoom-in-95">
                                <img src={previewUrl} alt="New upload preview" className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-indigo-600 text-[9px] text-white font-bold">
                                    New
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(i)}
                                    className="absolute top-1 right-1 p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md transition-all"
                                    title="Remove preview before upload"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

