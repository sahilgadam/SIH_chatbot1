"use client";

import React, { useEffect, useState, useRef } from "react";

// --- Component-Scoped CSS with Theming ---
const componentStyles = `
    /* --- THEME VARIABLES --- */
    .theme-dark {
        --bg-secondary: #1e293b; /* slate-800 */
        --bg-secondary-translucent: rgba(30, 41, 59, 0.5); /* slate-800/50 */
        --bg-tertiary: #0f172a; /* slate-900 */
        --text-primary: #e2e8f0; /* slate-200 */
        --text-secondary: #94a3b8; /* slate-400, for less important text */
        --text-tertiary: #cbd5e1; /* slate-300, for regular text */
        --text-accent: #67e8f9; /* cyan-300 */
        --text-accent-gradient-from: #67e8f9; /* cyan-300 */
        --text-accent-gradient-to: #38bdf8; /* blue-400 */
        --border-primary: #334155; /* slate-700 */
        --grid-lines: rgba(51, 65, 85, 0.2);
        --hexagon-inner-bg: #0a1027;
        --plus-icon-color: #e2e8f0;
    }
    .theme-light {
        --bg-secondary: #ffffff;
        --bg-secondary-translucent: rgba(255, 255, 255, 0.8);
        --bg-tertiary: #e2e8f0; /* slate-200 */
        --text-primary: #0f172a; /* slate-900 */
        --text-secondary: #64748b; /* slate-500 */
        --text-tertiary: #334155; /* slate-700 */
        --text-accent: #0891b2; /* cyan-600 */
        --text-accent-gradient-from: #0891b2; /* cyan-600 */
        --text-accent-gradient-to: #0284c7; /* sky-600 */
        --border-primary: #cbd5e1; /* slate-300 */
        --grid-lines: rgba(203, 213, 225, 0.5);
        --hexagon-inner-bg: #f8fafc; /* slate-50 */
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
    }
    .header-subtitle { 
        color: var(--text-tertiary); 
    }
    /* Interactive Pipeline & Section Titles */
    .section-title { color: var(--text-accent); }
    .hexagon-label, .hexagon-sublabel { color: var(--text-tertiary); }
    .hexagon-inner {
        background-color: var(--hexagon-inner-bg);
        transition: background-color 0.3s ease;
    }
    /* Details Panel */
    .details-panel {
        background-color: var(--bg-secondary-translucent);
        border: 1px solid var(--border-primary);
        transition: background-color 0.3s ease, border-color 0.3s ease;
    }
    .details-panel h3 { 
        color: var(--text-primary); 
    }
    .details-panel p { 
        color: var(--text-tertiary); 
    }
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
    .diagram-node { transition: all 0.3s ease; cursor: pointer; border-width: 2px; border-style: solid; position: relative; border-color: transparent; }
    .diagram-node.active { border-color: #22d3ee; transform: translateY(-5px) scale(1.05); animation: node-breathing-glow 1.5s infinite ease-in-out; }
    
    @keyframes node-breathing-glow { 0% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); } 50% { box-shadow: 0 0 25px rgba(34, 211, 238, 1); } 100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); } }
    .horizontal-arrow { position: relative; width: 15rem; height: 25px; overflow: hidden; top: -11px; }
    .horizontal-arrow::before { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background-image: radial-gradient(circle, #475569 1px, transparent 1px); background-size: 10px 100%; transform: translateY(-50%); animation: flow-dots 2s linear infinite; }
    .horizontal-arrow.active::before { background-image: radial-gradient(circle, #22d3ee 1px, transparent 1px); }
    .horizontal-arrow::after { content: ''; position: absolute; top: 50%; left: -40px; width: 40px; height: 2px; background: linear-gradient(90deg, transparent, #475569, #475569); transform: translateY(-50%); filter: drop-shadow(0 0 5px #475569); opacity: 0.8; }
    .horizontal-arrow.animate-preview::after, .horizontal-arrow.active::after { animation: data-packet-flow 2s linear infinite; }
    .horizontal-arrow.active::after { background: linear-gradient(90deg, transparent, #22d3ee, #22d3ee); filter: drop-shadow(0 0 10px #22d3ee); opacity: 1; }
    @keyframes flow-dots { 0% { background-position-x: 0; } 100% { background-position-x: 10px; } }
    @keyframes data-packet-flow { 0% { left: -40px; } 100% { left: 100%; } }
    .content-fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .icon-glow { text-shadow: 0 0 8px rgba(34, 211, 238, 0.7); }
    .fade-in-section { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    .fade-in-section.visible { opacity: 1; transform: translateY(0); }
    .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; }
    .faq-item.active .faq-answer { max-height: 200px; }
    .hexagon { position: relative; width: 100px; height: 57.74px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease-in-out; }
    .hexagon:hover { transform: scale(1.1); box-shadow: 0 0 20px rgba(34, 211, 238, 0.7); }
    .hexagon.active-bg { background: rgba(34, 211, 238, 0.7) !important; }
    .details-panel-background { position: absolute; inset: 0; background-image: url('data:image/svg+xml,%3Csvg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h1v1H0zM2 2h1v1H2zM4 4h1v1H4zM6 6h1v1H6zM8 8h1v1H8z" fill="%232e3a52"/%3E%3C/svg%3E'); opacity: 0.2; animation: background-move 60s infinite linear; z-index: -1; }
    @keyframes background-move { from { background-position: 0 0; } to { background-position: 100% 100%; } }
    /* Active node emphasis */
// .hexagon.active-highlight {
//     transform: scale(1.2);
//     z-index: 10; /* Stay ahead of other nodes */
//     animation: pulse-glow 1.5s infinite ease-in-out;
//     box-shadow: 0 0 20px rgba(34, 211, 238, 0.9);
// }
    /* Active (current) node color */
.hexagon.active-highlight {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9) !important; /* cyan → blue */
  border: 2px solid #38bdf8;
  transform: scale(1.5);
  z-index: 10;
  animation: pulse-glow 1.5s infinite ease-in-out;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.9);
}


/* Glow animation */
@keyframes pulse-glow {
    0% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
    50% { box-shadow: 0 0 30px rgba(34, 211, 238, 1); }
    100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
}
    /* Completed (past) node */
.hexagon.completed {
  background: rgba(34, 211, 238, 0.3) !important;
  transform: scale(1);
  box-shadow: none;
  z-index: 1;
  border: 2px solid rgba(34, 211, 238, 0.6);
}


`;

