// src/app/components/ui/BadgeToast.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, X } from 'lucide-react';

const BadgeToast = ({ badge, onDismiss }) => {
    if (!badge) return null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed bottom-5 right-5 z-50 w-full max-w-sm p-4 bg-card border border-primary/50 rounded-2xl shadow-2xl flex items-center gap-4"
        >
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white">
                <Award size={28} />
            </div>
            <div className="flex-grow">
                <p className="font-bold text-foreground">Badge Unlocked!</p>
                <p className="text-sm text-muted-foreground">{badge.name}: {badge.desc}</p>
            </div>
            <button onClick={onDismiss} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                <X size={18} />
            </button>
        </motion.div>
    );
};

export default BadgeToast;