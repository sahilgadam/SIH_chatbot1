// src/app/components/tabs/newbie/Badges.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Award, Lock, MessageSquare, Zap, Heart, Brain, Anchor, Moon, BookOpen } from 'lucide-react';

// Map badge IDs to Lucide React icons
const badgeIcons = {
    first_chat: MessageSquare,
    quick_starter: Zap,
    fact_collector_3: Heart,
    curious_mind_5: Brain,
    ocean_explorer: Anchor,
    secret_aurora: Moon
};

const Badges = ({ onTakeQuiz }) => {
    const [badges, setBadges] = useState([]);
    const [unlockedBadgeIds, setUnlockedBadgeIds] = useState([]);

    const fetchBadges = () => {
        fetch('/badges_v1.json')
            .then(response => response.json())
            .then(data => setBadges(data))
            .catch(error => console.error("Failed to load badges.", error));

        const userBadges = JSON.parse(localStorage.getItem('user_badges_v1') || '[]');
        setUnlockedBadgeIds(userBadges.map(b => b.id));
    };

    useEffect(() => {
        fetchBadges();
        window.addEventListener('badgeUnlocked', fetchBadges);
        return () => {
            window.removeEventListener('badgeUnlocked', fetchBadges);
        };
    }, []);

    const getBadgeIcon = (badgeId, isUnlocked) => {
        const IconComponent = badgeIcons[badgeId] || Award;
        
        if (isUnlocked) {
            return <IconComponent size={36} />;
        }

        // For locked badges, show the icon faded with a lock on top
        return (
            <div className="relative">
                <IconComponent size={36} className="opacity-30" />
                <Lock size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
        );
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Quiz & Kudos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {badges.map(badge => {
                    const isUnlocked = unlockedBadgeIds.includes(badge.id);
                    return (
                        <div
                            key={badge.id}
                            className={`p-6 rounded-xl text-center shadow-lg transition-all duration-300
                                ${isUnlocked ? 'bg-gradient-to-br from-blue-600/20 to-indigo-800/20 border border-primary/50 earned-badge-border' : 'bg-muted/30 border border-muted-foreground/20'}
                                flex flex-col items-center justify-center`}
                        >
                            <div className={`text-5xl mb-3 ${isUnlocked ? 'text-primary' : 'text-muted-foreground/60'}`}>
                                {getBadgeIcon(badge.id, isUnlocked)}
                            </div>
                            <h3 className={`font-bold text-lg ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{isUnlocked ? badge.desc : 'Locked'}</p>
                            {!isUnlocked && badge.criteria && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                    Hint: {`Complete: ${badge.criteria.action} ${badge.criteria.count} time(s)`}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
             <div className="mt-8">
                <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Quick Quiz</h3>
                            <p className="text-sm text-muted-foreground">Test your ocean smarts</p>
                        </div>
                        <button onClick={onTakeQuiz} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-all">Take Quiz ►</button>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs text-muted-foreground">Quiz badges: 0/3 unlocked</p>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Badges;