// --- Data & Configuration ---
const architectureDetails = {
    ingestion: { title: '1. Data Ingestion & Processing', icon: '📥', content: [ { heading: 'Source Data', text: 'The pipeline begins with raw ARGO float data, provided in the complex but standard NetCDF (Network Common Data Format).' }, { heading: 'Processing Pipeline', text: 'A dedicated script ingests these files, extracting key parameters like Temperature, Salinity, and Bio-Geo-Chemical values. This raw data is then converted into highly structured and queryable formats like SQL tables or Parquet files.' } ] },
    database: { title: '2. Database & Retrieval', icon: '🗄️', content: [ { heading: 'Relational Database (PostgreSQL)', text: 'The structured oceanographic data is stored in a robust relational database. This allows for fast, precise, and complex queries on the vast dataset.' }, { heading: 'Vector Database (FAISS/Chroma)', text: 'To enable semantic search and AI-powered retrieval, metadata and data summaries are converted into vector embeddings and stored here. This is crucial for the RAG pipeline to find the most relevant context for a user\'s query.' } ] },
    ai: { title: '3. AI & Logic', icon: '🧠', content: [ { heading: 'User Interface (Chatbot)', text: 'The user interacts with the system through an intuitive chatbot interface, asking questions in natural, everyday language.' }, { heading: 'Retrieval-Augmented Generation (RAG)', text: 'The Large Language Model (LLM) first interprets the user\'s intent. It then queries the Vector Database to retrieve relevant context. Finally, using this context, the LLM generates a precise SQL query to fetch the exact data needed from the PostgreSQL database.' } ] },
    visualization: { title: '4. Visualization & Output', icon: '📈', content: [ { heading: 'Interactive Dashboard', text: 'The results from the database query are fed into a dynamic frontend dashboard. This allows for the creation of rich, interactive visualizations like geospatial maps of float trajectories (via Leaflet) or depth-time plots (via Plotly).' }, { heading: 'Chatbot Output', text: 'The system presents the generated visualizations to the user and provides a concise, natural-language summary of the findings, effectively closing the loop from question to insight.' } ] },
    start: { title: 'Welcome to FloatChat', icon: '🌊', content: [ { heading: 'Explore the Architecture', text: 'FloatChat is an AI-powered system that makes oceanographic data accessible to everyone. Click "Start Tour" to begin a step-by-step tour of how it works, or click on any hexagon to jump directly to a specific stage.' } ] },
    tourEnd: { title: 'Tour Complete', icon: '✅', content: [ { heading: 'Process Concluded', text: 'You have now completed the interactive tour of the FloatChat system. The data has flowed through the entire pipeline, from raw ingestion to a final interactive visualization and summary. You can now use the "Start Tour" button to begin again.' } ] }
};
const tourNodes = ['ingestion', 'database', 'ai', 'visualization'];

