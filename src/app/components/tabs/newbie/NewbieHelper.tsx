"use client";

import React, { useState, useRef, useEffect, FC } from 'react';
import { Send, User, SquarePlus, ChevronDown, Dices, ArrowLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NewbieGreeting from '../../chat/NewbieGreeting';

const NavIcon: FC = () => (
    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
      🌊
    </div>
);

interface QuickQ {
    id: string;
    title: string;
    preview: string;
    full_answer: string;
    tags: string[];
    emoji?: string;
}

const oceanBasicsQs: QuickQ[] = [
    { id: 'basics-q1', title: 'Why is the deep sea so cold?', preview: 'Surface vs. deep temperature.', full_answer: 'Sunlight only heats the surface waters. The deep ocean, which sunlight can\'t reach, gets its water from cold, dense currents sinking near the poles, keeping it just a few degrees above freezing.', tags: ['temperature'], emoji: '🌡️' },
    { id: 'basics-q2', title: 'What is a thermocline?', preview: 'A layer of rapid temperature change.', full_answer: 'A thermocline is a thin layer in the ocean where the temperature changes very quickly with depth. It acts as a barrier between the warm surface water and the cold deep water.', tags: ['temperature'], emoji: '🌡️' },
    { id: 'basics-q3', title: 'Why does salinity matter for currents?', preview: 'How saltiness drives ocean movement.', full_answer: 'Salty water is denser than fresh water. When cold, salty water becomes very dense, it sinks and pushes deep water around, driving the massive "global conveyor belt" currents.', tags: ['salinity'], emoji: '🧂' },
    { id: 'basics-q4', title: 'How does pressure change with depth?', preview: 'The immense pressure of the deep.', full_answer: 'Pressure increases by about 1 atmosphere (the pressure we feel at sea level) for every 10 meters you go down. In the deepest trenches, the pressure is over 1,000 times what it is at the surface!', tags: ['pressure'], emoji: '💥' },
    { id: 'basics-q5', title: 'How long is the global ocean journey?', preview: 'The "global conveyor belt" timeline.', full_answer: 'A single drop of water traveling on the deep ocean conveyor belt can take about 1,000 years to complete its journey around the world.', tags: ['currents'], emoji: '🌍' },
    { id: 'basics-q6', title: 'How much of the ocean is unmapped?', preview: 'The last frontier on Earth.', full_answer: 'Believe it or not, about 80% of our planet\'s ocean floor is unmapped and unexplored. We have better maps of Mars than we do of our own deep seas.', tags: ['exploration'], emoji: '🗺️' },
    { id: 'basics-q7', title: 'How much heat does the ocean store?', preview: 'Earth\'s gigantic thermal battery.', full_answer: 'The ocean has a massive heat capacity and has absorbed about 90% of the extra heat from recent global warming. This helps moderate our climate but also contributes to sea-level rise.', tags: ['temperature', 'climate'], emoji: '🌡️' },
    { id: 'basics-q8', title: 'Can ocean water be below 0°C?', preview: 'How salt prevents freezing.', full_answer: 'Yes! Because it\'s salty, seawater freezes at a lower temperature than fresh water (around -1.8°C). In polar regions, it\'s common to find liquid ocean water below 0°C.', tags: ['temperature', 'polar'], emoji: '❄️' },
    { id: 'basics-q9', title: 'How do satellites measure temperature?', preview: 'Measuring the ocean\'s "skin".', full_answer: 'Satellites use infrared sensors to measure the temperature of the very top millimeter of the ocean, often called the "skin temperature". This data is vital for weather forecasting.', tags: ['temperature', 'satellite'], emoji: '🛰️' },
    { id: 'basics-q10', title: 'Where is the ocean freshest?', preview: 'Why some seas are less salty.', full_answer: 'Ocean water is freshest (less salty) near places where big rivers flow into it or where polar ice is melting, such as in the Baltic Sea or the Arctic Ocean.', tags: ['salinity', 'geography'], emoji: '💧' },
    { id: 'basics-q11', title: 'Does salinity change with depth?', preview: 'The layers of saltiness.', full_answer: 'Yes, it often does. Sometimes, a layer of fresher water from rain or rivers can sit on top of saltier, denser water below, creating a distinct boundary called a halocline.', tags: ['salinity', 'layers'], emoji: '🧂' },
    { id: 'basics-q12', title: 'Why is deep-sea life so strange?', preview: 'Adapting to extreme pressure.', full_answer: 'Extreme pressure in the deep sea alters biology. Animals there have evolved special flexible membranes and pressure-stable proteins to survive where other life forms would be crushed.', tags: ['pressure', 'biology'], emoji: '🦑' },
    { id: 'basics-q13', title: 'How do instruments survive the deep?', preview: 'Engineering for extreme depths.', full_answer: 'Instruments like Argo floats are built with incredibly strong materials like titanium and are often encased in hardened housings to withstand the crushing pressure of the deep ocean.', tags: ['pressure', 'argo'], emoji: '🔧' },
    { id: 'basics-q14', title: 'Why is the equator warmer?', preview: 'The sun\'s angle and ocean heat.', full_answer: 'The sun\'s rays hit the equator more directly all year round, delivering more concentrated energy and heat to the surface waters compared to the poles.', tags: ['location', 'temperature'], emoji: '☀️' },
    { id: 'basics-q15', title: 'How fast do ocean currents flow?', preview: 'From slow drifts to fast rivers.', full_answer: 'Current speeds vary wildly. Deep ocean currents are very slow, moving only a few centimeters per second, while powerful surface currents like the Gulf Stream can flow as fast as 2-3 meters per second!', tags: ['currents', 'speed'], emoji: '💨' },
    { id: 'basics-q16', title: 'How do scientists track water?', preview: 'Floats, drifters, and satellites.', full_answer: 'Scientists use many tools! Drifters and ARGO floats track paths directly, satellites watch the sea surface height to map currents, and special tracers act like dye to follow the flow.', tags: ['currents', 'tracking'], emoji: '🛰️' },
    { id: 'basics-q17', title: 'Can water travel between oceans?', preview: 'The connections between seas.', full_answer: 'Yes, water constantly moves between oceans through major gateways like the Drake Passage near Antarctica or the Indonesian Throughflow, connecting the Pacific and Indian Oceans.', tags: ['currents', 'geography'], emoji: '↔️' },
    { id: 'basics-q18', title: 'What are T-S diagrams?', preview: 'The "fingerprints" of ocean water.', full_answer: 'Scientists plot Temperature vs. Salinity on a T-S diagram. Each water mass has a unique T-S signature, like a fingerprint, which helps identify its origin and history.', tags: ['oceanography', 'measurements'], emoji: '📈' }
];

export default function NewbieHelper({ messages, setMessages, theme, handleNewChat, setIsChatting, onSurpriseMe, showQuickQs, setShowQuickQs }) {
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [quickQs, setQuickQs] = useState<QuickQ[]>([]);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [view, setView] = useState<'main' | 'basics'>('main');
    const [visibleBasicsCount, setVisibleBasicsCount] = useState(6);
    
    useEffect(() => {
        console.log("Analytics Event: newbie_opened");
        fetch('/newbie_quick_qs_v1.json')
            .then(response => response.json())
            .then(data => setQuickQs(data))
            .catch(error => console.error("Failed to load Quick-Qs from file.", error));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        const userInput = inputMessage.trim();
        const lowerCaseInput = userInput.toLowerCase();

        if (messages.length === 0) setIsChatting(true); 

        setMessages((prev) => [...prev, { id: Date.now() + 1, who: 'user', text: userInput }]);
        setInputMessage("");

        const researcherKeywords = ['graph', 'data', 'trajectory', 'plot', 'chart'];
        const isResearcherQuery = researcherKeywords.some(keyword => lowerCaseInput.includes(keyword));
        const isGreeting = /\bhello\b/i.test(userInput);

        let botResponseText;

        if (isResearcherQuery) {
            botResponseText = "For requests about graphs, data, and trajectories, you'll get a better experience in **Researcher mode**. Try the toggle in the sidebar!";
        } else if (isGreeting) {
            botResponseText = "Hello there! What are you curious about today?";
            if (!showQuickQs) {
                setShowQuickQs(true);
                console.log(`Analytics Event: hello_triggered_quickqs, message_excerpt: "${userInput}"`);
            }
        } else {
            botResponseText = `This is a friendly, mocked response for: "${userInput}". In a real scenario, I would provide a helpful explanation!`;
        }
        
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 2, who: 'ai', text: botResponseText }]);
        }, 800);
    };
    
    const handleQuickQClick = (q: QuickQ) => {
        if (q.id === 'basics') {
            setView('basics');
            return;
        }

        if (messages.length === 0) setIsChatting(true);
        
        setMessages(prev => [...prev, { id: Date.now() + 1, who: 'user', text: q.title }]);
        console.log(`Analytics Event: quickq_clicked, id: "${q.id}", title: "${q.title}", auto_sent: true`);

        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 2, who: 'ai', text: q.full_answer }]);
        }, 800);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } 
        else if (e.key === 'Escape' && showQuickQs) { setShowQuickQs(false); }
    };
    
    const AnimatedLabel = ({ text }: { text: string }) => (
        <motion.span
            initial={{ width: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: 'auto', opacity: 1, marginRight: '8px' }}
            exit={{ width: 0, opacity: 0, marginRight: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="text-sm font-semibold whitespace-nowrap overflow-hidden"
        >
            {text}
        </motion.span>
    );

    const handleBackClick = () => {
        setView('main');
        setVisibleBasicsCount(6);
    };
    
    const currentQs = view === 'main' ? quickQs : oceanBasicsQs.slice(0, visibleBasicsCount);

    return (
        <section className="h-full animate-fade-in">
            <div className={`bg-card/80 backdrop-blur-lg rounded-xl shadow-lg h-full flex flex-col ${messages.length > 0 ? 'shadow-cyan-400/15' : ''}`}>
                <div className="p-4 sm:p-6 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between text-xl font-bold mb-4 border-b pb-3 text-foreground/80 dark:text-foreground/80 border-white/10 dark:border-gray-700/50">
                        <h2>FloatChat Bot</h2>
                        <div className="flex items-center justify-end bg-muted/50 p-1 rounded-full" onMouseLeave={() => setHoveredButton(null)}>
                           <motion.button layout onMouseEnter={() => setHoveredButton('surpriseMe')} onClick={onSurpriseMe} className="p-2 rounded-full hover:bg-card transition-colors flex items-center gap-2">
                                <Dices size={20} />
                                <AnimatePresence>{hoveredButton === 'surpriseMe' && <AnimatedLabel text="Surprise Me" />}</AnimatePresence>
                           </motion.button>
                           <motion.button layout onMouseEnter={() => setHoveredButton('newChat')} onClick={handleNewChat} className="p-2 rounded-full hover:bg-card transition-colors flex items-center gap-2">
                                <SquarePlus size={20} />
                                <AnimatePresence>{hoveredButton === 'newChat' && <AnimatedLabel text="New Chat" />}</AnimatePresence>
                           </motion.button>
                        </div>
                    </div>
                    
                    {/* **FIXED**: Removed the conditional blur from this div */}
                    <div className={`flex-1 space-y-6 overflow-y-auto pr-2 mb-4 transition-all duration-300`}>
                        {messages.length === 0 ? <NewbieGreeting /> : messages.map((m) => (
                            <div key={m.id} className={`flex items-start gap-3 ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.who === 'ai' && <div className="flex-shrink-0"><NavIcon /></div>}
                                <div className={`max-w-xs lg:max-w-xl p-3.5 rounded-2xl shadow-lg text-sm ${m.who === 'user' ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white' : 'bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200'}`}>
                                    <p className={m.who === 'ai' ? 'font-mono' : 'font-medium'} dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                </div>
                                {m.who === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-md"><User size={16} className="text-muted-foreground" /></div>}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="mt-auto border-t pt-4 border-white/10 dark:border-gray-700/50">
                        <div className="flex justify-between items-center">
                            <button onClick={() => setShowQuickQs(!showQuickQs)} className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                                {showQuickQs ? 'Hide quick Qs' : 'Show quick Qs'}
                                <ChevronDown size={16} className={`transition-transform ${showQuickQs ? 'rotate-180' : ''}`} />
                            </button>
                            {showQuickQs && view === 'basics' && (
                                <div className="flex items-center gap-4">
                                    {visibleBasicsCount < oceanBasicsQs.length && (
                                        <button onClick={() => setVisibleBasicsCount(prev => prev + 6)} className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                                            <Plus size={16} /> More
                                        </button>
                                    )}
                                    <button onClick={handleBackClick} className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                </div>
                            )}
                        </div>

                        {showQuickQs && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                {currentQs.map(q => (
                                    <button
                                        key={q.id}
                                        role="button"
                                        aria-label={`${q.title}. ${q.preview}`}
                                        onClick={() => handleQuickQClick(q)}
                                        className="text-left p-3 bg-card hover:bg-muted/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary active:scale-95"
                                    >
                                        <div className="font-bold text-foreground">{q.emoji} {q.title}</div>
                                        <p className="text-xs text-muted-foreground mt-1">{q.preview}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative flex items-center gap-3">
                            <input
                                ref={inputRef}
                                id="chat-input"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                className={`flex-1 p-3 rounded-full border bg-background/50 backdrop-blur-lg focus:ring-2 focus:outline-none placeholder:text-opacity-60 ${theme === 'light' ? 'border-slate-300/70 text-slate-800 placeholder:text-slate-500 focus:ring-primary' : 'border-slate-700 text-slate-100 placeholder:text-slate-400 focus:ring-primary'}`}
                                placeholder={'Ask a question...'}
                                onKeyDown={handleKeyDown}
                            />
                            <button onClick={handleSendMessage} className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all transform active:scale-95 shadow-lg">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};