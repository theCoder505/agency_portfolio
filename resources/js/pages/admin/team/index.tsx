import React, { useState, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { TeamMember, PaginatedData } from '@/types';
import { Plus, Edit, Trash2, Users, Search, Linkedin, Github, Twitter, X } from 'lucide-react';
import { confirmAction } from '@/lib/swal';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';

interface TeamIndexProps {
    teamMembers: TeamMember[] | PaginatedData<TeamMember>;
}

export default function TeamIndex({ teamMembers }: TeamIndexProps) {
    const allMembersList = useMemo(() => {
        return Array.isArray(teamMembers) ? teamMembers : teamMembers?.data || [];
    }, [teamMembers]);

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
    } = useClientDataTable<TeamMember>({
        items: allMembersList,
        pageSize: 10,
        searchFields: ['name', 'role', 'bio'],
    });

    const handleDelete = async (member: TeamMember) => {
        const confirmed = await confirmAction({
            title: `Remove ${member.name}?`,
            text: 'This will delete the team member profile from the website.',
            confirmButtonText: 'Yes, delete member',
        });

        if (confirmed) {
            router.delete(`/admin/team/${member.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Manage Team Members"
            breadcrumbs={[{ title: 'Team' }]}
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Team Members & Leadership
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage agency founders, lead engineers, designers, and social links.
                        </p>
                    </div>

                    <Link
                        href="/admin/team/create"
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Team Member</span>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search team member name, role..."
                            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Member</th>
                                <th className="p-4">Role / Title</th>
                                <th className="p-4">Bio</th>
                                <th className="p-4">Social Links</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        No team members found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center font-bold text-slate-600">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-semibold text-indigo-600 dark:text-cyan-400">
                                            {member.role}
                                        </td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate">
                                            {member.bio || '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                {member.social_linkedin && <Linkedin className="h-3.5 w-3.5 text-blue-500" />}
                                                {member.social_github && <Github className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />}
                                                {member.social_twitter && <Twitter className="h-3.5 w-3.5 text-cyan-500" />}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {member.is_active ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-bold text-[10px]">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/team/${member.id}/edit`}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Edit Member"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(member)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                    title="Delete Member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <Pagination
                        from={from}
                        to={to}
                        total={totalItems}
                        currentPage={currentPage}
                        lastPage={totalPages}
                        onPageChange={setCurrentPage}
                        itemLabel="team members"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
