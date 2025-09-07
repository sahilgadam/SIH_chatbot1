"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, RefreshCw, Star } from 'lucide-react';

interface Fact {
    id: string;
    text: string;
    tags?: string[];
    source?: string;
}

interface SurpriseMeProps {
    isOpen: boolean;
    onClose: () => void;
}

const SurpriseMe: React.FC<SurpriseMeProps> = ({ isOpen, onClose }) => {
    const [facts, setFacts] = useState<Fact[]>([]);
    const [currentFact, setCurrentFact] = useState<Fact | null>(null);
    const [likedFacts, setLikedFacts] = useState<string[]>([]);
    const [recentlyShown, setRecentlyShown] = useState<string[]>([]);
    const [toast, setToast] = useState({ visible: false, message: '' });
    const [showSaved, setShowSaved] = useState(false);

    const LOCAL_STORAGE_KEY = 'newbie_liked_facts_v1';

    // Load initial data
    useEffect(() => {
        // Analytics Event
        console.log("Analytics: surpriseme_opened");

        // Fetch facts
        fetch('/newbie_facts_v1.json')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setFacts(data);
                } else {
                    handleNoFacts();
                }
            })
            .catch(() => handleNoFacts());

        // Load liked facts from local storage
        try {
            const storedLikes = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedLikes) {
                setLikedFacts(JSON.parse(storedLikes));
            }
        } catch (error) {
            console.error("Could not access local storage:", error);
            setToast({ visible: true, message: 'Could not load saved facts.' });
        }
    }, []);
    
    const handleNoFacts = () => {
        setFacts([{ id: 'fallback', text: 'No facts available right now — check back later.', tags: [], source: 'System' }]);
    }
    
    const showRandomFact = useCallback(() => {
        if (facts.length === 0) return;

        let availableFacts = facts.filter(f => !recentlyShown.includes(f.id));
        if (availableFacts.length === 0) {
            availableFacts = facts;
            setRecentlyShown([]);
        }

        const randomIndex = Math.floor(Math.random() * availableFacts.length);
        const newFact = availableFacts[randomIndex];
        
        setCurrentFact(newFact);
        setRecentlyShown(prev => [...prev.slice(-2), newFact.id]);
        
        // Analytics Event
        console.log(`Analytics: fact_shown, fact_id: "${newFact.id}", source: "${newFact.source || 'unknown'}"`);
    }, [facts, recentlyShown]);


    useEffect(() => {
        if (isOpen && facts.length > 0) {
            showRandomFact();
        }
    }, [isOpen, facts]);


    const handleLike = () => {
        if (!currentFact) return;

        if (likedFacts.includes(currentFact.id)) {
            setToast({ visible: true, message: 'You already saved that one.' });
            setTimeout(() => setToast({ visible: false, message: '' }), 1500);
            return;
        }

        const newLikedFacts = [...likedFacts, currentFact.id];
        setLikedFacts(newLikedFacts);

        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLikedFacts));
            // Analytics Event
            console.log(`Analytics: fact_liked, fact_id: "${currentFact.id}", sync_status: "local_only"`);
        } catch (error) {
            console.error("Could not save to local storage:", error);
            setToast({ visible: true, message: 'Saved for this session only.'});
        }
        
        setToast({ visible: true, message: 'Saved to your facts!' });
        setTimeout(() => setToast({ visible: false, message: '' }), 1500);
        showRandomFact();
    };

    const handleNext = () => {
        showRandomFact();
    };
    
    const handleViewSaved = () => {
        setShowSaved(true);
        // Analytics Event
        console.log("Analytics: saved_facts_viewed");
    }

    const getSavedFacts = () => {
        return facts.filter(fact => likedFacts.includes(fact.id));
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-card/90 border border-primary/20 rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                         {toast.visible && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-full"
                            >
                                {toast.message}
                            </motion.div>
                        )}
                        
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-xl font-bold text-foreground">
                                {showSaved ? 'Your Saved Facts' : 'Random fact'}
                            </h2>
                            <button onClick={onClose} aria-label="Close" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {showSaved ? (
                             <div className="h-64 overflow-y-auto space-y-2">
                                {getSavedFacts().length > 0 ? (
                                    getSavedFacts().map(fact => (
                                        <div key={fact.id} className="p-3 bg-muted/50 rounded-lg text-sm text-foreground">
                                            {fact.text}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center mt-8">No saved facts yet — press Surprise Me to find one!</p>
                                )}
                            </div>
                        ) : (
                             <div className="h-64 flex items-center justify-center">
                                <p className="text-lg text-center text-foreground p-4">
                                    {currentFact?.text}
                                </p>
                            </div>
                        )}
                       

                        <div className="flex justify-between items-center mt-4">
                             <button onClick={handleViewSaved} className="text-sm font-semibold text-primary flex items-center gap-1">
                                <Star size={16}/> Liked: {likedFacts.length}
                            </button>
                             <div className="flex gap-2">
                                <button onClick={handleLike} aria-label="Like fact" className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/30 transition-colors">
                                    <Heart size={20} />
                                </button>
                                <button onClick={handleNext} aria-label="Next fact" className="p-3 bg-blue-500/20 text-blue-500 rounded-full hover:bg-blue-500/30 transition-colors">
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SurpriseMe;