// --- Reusable Child Components ---
function HexagonNode({ id, label, subLabel, emoji, onClick, isActive, isCurrent, className }) {
    const combinedClassName = `
        hexagon cursor-pointer ${className}
        ${isCurrent ? 'active-highlight' : ''}
        ${!isCurrent && isActive ? 'completed' : ''}
    `;

    return (
        <div className="flex flex-col items-center text-center relative">
            <div className="text-xs sm:text-sm hexagon-label font-semibold mb-2">{label}</div>
            <div id={`node-${id}`} onClick={onClick} className={combinedClassName}>
                <div className="hexagon-inner">
                    <span className="text-3xl">{emoji}</span>
                </div>
            </div>
            <div className="text-xs sm:text-sm hexagon-sublabel font-semibold mt-2">{subLabel}</div>
        </div>
    );
}



function HorizontalArrow({ isActive, animatePreview }) {
    const className = `horizontal-arrow ${isActive ? 'active' : ''} ${animatePreview ? 'animate-preview' : ''}`;
    return <div className={className}></div>;
}

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [theme, setTheme] = useState('light');
    const [tourIndex, setTourIndex] = useState(0);
    const [isTourStarted, setIsTourStarted] = useState(false);
    const [activeSection, setActiveSection] = useState('start');
    const [userId, setUserId] = useState('guest-' + Math.floor(Math.random() * 100000));
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    // --- Refs ---
    const sectionsRef = useRef([]);

    // --- Derived State ---
    const currentDetails = architectureDetails[activeSection];
    const isWelcomeOrEnd = activeSection === 'start' || activeSection === 'tourEnd';

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
    const handleStartTour = () => { setIsTourStarted(true); setTourIndex(0); setActiveSection(tourNodes[0]); };
    const handleNextTour = () => {
        if (tourIndex < tourNodes.length - 1) {
            const nextIndex = tourIndex + 1;
            setTourIndex(nextIndex);
            setActiveSection(tourNodes[nextIndex]);
        } else {
            setActiveSection('tourEnd');
            setIsTourStarted(false);
            setTourIndex(0);
        }
    };
    const handleResetTour = () => { setIsTourStarted(false); setTourIndex(0); setActiveSection('start'); };
    useEffect(() => {
    const handleScroll = () => {
        if (isTourStarted) {
            // Reset the tour immediately when user scrolls
            setIsTourStarted(false);
            setTourIndex(0);
            setActiveSection("start");
        }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
        window.removeEventListener("scroll", handleScroll);
    };
}, [isTourStarted]);

    const handleNodeClick = (targetId) => {
        const clickedIndex = tourNodes.indexOf(targetId);
        if (clickedIndex !== -1) {
            setTourIndex(clickedIndex);
            setActiveSection(targetId);
            setIsTourStarted(true);
        }
    };
    
    const handleToggleFaq = (index) => setOpenFaqIndex(openFaqIndex === index ? null : index);


    // --- Data for Rendering ---
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
        { question: 'What is ARGO data?', answer: "ARGO is a global network of autonomous floats that collect temperature, salinity, and other data from the world's oceans, helping scientists study climate and ocean health." },
        { question: 'How does the AI understand my questions?', answer: "The AI uses Retrieval-Augmented Generation (RAG). It interprets your question, finds relevant data from our vector database, and uses this to build a precise query and generate an accurate response." },
        { question: 'What kind of data can I query?', answer: "You can ask about temperature, salinity, and bio-geo-chemical (BGC) data like oxygen or chlorophyll, specifying location, depth, and time." },
        { question: 'Can I use this for my research or school project?', answer: "Absolutely! This tool is a proof-of-concept perfect for exploratory analysis, presentations, or satisfying your curiosity about the ocean." },
        { question: 'Is this tool free to use?', answer: "This project is currently a proof-of-concept. The goal is to provide a free and accessible tool for the scientific and educational communities." }
    ];
    const pipelineNodeData = [
        { id: 'ingestion', label: 'Ingestion', subLabel: 'Raw ARGO NetCDF', emoji: '🗃️', className: 'bg-gradient-to-r from-orange-400 to-red-500' },
        { id: 'database', label: 'Database', subLabel: 'SQL & Vector DB', emoji: '🔍', className: 'bg-gradient-to-r from-red-500 to-purple-600' },
        { id: 'ai', label: 'AI Core', subLabel: 'RAG & LLM Engine', emoji: '🤖', className: 'bg-gradient-to-r from-purple-600 to-blue-600' },
        { id: 'visualization', label: 'Visualization', subLabel: 'Interactive Dashboard', emoji: '📊', className: 'bg-gradient-to-r from-emerald-500 to-lime-500' }
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
                            FloatChat Architecture
                        </h1>
                        <p className="header-subtitle mt-4 max-w-3xl mx-auto text-lg sm:text-xl">
                            To bridge the gap between human curiosity and the vast, living story of our oceans by empowering everyone to explore and understand ocean data through natural language.
                        </p>
                    </header>
                    <main ref={(el) => (sectionsRef.current[1] = el)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 fade-in-section">
                        <div className="lg:col-span-1 flex flex-col items-center">
                            <h2 className="section-title text-2xl font-bold text-center mb-6">Interactive Pipeline</h2>
                            <div className="w-full max-w-lg mx-auto flex flex-row items-center justify-center">
                               {pipelineNodeData.map((node, index) => (
    <React.Fragment key={node.id}>
        <HexagonNode
            id={node.id}
            label={node.label}
            subLabel={node.subLabel}
            emoji={node.emoji}
            className={node.className}
            onClick={() => handleNodeClick(node.id)}
            isActive={!isWelcomeOrEnd && tourNodes.indexOf(activeSection) >= index}
            isCurrent={activeSection === node.id} // highlight current step
        />
        {index < pipelineNodeData.length - 1 && (
            <HorizontalArrow
                isActive={!isWelcomeOrEnd && tourNodes.indexOf(activeSection) > index}
                animatePreview={!isTourStarted}
            />
        )}
    </React.Fragment>
))}

                            </div>
                            <div className="flex space-x-4 mt-6">
                                {!isTourStarted && ( <button onClick={handleStartTour} className="py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all"> Start Tour </button> )}
                                {isTourStarted && ( <div className="flex space-x-4"> <button onClick={handleNextTour} className="py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all"> Next </button> <button onClick={handleResetTour} className="py-2 px-4 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"> Reset </button> </div> )}
                            </div>
                        </div>

                        <div className="details-panel lg:col-span-1 rounded-xl shadow-2xl p-6 sm:p-8 min-h-[400px] relative">
                            <div className="details-panel-background"></div>
                            <div className="content-fade-in">
                                <h2 className="section-title text-2xl sm:text-3xl font-bold mb-4 flex items-center">
                                    <span className="text-4xl mr-4">{currentDetails.icon}</span>
                                    {currentDetails.title}
                                </h2>
                                <div className="space-y-6">
                                    {currentDetails.content.map((item, index) => ( <div key={index}> <h3 className="font-semibold text-lg">{item.heading}</h3> <p className="mt-1">{item.text}</p> </div> ))}
                                </div>
                            </div>
                        </div>
                    </main>

                    <section ref={(el) => (sectionsRef.current[2] = el)} className="mt-20 fade-in-section">
                        <h2 className="section-title text-3xl font-bold text-center mb-10">Key Capabilities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            <div className="info-card group p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl"> <p className="text-3xl mb-3 icon-glow">🗺️</p> <h3 className="font-bold text-lg mb-2">Geospatial Queries</h3> <p className="info-card-text">"Show me salinity profiles near the equator in March 2023."</p> </div>
                            <div className="info-card group p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl"> <p className="text-3xl mb-3 icon-glow">📊</p> <h3 className="font-bold text-lg mb-2">Comparative Analysis</h3> <p className="info-card-text">"Compare BGC parameters in the Arabian Sea for the last 6 months."</p> </div>
                            <div className="info-card group p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl"> <p className="text-3xl mb-3 icon-glow">📍</p> <h3 className="font-bold text-lg mb-2">Proximity Search</h3> <p className="info-card-text">"What are the nearest ARGO floats to this location?"</p> </div>
                        </div>
                    </section>
                    
                    <section ref={(el) => (sectionsRef.current[3] = el)} className="mt-20 max-w-6xl mx-auto fade-in-section">
                        <h2 className="section-title text-3xl font-bold text-center mb-10">Feedback & Contact</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="info-card group p-6 rounded-xl shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <h3 className="font-bold text-lg mb-4">Leave Your Feedback</h3>
                                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="feedback-input" className="form-label block text-sm font-medium mb-2"> Share your thoughts, suggestions, or ideas here: </label>
                                        <textarea id="feedback-input" name="feedback" rows="4" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="form-textarea w-full p-3 rounded-lg" placeholder="Your feedback is valuable..."></textarea>
                                    </div>
                                    <button type="submit" className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all"> Submit Feedback </button>
                                    {feedbackMessage.text && ( <div className={`text-center mt-4 ${feedbackMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}> {feedbackMessage.text} </div> )}
                                </form>
                            </div>
                            <div className="info-card group p-6 rounded-xl shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <h3 className="font-bold text-lg mb-4">Contact Information</h3>
                                <p className="info-card-subtext mb-2">For business inquiries or collaborations, feel free to reach out:</p>
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
