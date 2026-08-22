import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { TeamMember } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import { ArrowLeft, Save, Users } from 'lucide-react';

interface TeamFormProps {
    member: TeamMember | null;
}

export default function TeamForm({ member }: TeamFormProps) {
    const isEdit = Boolean(member);

    const [name, setName] = useState(member?.name || '');
    const [role, setRole] = useState(member?.role || '');
    const [bio, setBio] = useState(member?.bio || '');
    const [socialLinkedin, setSocialLinkedin] = useState(member?.social_linkedin || '');
    const [socialGithub, setSocialGithub] = useState(member?.social_github || '');
    const [socialTwitter, setSocialTwitter] = useState(member?.social_twitter || '');
    const [order, setOrder] = useState(member?.order || 0);
    const [isActive, setIsActive] = useState(member ? member.is_active : true);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [existingAvatar, setExistingAvatar] = useState<string | null>(member?.avatar || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('role', role);
        formData.append('bio', bio);
        formData.append('social_linkedin', socialLinkedin);
        formData.append('social_github', socialGithub);
        formData.append('social_twitter', socialTwitter);
        formData.append('order', String(order));
        formData.append('is_active', isActive ? '1' : '0');

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        if (isEdit && member) {
            formData.append('_method', 'PUT');
            router.post(`/admin/team/${member.id}`, formData, {
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/team', formData, {
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit "${member?.name}"` : 'Add Team Member'}
            breadcrumbs={[
                { title: 'Team', href: '/admin/team' },
                { title: isEdit ? 'Edit' : 'Create' },
            ]}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/team"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Team List</span>
                    </Link>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Team Member' : 'New Team Member'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Sarah Chen"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Role / Designation *</label>
                                <input
                                    type="text"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Head of Engineering"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Short Bio</label>
                            <textarea
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="10+ years experience in systems architecture..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Avatar Image Uploader with Live Preview */}
                        <ImageUploader
                            label="Member Avatar Photo (Live Preview)"
                            multiple={false}
                            existingImages={existingAvatar}
                            onChange={(file) => setAvatarFile(file instanceof File ? file : null)}
                        />

                        {/* Social Links */}
                        <div className="space-y-3 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={socialLinkedin}
                                    onChange={(e) => setSocialLinkedin(e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">GitHub URL</label>
                                <input
                                    type="url"
                                    value={socialGithub}
                                    onChange={(e) => setSocialGithub(e.target.value)}
                                    placeholder="https://github.com/..."
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Twitter / X URL</label>
                                <input
                                    type="url"
                                    value={socialTwitter}
                                    onChange={(e) => setSocialTwitter(e.target.value)}
                                    placeholder="https://x.com/..."
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600"
                                />
                                <span>Show on Website</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Link
                            href="/admin/team"
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Member'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
