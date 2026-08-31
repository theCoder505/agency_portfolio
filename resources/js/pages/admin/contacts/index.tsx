import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Contact, PaginatedData } from '@/types';
import { ReplyEmailModal } from '@/components/admin/reply-email-modal';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import {
    Search,
    Trash2,
    Send,
    CheckCheck,
    X
} from 'lucide-react';
import { confirmAction } from '@/lib/swal';

interface ContactIndexProps {
    contacts: Contact[] | PaginatedData<Contact>;
}

export default function ContactIndex({ contacts }: ContactIndexProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [status, setStatus] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [replyingContact, setReplyingContact] = useState<Contact | null>(null);

    const allContactsList = useMemo(() => {
        return Array.isArray(contacts) ? contacts : contacts?.data || [];
    }, [contacts]);

    // Multi-criteria filter
    const filteredByFilters = useMemo(() => {
        return allContactsList.filter((c) => {
            if (status === 'unread' && c.is_read) return false;
            if (status === 'read' && (!c.is_read || c.replied_at)) return false;
            if (status === 'replied' && !c.replied_at) return false;

            if (fromDate && toDate && c.created_at) {
                const cDate = new Date(c.created_at).getTime();
                const start = new Date(fromDate + ' 00:00:00').getTime();
                const end = new Date(toDate + ' 23:59:59').getTime();
                if (cDate < start || cDate > end) return false;
            }
            return true;
        });
    }, [allContactsList, status, fromDate, toDate]);

    // Instant Frontend Search & Pagination
    const {
        search,
        setSearch,
        clearSearch,
        handleImmediateSearch,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        from,
        to,
        paginatedItems,
    } = useClientDataTable<Contact>({
        items: filteredByFilters,
        pageSize: 12,
        searchFields: ['name', 'email', 'phone', 'subject', 'message', 'service_interested'],
    });

    const handleStatusChange = (st: string) => {
        setStatus(st);
        setCurrentPage(1);
    };

    const handleDateApply = (fromVal: string, toVal: string) => {
        setFromDate(fromVal);
        setToDate(toVal);
        setCurrentPage(1);
    };

    const handleDateClear = () => {
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedItems.length && paginatedItems.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedItems.map((c) => c.id));
        }
    };

    const markAsRead = (contact: Contact) => {
        router.patch(`/admin/contacts/${contact.id}/read`, {}, { preserveScroll: true });
    };

    const handleDelete = async (contact: Contact) => {
        const confirmed = await confirmAction({
            title: `Delete inquiry from ${contact.name}?`,
            text: 'This action will delete the contact message record.',
            confirmButtonText: 'Yes, delete',
        });

        if (confirmed) {
            router.delete(`/admin/contacts/${contact.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((id) => id !== contact.id));
                },
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = await confirmAction({
            title: `Delete ${selectedIds.length} Selected Inquiries?`,
            text: 'Are you sure you want to delete these contact inquiries?',
            confirmButtonText: `Delete ${selectedIds.length} Messages`,
        });

        if (confirmed) {
            router.post(
                '/admin/contacts/bulk-delete',
                { ids: selectedIds },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                    },
                }
            );
        }
    };

    return (
        <AdminLayout
            title="Contact Inquiries"
            breadcrumbs={[{ title: 'Contacts' }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Client Inquiries & Direct Responses
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Review visitor inquiries and reply directly with formatted emails from the portal.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-72">
                            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, subject..."
                                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={status ?? 'all'}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold"
                            >
                                <option value="all">All Inquiries</option>
                                <option value="unread">Unread Only</option>
                                <option value="read">Read Only</option>
                                <option value="replied">Replied Only</option>
                            </select>

                            <DateRangeFilter
                                fromDate={fromDate ?? ''}
                                toDate={toDate ?? ''}
                                onApply={handleDateApply}
                                onClear={handleDateClear}
                            />
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs animate-in fade-in">
                            <span className="font-bold text-indigo-900 dark:text-indigo-200">
                                {selectedIds.length} message(s) selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Bulk Delete</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Inquiries Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === paginatedItems.length && paginatedItems.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="p-4">Sender & Contact</th>
                                    <th className="p-4">Subject & Message</th>
                                    <th className="p-4">Service</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">
                                            No contact inquiries found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((contact) => {
                                        const isSelected = selectedIds.includes(contact.id);

                                        return (
                                            <tr
                                                key={contact.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                                                    isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''
                                                } ${!contact.is_read ? 'font-semibold bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(contact.id)}
                                                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </td>

                                                {/* Sender */}
                                                <td className="p-4">
                                                    <div className="space-y-0.5">
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                            {contact.name}
                                                        </div>
                                                        <div className="text-slate-500 font-mono text-[11px]">
                                                            {contact.email}
                                                        </div>
                                                        {contact.phone && (
                                                            <div className="text-slate-400 text-[10px]">
                                                                {contact.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Subject & Message Preview */}
                                                <td className="p-4 max-w-sm">
                                                    <div className="space-y-1">
                                                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                                            {contact.subject}
                                                        </div>
                                                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                                            {contact.message}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Service */}
                                                <td className="p-4">
                                                    <div className="px-2 py-1 text-center rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                                                        {contact.service_interested || 'General Inquiry'}
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="p-4 text-slate-500 whitespace-nowrap">
                                                    {new Date(contact.created_at).toLocaleDateString()}
                                                </td>

                                                {/* Status */}
                                                <td className="p-4">
                                                    {contact.replied_at ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center space-x-1 w-max">
                                                            <CheckCheck className="h-3 w-3" />
                                                            <span>Replied</span>
                                                        </span>
                                                    ) : !contact.is_read ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold text-[10px] w-max">
                                                            Unread
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] w-max">
                                                            Read
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {!contact.is_read && (
                                                            <button
                                                                onClick={() => markAsRead(contact)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                title="Mark as Read"
                                                            >
                                                                <CheckCheck className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => setReplyingContact(contact)}
                                                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                                                        >
                                                            <Send className="h-3 w-3" />
                                                            <span>Reply</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(contact)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                            title="Delete message"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        from={from}
                        to={to}
                        total={totalItems}
                        currentPage={currentPage}
                        lastPage={totalPages}
                        onPageChange={setCurrentPage}
                        itemLabel="inquiries"
                    />
                </div>
            </div>

            {/* Email Reply Modal */}
            <ReplyEmailModal
                contact={replyingContact}
                isOpen={Boolean(replyingContact)}
                onClose={() => setReplyingContact(null)}
            />
        </AdminLayout>
    );
}
