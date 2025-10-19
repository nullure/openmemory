import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
    return (
        <>
            <Head>
                <title>OpenMemory - Long-term Memory for AI Agents</title>
                <meta name="description" content="Production-ready long-term memory system for AI agents. Multi-sector embeddings, intelligent decay, and graph-based knowledge retrieval." />
            </Head>

            <div className="relative min-h-screen bg-[#01030d] text-gray-100 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#020712] via-[#01040c] to-[#01030b] opacity-95"></div>
                    <div className="absolute -top-[26rem] right-[-18rem] w-[60rem] h-[60rem] bg-[radial-gradient(circle_at_center,_rgba(30,64,175,0.28),_transparent_65%)] blur-3xl opacity-70"></div>
                    <div className="absolute bottom-[-22rem] left-[-16rem] w-[56rem] h-[56rem] bg-[radial-gradient(circle_at_center,_rgba(13,23,42,0.82),_transparent_75%)] blur-3xl opacity-60"></div>
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] bg-[radial-gradient(circle,_rgba(15,118,178,0.28),_transparent_70%)] blur-3xl opacity-60"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(79,70,229,0.14),_transparent_75%)]"></div>
                </div>

                <div className="relative z-10">
                    <header className="fixed top-0 w-full backdrop-blur-2xl bg-[#01030d]/85 z-50 border-b border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                        <div className="flex justify-between items-center py-5">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                    <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-xl font-semibold tracking-tight text-white">OpenMemory</span>
                            </Link>

                            <nav className="hidden lg:flex items-center gap-1">
                                <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    Features
                                </a>
                                <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    How it Works
                                </a>
                                <Link href="/docs/introduction" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    Documentation
                                </Link>
                                <div className="ml-2 pl-2 border-l border-slate-800/60">
                                    <a
                                        href="https://github.com/nullure/openmemory"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/40 hover:bg-slate-800/50 border border-slate-700/40 text-white text-sm font-medium rounded-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                        </svg>
                                        GitHub
                                    </a>
                                </div>
                            </nav>
                        </div>
                    </div>
                </header>

                <section className="relative pt-32 pb-28 px-6 sm:px-8 lg:px-10 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gradient-to-br from-blue-950/45 via-slate-950/35 to-transparent blur-3xl opacity-70"></div>
                        <div className="absolute top-1/2 right-[-120px] w-[420px] h-[420px] bg-gradient-to-br from-indigo-950/55 via-slate-950/40 to-transparent blur-3xl"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.15),_transparent_65%)]"></div>
                        <div className="absolute inset-x-0 top-28 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-6 space-y-10">
                                <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-950/60 border border-indigo-900/40 rounded-full text-sm font-medium text-gray-300 backdrop-blur-md shadow-lg shadow-black/30">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                    </span>
                                    <span className="text-gray-400">Now shipping</span>
                                    <span className="text-white font-semibold">HMD v2</span>
                                    <span className="text-gray-600">·</span>
                                    <span className="text-emerald-400">Production Network</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.12] tracking-tight">
                                    <span className="block text-white mb-3">Memory that feels</span>
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-400">handcrafted for autonomous agents</span>
                                </h1>

                                <p className="text-lg sm:text-xl text-gray-400/90 leading-relaxed max-w-xl">
                                    OpenMemory treats every conversation like a living system—capturing emotion, context, and time with graceful decay and automatic reinforcement.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <Link
                                        href="/docs/quick-start"
                                        className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base rounded-xl transition-all shadow-[0_20px_45px_-20px_rgba(99,102,241,0.6)]"
                                    >
                                        Deploy in minutes
                                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="/docs/introduction"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-700/50 text-white/80 hover:text-white hover:border-indigo-600/50 transition-all"
                                    >
                                        Explore docs
                                        <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </Link>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800/40">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase tracking-widest">01</div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Five-sector embeddings</p>
                                            <p className="text-sm text-gray-500">Factual, emotional, temporal, relational, and behavioral memory.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs font-semibold uppercase tracking-widest">02</div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Graceful decay curves</p>
                                            <p className="text-sm text-gray-500">Automatic reinforcement keeps relevant context always sharp.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500/80 pt-2">
                                    <span className="uppercase tracking-[0.3em] text-gray-600/80 text-xs">Trusted by teams building</span>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="px-3 py-1.5 rounded-full border border-slate-700/50 text-white/80 bg-slate-900/40">Agents</div>
                                        <div className="px-3 py-1.5 rounded-full border border-slate-700/50 text-white/80 bg-slate-900/40">Assistants</div>
                                        <div className="px-3 py-1.5 rounded-full border border-slate-700/50 text-white/80 bg-slate-900/40">Knowledge Graphs</div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-6 relative">
                                <div className="absolute -top-12 -left-10 lg:-left-16 h-72 w-72 bg-gradient-to-br from-indigo-500/30 via-transparent to-transparent blur-3xl opacity-60"></div>
                                <div className="absolute -bottom-16 -right-4 h-64 w-64 bg-gradient-to-br from-violet-500/20 via-transparent to-transparent blur-3xl opacity-70"></div>

                                <div className="relative mx-auto max-w-xl">
                                    <div className="absolute -top-24 left-1/3 -translate-x-1/2 w-52 rounded-2xl border border-slate-700/40 bg-slate-950/60 backdrop-blur-lg p-4 shadow-[0_20px_60px_-30px_rgba(56,189,248,0.35)]">
                                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-3">Pulse</p>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[11px] text-gray-500">Retention</p>
                                                <p className="text-xl font-semibold text-white">94.7%</p>
                                            </div>
                                            <div className="h-12 flex items-end gap-1">
                                                <span className="w-2 h-6 rounded-full bg-gradient-to-t from-indigo-500/10 to-indigo-400"></span>
                                                <span className="w-2 h-9 rounded-full bg-gradient-to-t from-indigo-500/10 to-indigo-300"></span>
                                                <span className="w-2 h-12 rounded-full bg-gradient-to-t from-indigo-500/10 to-indigo-200"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative rounded-[28px] border border-slate-700/35 bg-slate-950/50 backdrop-blur-2xl p-8 shadow-[0_40px_120px_-40px_rgba(79,70,229,0.55)] overflow-hidden">
                                        <div className="absolute inset-px rounded-[26px] border border-slate-800/50"></div>
                                        <div className="flex items-center justify-between mb-10 relative">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Memory health</p>
                                                <p className="text-3xl font-semibold text-white">97%</p>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                                Live sync
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-10 text-sm relative">
                                            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
                                                <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Factual</p>
                                                <p className="text-lg font-semibold text-white">23k</p>
                                                <p className="text-xs text-gray-500">Anchored nodes</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
                                                <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Emotional</p>
                                                <p className="text-lg font-semibold text-white">18k</p>
                                                <p className="text-xs text-gray-500">Sentiment cues</p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
                                                <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Temporal</p>
                                                <p className="text-lg font-semibold text-white">6h</p>
                                                <p className="text-xs text-gray-500">Average recall</p>
                                            </div>
                                        </div>

                                        <div className="relative h-36 bg-gray-900/50 border border-slate-800/40 rounded-2xl overflow-hidden">
                                            <svg className="absolute inset-6" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M0 85 C 12 70, 28 52, 44 48 C 60 44, 74 54, 86 40" stroke="#818cf8" strokeWidth="0.6" fill="none" strokeLinecap="round" />
                                                <path d="M0 85 C 12 70, 28 52, 44 48 C 60 44, 74 54, 86 40 L 100 40 L 100 100 L 0 100 Z" fill="url(#heroGradient)" />
                                                <circle cx="28" cy="62" r="1.8" fill="#34d399" />
                                                <circle cx="68" cy="48" r="1.8" fill="#34d399" />
                                            </svg>
                                            <div className="absolute bottom-5 left-6 flex items-center gap-2 text-xs text-gray-500">
                                                <span className="inline-flex w-2 h-2 rounded-full bg-indigo-400"></span>
                                                Natural decay
                                            </div>
                                            <div className="absolute top-5 right-6 inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                                                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
                                                Reinforcement pulse
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-12 right-0 w-56 rounded-2xl border border-slate-700/40 bg-slate-950/60 backdrop-blur-lg p-5 shadow-[0_20px_60px_-30px_rgba(99,102,241,0.45)]">
                                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-4">Sync map</p>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between text-white/80">
                                                <span>API latency</span>
                                                <span className="text-emerald-300">36ms</span>
                                            </div>
                                            <div className="flex items-center justify-between text-white/80">
                                                <span>Graph updates</span>
                                                <span className="text-emerald-300">+128</span>
                                            </div>
                                            <div className="flex items-center justify-between text-white/80">
                                                <span>Decay events</span>
                                                <span className="text-amber-300">3</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative py-24 px-6 sm:px-8 lg:px-10" id="how-it-works">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-semibold text-indigo-400 mb-4">
                                Memory Architecture
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                                Multi-Dimensional Knowledge
                            </h2>
                            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                                HMD v2 specification with five interconnected memory dimensions
                            </p>
                        </div>

                        <div className="grid md:grid-cols-5 gap-4 mb-14">
                            <div className="group relative h-full">
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/15 via-transparent to-transparent rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-full p-6 bg-slate-950/40 hover:bg-slate-950/50 border border-slate-700/40 hover:border-indigo-500/30 rounded-2xl transition-all duration-300 flex flex-col shadow-[0_10px_35px_-25px_rgba(79,70,229,0.6)]">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-12 w-12 rounded-2xl border border-slate-700/50 bg-slate-900/50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l8 4 8-4" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-300/70">Sector 01</span>
                                    </div>
                                    <h3 className="font-semibold text-white mb-3">Factual</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed flex-1">Structured knowledge, factual anchors, and system state snapshots.</p>
                                    <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-indigo-300/70">
                                        <span className="inline-flex w-2 h-2 rounded-full bg-indigo-400"></span>
                                        Precision
                                    </div>
                                </div>
                            </div>

                            <div className="group relative h-full">
                                <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/15 via-transparent to-transparent rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-full p-6 bg-slate-950/40 hover:bg-slate-950/50 border border-slate-700/40 hover:border-fuchsia-500/30 rounded-2xl transition-all duration-300 flex flex-col shadow-[0_10px_35px_-25px_rgba(236,72,153,0.45)]">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-12 w-12 rounded-2xl border border-slate-700/50 bg-slate-900/50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-fuchsia-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.418 0 8-3.239 8-7.236 0-4.855-3.99-6.764-8-11.264-4.01 4.5-8 6.409-8 11.264C4 17.761 7.582 21 12 21z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 13a2.5 2.5 0 105 0" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70">Sector 02</span>
                                    </div>
                                    <h3 className="font-semibold text-white mb-3">Emotional</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed flex-1">Sentiment arcs, tone memory, and user affinity calibration.</p>
                                    <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-fuchsia-300/70">
                                        <span className="inline-flex w-2 h-2 rounded-full bg-fuchsia-300"></span>
                                        Empathy
                                    </div>
                                </div>
                            </div>

                            <div className="group relative h-full">
                                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-transparent to-transparent rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-full p-6 bg-slate-950/40 hover:bg-slate-950/50 border border-slate-700/40 hover:border-emerald-500/30 rounded-2xl transition-all duration-300 flex flex-col shadow-[0_10px_35px_-25px_rgba(16,185,129,0.45)]">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-12 w-12 rounded-2xl border border-slate-700/50 bg-slate-900/50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m8-7l-7 18" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/70">Sector 03</span>
                                    </div>
                                    <h3 className="font-semibold text-white mb-3">Temporal</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed flex-1">Chronological reasoning, session stitching, and cadence tracking.</p>
                                    <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-emerald-300/70">
                                        <span className="inline-flex w-2 h-2 rounded-full bg-emerald-300"></span>
                                        Rhythm
                                    </div>
                                </div>
                            </div>

                            <div className="group relative h-full">
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/15 via-transparent to-transparent rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-full p-6 bg-slate-950/40 hover:bg-slate-950/50 border border-slate-700/40 hover:border-amber-500/30 rounded-2xl transition-all duration-300 flex flex-col shadow-[0_10px_35px_-25px_rgba(245,158,11,0.45)]">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-12 w-12 rounded-2xl border border-slate-700/50 bg-slate-900/50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.313 0-6 2.239-6 5 0 1.657 1.343 3 3 3h6a3 3 0 003-3c0-2.761-2.687-5-6-5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13l3 3 3-3" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-amber-300/70">Sector 04</span>
                                    </div>
                                    <h3 className="font-semibold text-white mb-3">Relational</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed flex-1">Entity graphs, relationship strength, and waypoint routing.</p>
                                    <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-amber-300/70">
                                        <span className="inline-flex w-2 h-2 rounded-full bg-amber-300"></span>
                                        Connectivity
                                    </div>
                                </div>
                            </div>

                            <div className="group relative h-full">
                                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/15 via-transparent to-transparent rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-full p-6 bg-slate-950/40 hover:bg-slate-950/50 border border-slate-700/40 hover:border-pink-500/30 rounded-2xl transition-all duration-300 flex flex-col shadow-[0_10px_35px_-25px_rgba(236,72,153,0.5)]">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-12 w-12 rounded-2xl border border-slate-700/50 bg-slate-900/50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h3l2 5-2 7H5zM16 4h3l-3 12h-3z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 15h8l2 5H9z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-pink-300/70">Sector 05</span>
                                    </div>
                                    <h3 className="font-semibold text-white mb-3">Behavioral</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed flex-1">Intent patterns, habits, and adaptive decision surfaces.</p>
                                    <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-pink-300/70">
                                        <span className="inline-flex w-2 h-2 rounded-full bg-pink-300"></span>
                                        Adaptation
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-gradient-to-br from-slate-950/40 via-slate-950/25 to-transparent px-8 sm:px-12 py-10 sm:py-12">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.14),_transparent_65%)]"></div>
                            <div className="absolute inset-px rounded-[26px] border border-slate-800/40"></div>
                            <div className="relative grid lg:grid-cols-12 gap-10 items-center">
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/40 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                                        Decay Engine
                                    </div>
                                    <h3 className="text-3xl font-semibold text-white leading-tight">How memory decay stays graceful and useful</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Memories fade following curved trajectories, while reinforcement pulses lift critical context back above the retention threshold.
                                    </p>
                                    <div className="space-y-4 text-sm text-gray-400">
                                        <div className="flex items-start gap-3">
                                            <span className="w-2 h-2 mt-1 rounded-full bg-indigo-400"></span>
                                            <div>
                                                <p className="text-white font-medium">Sector-aware decay</p>
                                                <p className="text-xs text-gray-500">Each memory dimension carries its own slope and minimum floor so emotional cues linger longer than transient facts.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-2 h-2 mt-1 rounded-full bg-emerald-400"></span>
                                            <div>
                                                <p className="text-white font-medium">Automatic reinforcement</p>
                                                <p className="text-xs text-gray-500">Signal spikes from conversations or tool outcomes fire a pulse that restores strength without manual resets.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-2 h-2 mt-1 rounded-full bg-amber-400"></span>
                                            <div>
                                                <p className="text-white font-medium">Attribution trails</p>
                                                <p className="text-xs text-gray-500">Every reinforcement links back to its trigger so agents can explain why context remained in play.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7">
                                    <div className="relative h-72 rounded-3xl border border-slate-700/30 bg-gradient-to-br from-slate-950/95 via-slate-950/85 to-gray-900/80 p-6 overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.18),_transparent_75%)] opacity-80"></div>
                                        <svg className="relative h-full w-full" viewBox="0 0 320 180" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="decayFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0" stopColor="rgba(99,102,241,0.32)" />
                                                    <stop offset="1" stopColor="rgba(99,102,241,0)" />
                                                </linearGradient>
                                                <linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0" stopColor="rgba(52,211,153,0.45)" />
                                                    <stop offset="1" stopColor="rgba(52,211,153,0)" />
                                                </linearGradient>
                                                <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0" stopColor="rgba(148,163,184,0.12)" />
                                                    <stop offset="1" stopColor="rgba(148,163,184,0.02)" />
                                                </linearGradient>
                                                <filter id="pulseGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>

                                            <rect x="0" y="0" width="320" height="180" fill="url(#gridFade)" />

                                            <g stroke="rgba(148,163,184,0.18)" strokeWidth="1">
                                                <line x1="40" y1="20" x2="40" y2="170" />
                                                <line x1="40" y1="170" x2="300" y2="170" />
                                                <line x1="40" y1="50" x2="300" y2="50" strokeDasharray="6 6" />
                                                <line x1="40" y1="110" x2="300" y2="110" strokeDasharray="4 6" />
                                                <line x1="90" y1="20" x2="90" y2="170" strokeDasharray="4 6" />
                                                <line x1="160" y1="20" x2="160" y2="170" strokeDasharray="4 6" />
                                                <line x1="230" y1="20" x2="230" y2="170" strokeDasharray="4 6" />
                                            </g>

                                            <path d="M40 40 C 95 25, 140 58, 180 80 S 255 140, 300 150 L 300 170 L 40 170 Z" fill="url(#decayFill)" />
                                            <path d="M40 40 C 95 25, 140 58, 180 80 S 255 140, 300 150" stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                                            <path d="M168 120 C 188 76, 220 65, 268 86" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#pulseGlow)" />
                                            <path d="M168 120 C 188 76, 220 65, 268 86 L 268 170 L 168 170 Z" fill="url(#pulseFill)" opacity="0.65" />

                                            <circle cx="110" cy="58" r="5" fill="#34d399" filter="url(#pulseGlow)" />
                                            <circle cx="180" cy="86" r="5.5" fill="#34d399" filter="url(#pulseGlow)" />
                                            <circle cx="242" cy="98" r="5" fill="#34d399" filter="url(#pulseGlow)" />
                                            <circle cx="280" cy="130" r="4" fill="#fbbf24" />

                                            <text x="50" y="36" fill="rgba(226,232,240,0.65)" fontSize="11" fontFamily="'Space Grotesk','Inter',sans-serif">Retention zone</text>
                                            <text x="50" y="104" fill="rgba(226,232,240,0.45)" fontSize="10" fontFamily="'Space Grotesk','Inter',sans-serif">Decay threshold</text>
                                            <text x="50" y="166" fill="rgba(226,232,240,0.45)" fontSize="10" fontFamily="'Space Grotesk','Inter',sans-serif">Archive</text>

                                            <polygon points="300,170 292,166 292,174" fill="rgba(148,163,184,0.4)" />
                                            <polygon points="40,20 36,28 44,28" fill="rgba(148,163,184,0.4)" />
                                        </svg>

                                        <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/40 text-[11px] text-white/70 uppercase tracking-[0.28em]">Strength</div>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/40 text-[11px] text-white/70 uppercase tracking-[0.28em]">Timeline</div>
                                        <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
                                            <span className="flex items-center gap-2">
                                                <span className="inline-flex w-6 h-[3px] rounded-full bg-indigo-400"></span>
                                                Natural decay slope
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="inline-flex w-6 h-[3px] rounded-full bg-emerald-400"></span>
                                                Reinforcement pulse
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="inline-flex w-2 h-2 rounded-full bg-amber-300"></span>
                                                Retention threshold
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative py-24 px-6 sm:px-8 lg:px-10" id="features">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-semibold text-indigo-400 mb-4">
                                Features
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                                Everything You Need
                            </h2>
                            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                                Production-ready features for intelligent memory management
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-indigo-500/40 hover:bg-slate-900/40">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-indigo-500/15 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-start justify-between mb-7">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l8 4 8-4" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Structure</span>
                                </div>
                                <h3 className="relative text-lg font-semibold text-white mb-3">Multi-sector embeddings</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-6">
                                    Encode conversations into five synchronized dimensional vectors that elegantly preserve nuance across sessions.
                                </p>
                                <ul className="relative space-y-2 text-xs text-gray-500">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                        Cross-sector weighting and drift control
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                        Vector normalization per session
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-violet-500/40 hover:bg-slate-900/40">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-violet-500/15 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-start justify-between mb-7">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Dynamics</span>
                                </div>
                                <h3 className="relative text-lg font-semibold text-white mb-3">Intelligent decay orchestration</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-6">
                                    Memories decay gracefully along custom curves, while high-signal events trigger reinforcement without manual tuning.
                                </p>
                                <ul className="relative space-y-2 text-xs text-gray-500">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                        Reinforcement thresholds per sector
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                        Scheduled decay audits every 12h
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-purple-500/40 hover:bg-slate-900/40">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-purple-500/15 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-start justify-between mb-7">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Context</span>
                                </div>
                                <h3 className="relative text-lg font-semibold text-white mb-3">Waypoints & graph routing</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-6">
                                    Every memory anchors to a dynamic waypoint graph, powering contextual recall and multi-hop reasoning.
                                </p>
                                <ul className="relative space-y-2 text-xs text-gray-500">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                        Bidirectional edges with weight decay
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                        Streaming updates via SQLite triggers
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-sky-500/40 hover:bg-slate-900/40">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-sky-500/15 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-start justify-between mb-7">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Ingestion</span>
                                </div>
                                <h3 className="relative text-lg font-semibold text-white mb-3">Multimodal pipelines</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-6">
                                    Stream documents, call transcripts, and events through adaptive chunking with automatic context stitching.
                                </p>
                                <ul className="relative space-y-2 text-xs text-gray-500">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                        Async ingestion queue with retries
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                        Root-child relationships for long docs
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-emerald-500/40 hover:bg-slate-900/40">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-start justify-between mb-7">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Performance</span>
                                </div>
                                <h3 className="relative text-lg font-semibold text-white mb-3">Cold-start free retrieval</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-6">
                                    SQLite vector search with RAM caching gives you sub-40ms responses without managing infra.
                                </p>
                                <ul className="relative space-y-2 text-xs text-gray-500">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        Deterministic startup with seeded sectors
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        Vector quantization for fast recall
                                    </li>
                                </ul>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-amber-500/40 hover:bg-slate-900/40">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-start justify-between mb-7">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Providers</span>
                                </div>
                                <h3 className="relative text-lg font-semibold text-white mb-3">Modular embedding engines</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-6">
                                    Swap between OpenAI, Gemini, Voyage, or local models without rewriting your pipeline.
                                </p>
                                <ul className="relative space-y-2 text-xs text-gray-500">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Advanced vs basic embedding strategies
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Provider fallbacks with health checks
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative py-24 px-6 sm:px-8 lg:px-10">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    <div className="max-w-6xl mx-auto relative">
                        <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-950/25 px-8 sm:px-12 py-12 sm:py-16">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_70%)] opacity-80"></div>
                            <div className="relative grid lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/40 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                                        Pipeline
                                    </div>
                                    <h3 className="text-3xl font-semibold text-white leading-tight">
                                        A calm workflow from ingestion to meaningful recall
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Everything is designed so that product teams can deploy rich agent memories without wrangling infrastructure or custom tooling.
                                    </p>
                                </div>

                                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                                    <div className="relative rounded-2xl border border-slate-700/35 bg-slate-950/30 p-6">
                                        <div className="absolute left-6 top-0 -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-500/20 text-[10px] uppercase tracking-[0.25em] text-indigo-200">Step 01</div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Capture</h4>
                                        <p className="text-sm text-gray-500 mb-4">Stream documents, conversations, telemetry, and events into OpenMemory via a single REST surface.</p>
                                        <ul className="space-y-2 text-xs text-gray-500">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                                Auto-detects modality and optimum chunking
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                                Metadata preserved for routing
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="relative rounded-2xl border border-slate-700/35 bg-slate-950/30 p-6">
                                        <div className="absolute left-6 top-0 -translate-y-1/2 px-3 py-1 rounded-full bg-violet-500/20 text-[10px] uppercase tracking-[0.25em] text-violet-200">Step 02</div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Compose</h4>
                                        <p className="text-sm text-gray-500 mb-4">Embeddings route into five sectors, re-weighted by the reinforcement engine and waypoint graph.</p>
                                        <ul className="space-y-2 text-xs text-gray-500">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                                Sector heuristics + custom scoring functions
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                                Decay curves tuned per memory type
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="relative rounded-2xl border border-slate-700/35 bg-slate-950/30 p-6 sm:col-span-2">
                                        <div className="absolute left-6 top-0 -translate-y-1/2 px-3 py-1 rounded-full bg-emerald-500/20 text-[10px] uppercase tracking-[0.25em] text-emerald-200">Step 03</div>
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-white mb-2">Recall</h4>
                                                <p className="text-sm text-gray-500 mb-4">Query memories with hybrid semantic + graph lookups that surface the right context for every agent decision.</p>
                                                <ul className="space-y-2 text-xs text-gray-500">
                                                    <li className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        Deterministic ranking with attribution trails
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        Streaming mode for multi-turn conversations
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="flex flex-col gap-4 min-w-[190px]">
                                                <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-4 text-sm text-white/80">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-1">Median latency</p>
                                                    <p className="text-2xl font-semibold text-white">36ms</p>
                                                </div>
                                                <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-4 text-sm text-white/80">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-1">Context depth</p>
                                                    <p className="text-2xl font-semibold text-white">5 hops</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative py-24 px-6 sm:px-8 lg:px-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-semibold text-indigo-400 mb-4">
                                Use Cases
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                                Built for Real Applications
                            </h2>
                            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                                From chatbots to autonomous agents, power your AI with long-term memory
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-sky-500/40 hover:bg-slate-950/50">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-sky-500/20 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-center justify-between mb-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 13h4m-4 4h6a4 4 0 004-4V7a4 4 0 00-4-4H8a4 4 0 00-4 4v6a4 4 0 004 4z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Conversational</span>
                                </div>
                                <h3 className="relative text-xl font-semibold text-white mb-3">Conversational AI</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-5">
                                    Equip chat products with persistent preferences, tone awareness, and long-tail recollection so they sound brilliantly personal.
                                </p>
                                <div className="relative flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-xs font-medium text-sky-200">Context windows</span>
                                    <span className="px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-xs font-medium text-sky-200">Sentiment memory</span>
                                    <span className="px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-xs font-medium text-sky-200">Session stitching</span>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-fuchsia-500/40 hover:bg-slate-950/50">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-fuchsia-500/20 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-center justify-between mb-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Assistants</span>
                                </div>
                                <h3 className="relative text-xl font-semibold text-white mb-3">Personal assistants</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-5">
                                    Launch companion agents that accumulate rituals, goals, and collaborative context while staying effortlessly organized.
                                </p>
                                <div className="relative flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-xs font-medium text-fuchsia-200">Habit graphs</span>
                                    <span className="px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-xs font-medium text-fuchsia-200">Task recall</span>
                                    <span className="px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-xs font-medium text-fuchsia-200">Adaptive prompts</span>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-emerald-500/40 hover:bg-slate-950/50">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-center justify-between mb-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6l-2 4h4l-2 4" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l-6 16z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Knowledge</span>
                                </div>
                                <h3 className="relative text-xl font-semibold text-white mb-3">Knowledge management</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-5">
                                    Convert knowledge bases into living graphs the moment documents land, unlocking razor-sharp semantic discovery.
                                </p>
                                <div className="relative flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-200">Document sync</span>
                                    <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-200">Waypoint graphs</span>
                                    <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-200">Semantic search</span>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-8 transition-all duration-500 hover:border-amber-500/40 hover:bg-slate-950/50">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent transition-opacity duration-500"></div>
                                <div className="relative flex items-center justify-between mb-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v4m0 6v4m-7-7h4m6 0h4" />
                                            <circle cx="12" cy="12" r="7" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Autonomy</span>
                                </div>
                                <h3 className="relative text-xl font-semibold text-white mb-3">Autonomous agents</h3>
                                <p className="relative text-sm text-gray-400 leading-relaxed mb-5">
                                    Give mission-critical agents durable context for planning, tool choice, and retrospective learning.
                                </p>
                                <div className="relative flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-200">Workflow memory</span>
                                    <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-200">Tool outcomes</span>
                                    <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-200">Adaptive loops</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative py-24 px-6 sm:px-8 lg:px-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-[#091125]/95 via-[#070d1c]/95 to-[#111b32]/90 px-10 sm:px-14 py-14">
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_70%)] opacity-80"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.16),_transparent_70%)] opacity-70"></div>
                                <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[conic-gradient(from_120deg,_rgba(139,92,246,0.2),_transparent_65%)] blur-3xl opacity-60"></div>
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
                                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            </div>

                            <div className="relative grid lg:grid-cols-[1.7fr_1fr] gap-12 items-center">
                                <div className="space-y-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-600/30 bg-indigo-950/30 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                                        Launch ready
                                    </div>
                                    <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
                                        Ready to get the memory stack your agents deserve?
                                    </h2>
                                    <p className="text-base sm:text-lg text-gray-400/90 leading-relaxed max-w-2xl">
                                        Deploy OpenMemory with a hardened decay engine, multi-sector embeddings, and production-grade retrieval in just a few minutes.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">Instant deployment</p>
                                                <p className="text-xs text-gray-500 leading-relaxed">Spin up the memory graph with one command and start reinforcing context immediately.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
                                                    <circle cx="12" cy="12" r="9" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">Always-on retention</p>
                                                <p className="text-xs text-gray-500 leading-relaxed">Decay audits, reinforcement pulses, and attribution trails are baked in from day one.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                        <Link
                                            href="/docs/quick-start"
                                            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-lg rounded-xl transition-all shadow-[0_25px_60px_-30px_rgba(99,102,241,0.7)]"
                                        >
                                            Deploy in minutes
                                            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                        <a
                                            href="https://github.com/nullure/openmemory"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/30 hover:border-indigo-400/40 text-white font-semibold text-lg rounded-xl transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                            </svg>
                                            GitHub repo
                                        </a>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-br from-indigo-500/35 via-transparent to-transparent blur-xl opacity-70"></div>
                                    <div className="relative rounded-[24px] border border-indigo-400/25 bg-white/[0.04] backdrop-blur-xl p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Launch kit</p>
                                                <p className="text-2xl font-semibold text-white">90s setup</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-200">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-4 text-sm text-gray-400">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400/80">CLI bootstrap</span>
                                                <span className="text-emerald-300 font-semibold">ready</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400/80">Decay engine audit</span>
                                                <span className="text-amber-300 font-semibold">auto</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400/80">Agent bindings</span>
                                                <span className="text-sky-300 font-semibold">Next, Python</span>
                                            </div>
                                        </div>
                                        <div className="relative h-24 rounded-2xl border border-slate-700/35 bg-black/30 overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(79,70,229,0.18),_transparent_70%)]"></div>
                                            <div className="absolute inset-x-6 bottom-6"> 
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span className="flex items-center gap-2">
                                                        <span className="inline-flex w-5 h-[3px] rounded-full bg-indigo-400"></span>
                                                        Decay curve
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <span className="inline-flex w-2 h-2 rounded-full bg-emerald-300"></span>
                                                        Reinforce pulse
                                                    </span>
                                                </div>
                                            </div>
                                            <svg className="absolute inset-6" viewBox="0 0 180 80" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="ctaGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0" stopColor="rgba(99,102,241,0.45)" />
                                                        <stop offset="1" stopColor="rgba(99,102,241,0)" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M10 65 C 40 50, 62 30, 88 28 C 116 26, 136 46, 162 38" stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                                <path d="M88 46 C 104 18, 130 14, 158 28" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />
                                                <path d="M10 65 C 40 50, 62 30, 88 28 C 116 26, 136 46, 162 38 L 162 70 L 10 70 Z" fill="url(#ctaGradient)" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="relative py-16 px-6 sm:px-8 lg:px-10 border-t border-slate-800/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl blur opacity-40"></div>
                                        <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-xl font-semibold text-white">OpenMemory</span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Production-ready long-term memory for AI agents with HMD v2 specification.
                                </p>
                                <div className="flex gap-3">
                                    <a href="https://github.com/nullure/openmemory" className="w-9 h-9 bg-slate-900/50 hover:bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/60 rounded-lg flex items-center justify-center transition-all">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm text-white mb-4">Documentation</h4>
                                <ul className="space-y-2.5">
                                    <li><Link href="/docs/introduction" className="text-sm text-gray-500 hover:text-white transition-colors">Introduction</Link></li>
                                    <li><Link href="/docs/quick-start" className="text-sm text-gray-500 hover:text-white transition-colors">Quick Start</Link></li>
                                    <li><Link href="/docs/api/ingestion" className="text-sm text-gray-500 hover:text-white transition-colors">API Reference</Link></li>
                                    <li><Link href="/docs/advanced/embedding-modes" className="text-sm text-gray-500 hover:text-white transition-colors">Advanced</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm text-white mb-4">Resources</h4>
                                <ul className="space-y-2.5">
                                    <li><a href="https://github.com/nullure/openmemory" className="text-sm text-gray-500 hover:text-white transition-colors">GitHub</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/issues" className="text-sm text-gray-500 hover:text-white transition-colors">Issues</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/discussions" className="text-sm text-gray-500 hover:text-white transition-colors">Discussions</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/blob/main/LICENSE" className="text-sm text-gray-500 hover:text-white transition-colors">License</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm text-white mb-4">Community</h4>
                                <ul className="space-y-2.5">
                                    <li><a href="https://github.com/nullure/openmemory/stargazers" className="text-sm text-gray-500 hover:text-white transition-colors">Star on GitHub</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/fork" className="text-sm text-gray-500 hover:text-white transition-colors">Fork</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/contributors" className="text-sm text-gray-500 hover:text-white transition-colors">Contributors</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-slate-800/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-500">
                                © 2025 OpenMemory · MIT License
                            </p>
                            <div className="flex items-center gap-6 text-xs text-gray-600">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Secure
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Fast
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Open Source
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            </div>
        </>
    )
}
