"use client";

import React, { useEffect, useState, useRef } from "react";

// --- Component-Scoped CSS with Theming ---
const componentStyles = `
    /* --- THEME VARIABLES --- */
    .theme-dark {
        --bg-secondary: #1e293b;
        --bg-secondary-translucent: rgba(30, 41, 59, 0.5);
        --bg-tertiary: #0f172a;
        --text-primary: #e2e8f0;
        --text-secondary: #94a3b8;
        --text-tertiary: #cbd5e1;
        --text-accent: #67e8f9;
        --text-accent-gradient-from: #67e8f9;
        --text-accent-gradient-to: #38bdf8;
        --border-primary: #334155;
        --grid-lines: rgba(51, 65, 85, 0.2);
        --hexagon-inner-bg: #0a1027;
        --plus-icon-color: #e2e8f0;
    }
    .theme-light {
        --bg-secondary: #ffffff;
        --bg-secondary-translucent: rgba(255, 255, 255, 0.8);
        --bg-tertiary: #e2e8f0;
        --text-primary: #0f172a;
        --text-secondary: #64748b;
        --text-tertiary: #334155;
        --text-accent: #0891b2;
        --text-accent-gradient-from: #0891b2;
        --text-accent-gradient-to: #0284c7;
        --border-primary: #cbd5e1;
        --grid-lines: rgba(203, 213, 225, 0.5);
        --hexagon-inner-bg: #f8fafc;
        --plus-icon-color: #0f172a;
    }
    /* --- GENERAL STYLING --- */
    .theme-wrapper {
        background-color: var(--bg-primary);
        color: var(--text-primary);
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    /* Header */
    .header-title {
        background-image: linear-gradient(to right, var(--text-accent-gradient-from), var(--text-accent-gradient-to));
        padding:0 0 10px 0;
    }
    .header-subtitle { 
    margin-top: 0;
        color: var(--text-tertiary); 
    }
    /* Section Titles */
    .section-title { color: var(--text-accent); }
    /* Cards (Capabilities, Feedback, etc.) */
    .info-card {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        transition: background-color 0.3s ease, border-color 0.3s ease;
    }
    .info-card h3 { 
        color: var(--text-primary); 
    }
    .info-card p, .info-card li, .info-card .info-card-text { 
        color: var(--text-tertiary); 
    }
    .info-card-subtext { color: var(--text-secondary); }
    /* Form Elements */
    .form-label { color: var(--text-tertiary); }
    .form-textarea {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-primary);
        color: var(--text-primary);
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }
    .form-textarea::placeholder { color: var(--text-secondary); }
    .form-textarea:focus {
        box-shadow: 0 0 0 1px var(--text-accent);
        border-color: var(--text-accent);
        outline: 2px solid transparent;
    }
    /* FAQ */
    .faq-item-title { transition: color 0.3s ease; }
    .faq-item:hover .faq-item-title { color: var(--text-accent); }
    .faq-item-icon {
        transition: transform 0.3s ease-in-out;
    }
    .faq-item.active .faq-item-icon {
        transform: rotate(180deg);
    }
    /* Footer */
    .footer-text { color: var(--text-secondary); }
    
    /* --- Original Animations & Structures (mostly unchanged) --- */
    .icon-glow { text-shadow: 0 0 8px rgba(34, 211, 238, 0.7); }
    .fade-in-section { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    .fade-in-section.visible { opacity: 1; transform: translateY(0); }
    .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; }
    .faq-item.active .faq-answer { max-height: 200px; }
`;

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [theme, setTheme] = useState('light');
    const [userId, setUserId] = useState('guest-' + Math.floor(Math.random() * 100000));
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    // --- Refs ---
    const sectionsRef = useRef([]);

    // --- Effects ---
    useEffect(() => {
        const observer = new IntersectionObserver( (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 }
        );
        sectionsRef.current.forEach((section) => { if (section) observer.observe(section); });
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const root = document.documentElement;
        const initialTheme = root.classList.contains("dark") ? "dark" : "light";
        setTheme(initialTheme);

        // MutationObserver to detect theme changes on <html>
        const observer = new MutationObserver(() => {
            const newTheme = root.classList.contains("dark") ? "dark" : "light";
            setTheme(newTheme);
        });

        observer.observe(root, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // --- Event Handlers ---
    const handleToggleFaq = (index) => setOpenFaqIndex(openFaqIndex === index ? null : index);
    
    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!feedbackText.trim()) {
            setFeedbackMessage({ text: 'Please enter feedback.', type: 'error' });
            return;
        }
        console.log("Feedback submitted:", feedbackText);
        setFeedbackText('');
        setFeedbackMessage({ text: 'Feedback submitted locally! (not saved to DB)', type: 'success' });
        setTimeout(() => setFeedbackMessage({ text: '', type: '' }), 3000);
    };

    const faqItems = [
        { question: 'What is this website about?', answer: "This website helps you ask questions about ocean data and get answers in plain language, with easy-to-read charts and maps." },
        { question: 'How does it work?', answer: "It\'s like a smart search for the ocean. It understands your question, finds the right info, and then creates a clear answer for you." },
        { question: 'What kind of questions can I ask?', answer: "You can ask things like, 'How warm is the water near Hawaii?' or 'Show me oxygen levels in the Indian Ocean last year.'" },
        { question: 'Can I use this for a school project?', answer: "Yes! This tool is great for exploring the ocean and getting interesting data for your school projects." },
        { question: 'Is this tool free?', answer: "Yes, this project is currently free and built for anyone curious about the ocean." }
    ];
 

    return (
        <div className={`theme-wrapper theme-${theme}`}>
            <style>{componentStyles}</style>
            <div className="relative min-h-screen overflow-hidden">
                <div className="absolute inset-0 bg-grid-lines [mask-image:linear-gradient(to_bottom,white_40%,transparent)]"></div>
                
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <header
                        ref={(el) => (sectionsRef.current[0] = el)}
                        className="text-center mb-16 fade-in-section"
                    >
                        <h1 className="header-title text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text">
                            Explore the Oceans, Just by Asking.
                        </h1>
                        <p className="header-subtitle mt-4 max-w-3xl mx-auto text-lg sm:text-xl">
                            We believe everyone should be able to explore the ocean! Our goal is to make it easy for you to ask questions and get simple answers about the world's oceans.
                        </p>
                    </header>

                    <main ref={(el) => (sectionsRef.current[1] = el)} className="fade-in-section">
                        <h2 className="section-title text-3xl font-bold text-center mb-10">What This Tool Is All About</h2>
                        <div className="info-card p-6 rounded-xl shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl max-w-4xl mx-auto">
                            <h3 className="font-bold text-lg mb-2">How It Works</h3>
                            <p className="info-card-text">
                                FloatChat is a simple tool that turns your questions into answers about the ocean. We take complex data from special underwater robots and turn it into simple words, maps, and charts. It’s like having a friendly ocean expert right here to help you explore.
                            </p>
                            <h3 className="font-bold text-lg mt-4 mb-2">The Team</h3>
                            <p className="info-card-text">
                                We're a small team of ocean lovers who want to make science fun and easy. This tool is a first step in making ocean data available for students, teachers, and anyone else who is curious about our planet's oceans.
                            </p>
                        </div>
                    </main>

                    <section ref={(el) => (sectionsRef.current[2] = el)} className="mt-20 fade-in-section">
                        <h2 className="section-title text-3xl font-bold text-center mb-10">What You Can Discover</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            <div className="info-card group p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl"> <p className="text-3xl mb-3 icon-glow">🗺️</p> <h3 className="font-bold text-lg mb-2">Find a Spot</h3> <p className="info-card-text">"Show me the ocean temperature near Africa last year."</p> </div>
                            <div className="info-card group p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl"> <p className="text-3xl mb-3 icon-glow">📊</p> <h3 className="font-bold text-lg mb-2">See the Differences</h3> <p className="info-card-text">"Compare the saltiness of the water in the Atlantic and Pacific oceans."</p> </div>
                            <div className="info-card group p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl"> <p className="text-3xl mb-3 icon-glow">📍</p> <h3 className="font-bold text-lg mb-2">Track a Robot</h3> <p className="info-card-text">"Where are the closest ocean sensors to me right now?"</p> </div>
                        </div>
                    </section>
                    
                    <section ref={(el) => (sectionsRef.current[3] = el)} className="mt-20 max-w-6xl mx-auto fade-in-section">
                        <h2 className="section-title text-3xl font-bold text-center mb-10">Feedback & Contact</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="info-card group p-6 rounded-xl shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <h3 className="font-bold text-lg mb-4">Your Thoughts Matter!</h3>
                                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="feedback-input" className="form-label block text-sm font-medium mb-2"> Share your ideas or suggestions to make this better: </label>
                                        <textarea id="feedback-input" name="feedback" rows="4" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="form-textarea w-full p-3 rounded-lg" placeholder="Your feedback helps us make FloatChat better..."></textarea>
                                    </div>
                                    <button type="submit" className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all"> Send Feedback </button>
                                    {feedbackMessage.text && ( <div className={`text-center mt-4 ${feedbackMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}> {feedbackMessage.text} </div> )}
                                </form>
                            </div>
                            <div className="info-card group p-6 rounded-xl shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <h3 className="font-bold text-lg mb-4">Get in Touch</h3>
                                <p className="info-card-subtext mb-2">If you have any questions or just want to chat, here's how you can reach us:</p>
                                <ul className="space-y-2"> <li><span className="font-medium">Email:</span> contact@floatchat.com</li> <li><span className="font-medium">Website:</span> www.floatchat.com</li> </ul>
                            </div>
                        </div>
                    </section>

                    <section ref={(el) => (sectionsRef.current[4] = el)} className="mt-20 max-w-6xl mx-auto fade-in-section">
                        <h2 className="section-title text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {faqItems.map((item, index) => (
                                <div key={index} className={`info-card faq-item group p-6 rounded-xl shadow-lg cursor-pointer transform transition-transform hover:translate-y-[-5px] hover:shadow-xl ${openFaqIndex === index ? 'active' : ''}`} onClick={() => handleToggleFaq(index)}>
                                    <h3 className="font-bold text-lg mb-2 flex justify-between items-center faq-item-title">
                                        {item.question}
                                        <svg className={`w-6 h-6 faq-item-icon ${openFaqIndex === index ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                                        </svg>
                                    </h3>
                                    <p className="faq-answer info-card-text mt-2">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <footer className="footer-text text-center py-6 text-sm">
                    <p>Your User ID: <span className="font-mono">{userId}</span></p>
                    <p>&copy; 2024 FloatChat. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
