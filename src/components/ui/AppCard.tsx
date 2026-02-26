'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AppCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function AppCard({
    children,
    className,
    hover = true,
    padding = 'md'
}: AppCardProps) {
    const paddingClass = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6', // Reduced from 8 for better information density
        lg: 'p-8'  // Reduced from 10
    }[padding];

    return (
        <motion.div
            whileHover={hover ? {
                y: -8,
                scale: 1.01,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            } : undefined}
            className={cn(
                "bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] transition-all duration-700 relative overflow-hidden group/card shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
                hover && "hover:border-primary/40 hover:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.9)] hover:translate-y-[-8px] hover:scale-[1.01] hover-glow",
                className
            )}
        >
            {/* Multi-layered Ambient Glows */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-primary/[0.02] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

            {/* Dynamic Accent Glow */}
            <div className="absolute -inset-32 bg-primary/10 blur-[130px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
}
