'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[20px]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                        className={cn(
                            "relative w-full bg-[#0a0f1e]/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[95vh]",
                            maxWidth
                        )}
                    >
                        {/* Header Layer */}
                        <div className="relative px-8 py-6 flex items-center justify-between border-b border-white/10 bg-white/[0.02] overflow-hidden">
                            {/* Atmospheric Shine */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-1.5 h-6 bg-primary rounded-full group-hover:scale-y-125 transition-transform" />
                                <h2 className="text-2xl font-black text-white tracking-tighter leading-none">
                                    {title}
                                </h2>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white border border-white/10 active:scale-90 group relative z-10"
                            >
                                <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
                            </button>
                        </div>

                        {/* Content Layer */}
                        <div className="p-6 md:p-7 overflow-y-auto custom-scrollbar relative z-10">
                            {children}
                        </div>

                        {/* Footer Atmospheric Decoration */}
                        <div className="absolute bottom-0 left-0 w-full h-[60px] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
