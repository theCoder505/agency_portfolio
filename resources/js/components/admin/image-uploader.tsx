import React, { useState, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploaderProps {
    label?: string;
    multiple?: boolean;
    existingImages?: string | string[] | null;
    onChange: (files: File | File[] | null, existingToKeep?: string[]) => void;
    maxFiles?: number;
    helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    label = 'Upload Image',
    multiple = false,
    existingImages,
    onChange,
    maxFiles = 10,
    helperText = 'PNG, JPG, WebP up to 10MB',
}) => {
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

    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {label}
            </label>

            {/* Dropzone Upload Trigger Area */}
            <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl bg-slate-50 dark:bg-slate-900/50 transition-colors cursor-pointer group">
                <input
                    type="file"
                    accept="image/*"
                    multiple={multiple}
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
                        {helperText} {multiple ? `(Max ${maxFiles} images)` : ''}
                    </p>
                </div>
            </div>

            {/* LIVE PREVIEW GRID (Before and Existing Uploads) */}
            {(existingList.length > 0 || previews.length > 0) && (
                <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-slate-500">
                        Live Preview ({existingList.length + previews.length} {multiple ? 'images' : 'image'}):
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {/* Existing Server Images */}
                        {existingList.map((url, i) => (
                            <div key={`existing-${i}`} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group">
                                <img src={url} alt="Existing asset" className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-medium">
                                    Saved
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeExisting(i)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-all opacity-90 group-hover:opacity-100"
                                    title="Remove image"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        {/* Newly Chosen Local Previews */}
                        {previews.map((previewUrl, i) => (
                            <div key={`new-${i}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500 bg-slate-950 group animate-in fade-in zoom-in-95">
                                <img src={previewUrl} alt="New upload preview" className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-indigo-600 text-[9px] text-white font-bold">
                                    New
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(i)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-all"
                                    title="Remove preview before upload"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
