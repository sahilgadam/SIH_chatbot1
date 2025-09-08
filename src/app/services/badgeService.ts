// src/app/services/badgeService.ts

interface Badge {
    id: string;
    name: string;
    desc: string;
    criteria: {
        action: string;
        count: number;
    };
}

interface BadgeProgress {
    [key: string]: number;
}

const BADGE_PROGRESS_KEY = 'badge_progress_v1';
const USER_BADGES_KEY = 'user_badges_v1';

let allBadges: Badge[] = [];

// Fetch badges once and cache them
const getBadges = async (): Promise<Badge[]> => {
    if (allBadges.length === 0) {
        try {
            const response = await fetch('/badges_v1.json');
            allBadges = await response.json();
        } catch (error) {
            console.error("Failed to load badges:", error);
            return [];
        }
    }
    return allBadges;
};

export const trackAction = async (action: string) => {
    console.log(`Analytics: action_tracked, name: "${action}"`);

    // 1. Load data
    const badges = await getBadges();
    const progress: BadgeProgress = JSON.parse(localStorage.getItem(BADGE_PROGRESS_KEY) || '{}');
    const unlockedBadges: { id: string, unlockedAt: string }[] = JSON.parse(localStorage.getItem(USER_BADGES_KEY) || '[]');
    const unlockedIds = new Set(unlockedBadges.map(b => b.id));

    // 2. Update progress
    progress[action] = (progress[action] || 0) + 1;

    // 3. Check for new badges
    const newlyUnlocked: Badge[] = [];
    for (const badge of badges) {
        if (!unlockedIds.has(badge.id) && badge.criteria.action === action) {
            if ((progress[action] || 0) >= badge.criteria.count) {
                unlockedBadges.push({ id: badge.id, unlockedAt: new Date().toISOString() });
                newlyUnlocked.push(badge);
                unlockedIds.add(badge.id); // Add to set to prevent duplicate unlocks in the same run
            }
        }
    }

    // 4. Save and dispatch events if new badges were unlocked
    if (newlyUnlocked.length > 0) {
        localStorage.setItem(USER_BADGES_KEY, JSON.stringify(unlockedBadges));
        
        // Dispatch a custom event for each unlocked badge
        newlyUnlocked.forEach(badge => {
            const event = new CustomEvent('badgeUnlocked', { detail: badge });
            window.dispatchEvent(event);
        });
    }

    // Always save the latest progress
    localStorage.setItem(BADGE_PROGRESS_KEY, JSON.stringify(progress));
};