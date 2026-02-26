'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    actions?: React.ReactNode;
    breadcrumb?: string;
}

export default function PageHeader({
    title,
    subtitle,
    icon: Icon,
    iconColor = 'text-primary',
    actions,
    breadcrumb
}: PageHeaderProps) {
    return (
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-8 px-2">
            <div className="space-y-4">
                {breadcrumb && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <span className="text-meta">{breadcrumb}</span>
                        <div className="w-8 h-px bg-white/5" />
                    </motion.div>
                )}

                <div className="flex items-center gap-8">
                    {Icon && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-18 h-18 rounded-2xl bg-slate-950/50 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl group transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute -inset-4 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
                            <Icon className={cn("w-8 h-8 relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3", iconColor)} />
                        </motion.div>
                    )}
                    <div className="space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-5xl font-black bg-gradient-to-l from-white via-white to-white/30 bg-clip-text text-transparent tracking-tighter leading-tight"
                        >
                            {title}
                        </motion.h1>
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 1 }}
                                className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-500/80"
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                </div>
            </div>

            {actions && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4"
                >
                    {actions}
                </motion.div>
            )}
        </header>
    );
}
