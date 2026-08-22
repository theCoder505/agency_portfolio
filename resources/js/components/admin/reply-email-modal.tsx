import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Contact } from '@/types';
import { X, Send, Mail, User, Clock, MessageSquare } from 'lucide-react';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

interface ReplyEmailModalProps {
    contact: Contact | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ReplyEmailModal: React.FC<ReplyEmailModalProps> = ({ contact, isOpen, onClose }) => {
    if (!isOpen || !contact) return null;

    const [replySubject, setReplySubject] = useState(`Re: ${contact.subject} - CodeVenture Tech`);
    const [replyMessage, setReplyMessage] = useState(
        `Hi ${contact.name},\n\nThank you for reaching out to CodeVenture Tech regarding "${contact.subject}".\n\nWe have reviewed your project requirements and would love to schedule an introductory call to discuss architecture and estimates.\n\nBest regards,\nCodeVenture Tech Engineering Team`
    );
    const [isSending, setIsSending] = useState(false);

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        router.post(
            `/admin/contacts/${contact.id}/reply`,
            {
                reply_subject: replySubject,
                reply_message: replyMessage,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSending(false);
                    onClose();
                },
                onError: () => {
                    setIsSending(false);
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Reply to {contact.name}
                            </h3>
                            <p className="text-xs text-slate-500">{contact.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form & Original Message */}
                <form onSubmit={handleSendReply} className="p-6 space-y-5 overflow-y-auto flex-grow">
                    {/* Original Message Preview */}
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Original Inquiry ({contact.subject})</span>
                            <span>{new Date(contact.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                            {contact.message}
                        </p>
                    </div>

                    {/* Reply Subject */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Email Subject
                        </label>
                        <input
                            type="text"
                            required
                            value={replySubject}
                            onChange={(e) => setReplySubject(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Reply Body */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Reply Message Body
                        </label>
                        <textarea
                            required
                            rows={8}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                        >
                            <Send className="h-4 w-4" />
                            <span>{isSending ? 'Sending Email...' : 'Send Reply Email'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
