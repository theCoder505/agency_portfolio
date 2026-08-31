import React from 'react';
import { AlertTriangle, Info, X, CheckCircle2, RefreshCw } from 'lucide-react';

export interface RejectionModalInfo {
    title?: string;
    reason?: string;
    invoiceNumber?: string;
    orderNumber?: string;
    transactionId?: string | null;
    paymentMethod?: string;
    senderNumber?: string | null;
    amount?: string;
    date?: string;
}

interface RejectionDetailsModalProps {
    isOpen: boolean;
    data: RejectionModalInfo | null;
    onClose: () => void;
    onRetry?: () => void;
    retryLabel?: string;
}

export function RejectionDetailsModal({
    isOpen,
    data,
    onClose,
    onRetry,
    retryLabel = 'Submit New Payment'
}: RejectionDetailsModalProps) {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="h-11 w-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold border border-rose-500/20 shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                {data.title || 'Payment Verification Status'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Rejection feedback &amp; transaction audit details
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Payment Context Details */}
                {(data.amount || data.date || data.transactionId || data.paymentMethod || data.orderNumber || data.invoiceNumber) && (
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs">
                        {data.orderNumber && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order #</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.orderNumber}</span>
                            </div>
                        )}
                        {data.invoiceNumber && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice #</span>
                                <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">{data.invoiceNumber}</span>
                            </div>
                        )}
                        {data.amount && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{data.amount}</span>
                            </div>
                        )}
                        {data.date && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{data.date}</span>
                            </div>
                        )}
                        {data.transactionId && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TrxID</span>
                                <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">{data.transactionId}</span>
                            </div>
                        )}
                        {data.paymentMethod && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Method / Sender</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                    {data.paymentMethod} {data.senderNumber ? `• ${data.senderNumber}` : ''}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Admin Rejection Reason Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/[0.08] dark:bg-rose-950/40 border-2 border-rose-500/30 dark:border-rose-900/60 space-y-2">
                    <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                        <Info className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">Admin Rejection Reason:</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 whitespace-pre-wrap leading-relaxed shadow-2xs">
                        {data.reason || 'Payment verification could not be completed or invalid transaction details were provided.'}
                    </div>
                </div>

                {/* Resolution Advice */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-cyan-200 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-indigo-700 dark:text-cyan-300">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>How to resolve this:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal pl-5">
                        Please verify the SMS notification received from your mobile wallet provider (bKash/Nagad). Ensure the exact Transaction ID (TrxID) and sender number match, then submit a new payment.
                    </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                    >
                        Close
                    </button>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onRetry();
                            }}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>{retryLabel}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
