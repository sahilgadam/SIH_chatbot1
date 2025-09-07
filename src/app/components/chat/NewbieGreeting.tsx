"use client";

import React, { useState, useEffect } from 'react';

export default function NewbieGreeting() {
    const poeticLines = [
        "Quick, no-fluff help for curious humans.",
        "Got a question about the ocean? Just ask.",
        "Let's find some cool ocean facts! 🌊"
    ];
    // Updated emoji list with more recognizable sea creatures
    const emojis = ["🌊", "🐟", "🐢", "🐙", "🐠"]; 
    const eraseSpeed = 30;
    const typeSpeed = 50;
    const pauseTime = 1500;
    const emojiChangeInterval = 2000; // Time in ms to change emoji

    const [typedMessage, setTypedMessage] = useState("");
    const [erasing, setErasing] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);
    const [currentEmoji, setCurrentEmoji] = useState(emojis[0]);
    const [emojiIndex, setEmojiIndex] = useState(0);

    // Typing and erasing effect
    useEffect(() => {
        let timer;
        const currentLine = poeticLines[messageIndex];

        if (!erasing) {
            if (typedMessage.length < currentLine.length) {
                timer = setTimeout(() => {
                    setTypedMessage(currentLine.slice(0, typedMessage.length + 1));
                }, typeSpeed);
            } else {
                timer = setTimeout(() => setErasing(true), pauseTime);
            }
        } else {
            if (typedMessage.length > 0) {
                timer = setTimeout(() => {
                    setTypedMessage(typedMessage.slice(0, -1));
                }, eraseSpeed);
            } else {
                setErasing(false);
                setMessageIndex((prev) => (prev + 1) % poeticLines.length);
            }
        }
        
        return () => clearTimeout(timer);
    }, [typedMessage, erasing, messageIndex]);

    // Emoji changing effect
    useEffect(() => {
        const emojiTimer = setInterval(() => {
            setEmojiIndex((prev) => (prev + 1) % emojis.length);
        }, emojiChangeInterval);

        return () => clearInterval(emojiTimer);
    }, []);

    useEffect(() => {
        setCurrentEmoji(emojis[emojiIndex]);
    }, [emojiIndex]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in h-full">
            <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600">
                    Hey — welcome! {currentEmoji}
                </span>
            </h1>
            <p className="mt-4 text-lg font-mono text-muted-foreground max-w-md h-6">
                {typedMessage}
                <span className="blinking-cursor">|</span>
            </p>
        </div>
    );
};