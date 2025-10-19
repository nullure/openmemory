import Head from 'next/head'
import Link from 'next/link'
import CodeBlock from '../components/code'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const decayData = [
    { time: 0, retention: 95, reinforcement: null, label: 'Start' },
    { time: 1, retention: 88, reinforcement: null, label: '' },
    { time: 2, retention: 78, reinforcement: null, label: '' },
    { time: 3, retention: 65, reinforcement: null, label: '' },
    { time: 4, retention: 58, reinforcement: 85, label: 'Pulse 1' },
    { time: 5, retention: 80, reinforcement: null, label: '' },
    { time: 6, retention: 72, reinforcement: null, label: '' },
    { time: 7, retention: 62, reinforcement: 88, label: 'Pulse 2' },
    { time: 8, retention: 84, reinforcement: null, label: '' },
    { time: 9, retention: 76, reinforcement: null, label: '' },
    { time: 10, retention: 68, reinforcement: null, label: '' },
    { time: 11, retention: 58, reinforcement: null, label: '' },
    { time: 12, retention: 48, reinforcement: null, label: 'End' },
]

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-lg px-3 py-2 shadow-xl">
                <p className="text-white text-sm font-medium">Strength: {payload[0].value}%</p>
                {payload[0].payload.reinforcement && (
                    <p className="text-emerald-400 text-xs">Reinforcement pulse</p>
                )}
            </div>
        )
    }
    return null
}

export default function Home() {
    const [activeTab, setActiveTab] = useState<'python' | 'javascript'>('python')

    return (
        <>
            <Head>
                <title>OpenMemory - Long-term Memory for AI Agents</title>
                <meta name="description" content="Production-ready long-term memory system for AI agents. Multi-sector embeddings, intelligent decay, and graph-based knowledge retrieval." />
            </Head>

            <div className="relative min-h-screen bg-black text-gray-100 overflow-hidden">

                <div className="relative z-10">
                    {/* Floating Centered Navigation */}
                    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-6">
                        <nav className="relative backdrop-blur-2xl bg-slate-950/60 border border-slate-700/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            <div className="flex items-center justify-between px-6 py-4">
                                {/* Logo */}
                                <Link href="/" className="flex items-center gap-3 group">
                                    <span className="text-lg font-bold bg-white bg-clip-text text-transparent">OpenMemory</span>
                                </Link>

                                {/* Center Navigation Links */}
                                <div className="hidden lg:flex items-center gap-2">
                                    <a href="#comparison" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group">
                                        Comparison
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-indigo-400 group-hover:w-full transition-all duration-300"></span>
                                    </a>
                                    <a href="#features" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group">
                                        Features
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-400 group-hover:w-full transition-all duration-300"></span>
                                    </a>
                                    <a href="#how-it-works" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group">
                                        Architecture
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                                    </a>
                                    <a href="#examples" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group">
                                        Examples
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-fuchsia-400 group-hover:w-full transition-all duration-300"></span>
                                    </a>
                                    <Link href="/docs/introduction" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group">
                                        Docs
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-fuchsia-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                </div>

                                {/* GitHub Button */}
                                <a
                                    href="https://github.com/nullure/openmemory"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    GitHub
                                </a>
                            </div>
                        </nav>
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

                    {/* Comparison Section - Competitor + Performance */}
                    <section className="relative py-24 px-6 sm:px-8 lg:px-10" id="comparison">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16">
                                <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-semibold text-emerald-400 mb-4">
                                    Why OpenMemory
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                                    2-3× Faster, 6-10× Cheaper
                                </h2>
                                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                                    OpenMemory delivers superior contextual recall at a fraction of the cost of hosted memory APIs
                                </p>
                            </div>

                            {/* Performance Metrics Grid */}
                            <div className="grid md:grid-cols-5 gap-6 mb-16">
                                <div className="relative group overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-6 transition-all duration-500 hover:border-emerald-500/40">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-2">Query Latency</p>
                                        <p className="text-4xl font-bold text-white mb-1">110ms</p>
                                        <p className="text-xs text-gray-500">vs 350ms (SaaS)</p>
                                        <div className="mt-4 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full w-[31%] bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-6 transition-all duration-500 hover:border-cyan-500/40">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-2">Scalability</p>
                                        <p className="text-4xl font-bold text-white mb-1">∞</p>
                                        <p className="text-xs text-gray-500">Horizontal sharding</p>
                                        <div className="mt-4 flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-6 transition-all duration-500 hover:border-violet-500/40">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <p className="text-xs uppercase tracking-[0.3em] text-violet-400/60 mb-2">Cost / 1M Tokens</p>
                                        <p className="text-4xl font-bold text-white mb-1">$0.35</p>
                                        <p className="text-xs text-gray-500">vs $2.50+ (SaaS)</p>
                                        <div className="mt-4 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full w-[14%] bg-gradient-to-r from-violet-500 to-violet-400"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-6 transition-all duration-500 hover:border-blue-500/40">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <p className="text-xs uppercase tracking-[0.3em] text-blue-400/60 mb-2">Throughput</p>
                                        <p className="text-4xl font-bold text-white mb-1">40 ops/s</p>
                                        <p className="text-xs text-gray-500">vs 10 ops/s (SaaS)</p>
                                        <div className="mt-4 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full w-[80%] bg-gradient-to-r from-blue-500 to-blue-400"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group overflow-hidden rounded-3xl border border-slate-700/35 bg-slate-950/30 p-6 transition-all duration-500 hover:border-amber-500/40">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <p className="text-xs uppercase tracking-[0.3em] text-amber-400/60 mb-2">Monthly Cost</p>
                                        <p className="text-4xl font-bold text-white mb-1">$6</p>
                                        <p className="text-xs text-gray-500">vs $90+ (SaaS)</p>
                                        <div className="mt-4 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full w-[7%] bg-gradient-to-r from-amber-500 to-amber-400"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Table */}
                            <div className="relative overflow-hidden rounded-3xl border border-slate-700/30 bg-black">
                                <div className="relative overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-slate-700/50 bg-stone-950/30">
                                                <th className="text-left p-5 font-bold text-white uppercase tracking-wider text-xs">Feature</th>
                                                <th className="text-center p-5 font-bold text-emerald-400 uppercase tracking-wider text-xs">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span>OpenMemory</span>
                                                        <div className="w-12 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="text-center p-5 font-medium text-gray-400 uppercase tracking-wider text-xs">Supermemory</th>
                                                <th className="text-center p-5 font-medium text-gray-400 uppercase tracking-wider text-xs">Mem0</th>
                                                <th className="text-center p-5 font-medium text-gray-400 uppercase tracking-wider text-xs">Vector DBs</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-300">
                                            {/* PRICING & COST SECTION */}
                                            <tr className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 text-white font-medium">Expected Monthly Cost (100k)</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="text-emerald-400 font-bold text-lg">$5-8</span>
                                                </td>
                                                <td className="p-5 text-center text-gray-500">$60-120</td>
                                                <td className="p-5 text-center text-gray-500">$25-40</td>
                                                <td className="p-5 text-center text-gray-500">$15-40</td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors bg-slate-900/20">
                                                <td className="p-5 text-white font-medium">Hosted Embedding Cost</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="text-emerald-400 font-bold text-lg">$0.35/1M</span>
                                                </td>
                                                <td className="p-5 text-center text-gray-500">$2.50+/1M</td>
                                                <td className="p-5 text-center text-gray-500">$1.20/1M</td>
                                                <td className="p-5 text-center text-gray-500">User-managed</td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 text-white font-medium">Storage Cost (1M memories)</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="text-emerald-400 font-bold text-lg">~$3/mo</span>
                                                </td>
                                                <td className="p-5 text-center text-gray-500">~$60+</td>
                                                <td className="p-5 text-center text-gray-500">~$20</td>
                                                <td className="p-5 text-center text-gray-500">~$10-25</td>
                                            </tr>

                                            {/* PERFORMANCE SECTION */}
                                            <tr className="hover:bg-slate-900/30 transition-colors bg-slate-900/20">
                                                <td className="p-5 text-white font-medium">Avg Response (100k nodes)</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="text-emerald-400 font-bold text-lg">110ms</span>
                                                </td>
                                                <td className="p-5 text-center text-gray-500">350ms</td>
                                                <td className="p-5 text-center text-gray-500">250ms</td>
                                                <td className="p-5 text-center text-gray-500">160ms</td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 text-white font-medium">CPU Usage</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="text-emerald-400 font-semibold">Moderate</span>
                                                </td>
                                                <td className="p-5 text-center text-gray-500">Serverless billed</td>
                                                <td className="p-5 text-center text-gray-500">Moderate</td>
                                                <td className="p-5 text-center text-gray-500">High</td>
                                            </tr>

                                            {/* ARCHITECTURE & FEATURES */}
                                            <tr className="hover:bg-slate-900/30 transition-colors bg-slate-900/20">
                                                <td className="p-5 text-white font-medium">Architecture</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/40 rounded-lg text-emerald-300 font-semibold text-xs">
                                                        HMD v2
                                                    </span>
                                                </td>
                                                <td className="p-5 text-center text-gray-500 text-xs">Flat embeddings</td>
                                                <td className="p-5 text-center text-gray-500 text-xs">JSON memory</td>
                                                <td className="p-5 text-center text-gray-500 text-xs">Vector index</td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 text-white font-medium">Retrieval Depth</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-violet-500/20 to-purple-600/20 border border-violet-500/40 rounded-lg text-violet-300 font-semibold text-xs">
                                                        Multi-hop
                                                    </span>
                                                </td>
                                                <td className="p-5 text-center text-gray-500 text-xs">Single embedding</td>
                                                <td className="p-5 text-center text-gray-500 text-xs">Single embedding</td>
                                                <td className="p-5 text-center text-gray-500 text-xs">Single embedding</td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors bg-slate-900/20">
                                                <td className="p-5 text-white font-medium">Ingestion</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-emerald-400 text-2xl font-bold">✓</span>
                                                        <span className="text-xs text-emerald-400/70">Multi-format</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 text-white font-medium">Explainable Paths</td>
                                                <td className="p-5 text-center bg-emerald-500/5"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                            </tr>

                                            {/* DEPLOYMENT & OWNERSHIP */}
                                            <tr className="hover:bg-slate-900/30 transition-colors bg-slate-900/20">
                                                <td className="p-5 text-white font-medium">Open Source</td>
                                                <td className="p-5 text-center bg-emerald-500/5"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                                <td className="p-5 text-center"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                                <td className="p-5 text-center"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 text-white font-medium">Self-Hosted</td>
                                                <td className="p-5 text-center bg-emerald-500/5"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                                <td className="p-5 text-center"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                                <td className="p-5 text-center"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors bg-slate-900/20">
                                                <td className="p-5 text-white font-medium">Local Embeddings</td>
                                                <td className="p-5 text-center bg-emerald-500/5"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                                <td className="p-5 text-center"><span className="text-red-400/80 text-2xl">✗</span></td>
                                                <td className="p-5 text-center"><span className="text-amber-400 text-xl">◐</span></td>
                                                <td className="p-5 text-center"><span className="text-emerald-400 text-2xl font-bold">✓</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-5 text-white font-medium">Data Ownership</td>
                                                <td className="p-5 text-center bg-emerald-500/5">
                                                    <span className="text-emerald-400 font-bold text-lg">100%</span>
                                                </td>
                                                <td className="p-5 text-center text-red-400/80 text-sm">Vendor</td>
                                                <td className="p-5 text-center text-emerald-400 font-semibold">100%</td>
                                                <td className="p-5 text-center text-emerald-400 font-semibold">100%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Decay Engine Section */}
                    <section className="relative py-24 px-6 sm:px-8 lg:px-10">
                        <div className="max-w-6xl mx-auto">
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

                                            <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/40 text-[11px] text-white/70 uppercase tracking-[0.28em]">Strength</div>
                                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/40 text-[11px] text-white/70 uppercase tracking-[0.28em]">Timeline</div>

                                            <div className="relative h-[180px] mt-8">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={decayData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                                                        <defs>
                                                            <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                                                            </linearGradient>
                                                            <linearGradient id="reinforcementGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                                                                <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid
                                                            strokeDasharray="6 6"
                                                            stroke="rgba(148,163,184,0.12)"
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="time"
                                                            stroke="rgba(148,163,184,0.3)"
                                                            tick={{ fill: 'rgba(226,232,240,0.45)', fontSize: 10 }}
                                                            tickLine={false}
                                                            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                                                        />
                                                        <YAxis
                                                            stroke="rgba(148,163,184,0.3)"
                                                            tick={{ fill: 'rgba(226,232,240,0.45)', fontSize: 10 }}
                                                            tickLine={false}
                                                            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                                                            domain={[0, 100]}
                                                            ticks={[0, 25, 50, 75, 100]}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <ReferenceLine
                                                            y={50}
                                                            stroke="#fbbf24"
                                                            strokeDasharray="4 4"
                                                            strokeWidth={1.5}
                                                            label={{
                                                                value: 'Threshold',
                                                                fill: 'rgba(251,191,36,0.8)',
                                                                fontSize: 10,
                                                                position: 'right'
                                                            }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="retention"
                                                            stroke="#6366f1"
                                                            strokeWidth={2.5}
                                                            fill="url(#decayGradient)"
                                                            animationDuration={1500}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="reinforcement"
                                                            stroke="#34d399"
                                                            strokeWidth={2.5}
                                                            fill="url(#reinforcementGradient)"
                                                            animationDuration={1500}
                                                            dot={{ fill: '#34d399', r: 4, strokeWidth: 0 }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="absolute inset-x-6 bottom-4 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
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

                    {/* System Architecture - Deep Dive */}
                    <section className="relative py-24 px-6 sm:px-8 lg:px-10" id="how-it-works">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16">
                                <div className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm font-semibold text-purple-400 mb-4">
                                    System Architecture
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                                    Hierarchical Memory Decomposition
                                </h2>
                                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                                    Multi-sector embeddings with single-waypoint linking for biologically-inspired memory retrieval
                                </p>
                            </div>

                            {/* Detailed Architecture Diagram */}
                            <div className="relative rounded-3xl border border-slate-700/30 bg-gradient-to-br from-slate-950/80 via-slate-950/60 to-slate-900/80 overflow-hidden mb-16 p-8">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.08),_transparent_70%)]"></div>
                                <div className="absolute inset-px rounded-[26px] border border-slate-800/30"></div>

                                <div className="relative space-y-12">
                                    {/* Layer 1: Input */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-300">Layer 1</div>
                                            <h3 className="text-sm font-semibold text-white/90">Input & Ingestion</h3>
                                        </div>
                                        <div className="grid grid-cols-5 gap-3">
                                            {['Documents', 'Conversations', 'Events', 'Audio', 'Web Pages'].map((item, i) => (
                                                <div key={i} className="relative group">
                                                    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-center transition-all hover:border-blue-400/50 hover:bg-blue-500/10">
                                                        <p className="text-sm text-blue-300 font-medium">{item}</p>
                                                    </div>
                                                    <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-gradient-to-b from-blue-400/60 to-transparent"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Layer 2: Processing */}
                                    <div className="mt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-xs font-semibold text-violet-300">Layer 2</div>
                                            <h3 className="text-sm font-semibold text-white/90">Text Processing Pipeline</h3>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[
                                                { label: 'Parse & Clean', desc: 'Extract text, remove noise' },
                                                { label: 'Chunk', desc: 'Semantic segmentation' },
                                                { label: 'Classify Sector', desc: 'ML-based routing' },
                                                { label: 'Generate Embeddings', desc: '5-sector vectors' }
                                            ].map((item, i) => (
                                                <div key={i} className="relative">
                                                    <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 hover:border-violet-400/50 hover:bg-violet-500/10 transition-all">
                                                        <p className="text-sm text-violet-300 font-medium mb-1">{item.label}</p>
                                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                                    </div>
                                                    {i < 3 && (
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-violet-400/60">→</div>
                                                    )}
                                                    {i === 3 && (
                                                        <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-gradient-to-b from-violet-400/60 to-transparent"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Layer 3: Storage */}
                                    <div className="mt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-300">Layer 3</div>
                                            <h3 className="text-sm font-semibold text-white/90">Multi-Sector Memory Storage</h3>
                                        </div>
                                        <div className="grid grid-cols-5 gap-3 mb-6">
                                            {[
                                                { name: 'Episodic', desc: 'Events & experiences' },
                                                { name: 'Semantic', desc: 'Facts & concepts' },
                                                { name: 'Procedural', desc: 'Skills & patterns' },
                                                { name: 'Emotional', desc: 'Sentiment arcs' },
                                                { name: 'Reflective', desc: 'Meta-cognition' }
                                            ].map((sector, i) => (
                                                <div key={i} className="relative">
                                                    <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 text-center hover:border-purple-400/50 hover:bg-purple-500/10 transition-all">
                                                        <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                                                            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                                                        </div>
                                                        <p className="text-sm text-purple-300 font-medium mb-1">{sector.name}</p>
                                                        <p className="text-xs text-gray-500">{sector.desc}</p>
                                                    </div>
                                                    <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-gradient-to-b from-purple-400/60 to-transparent"></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 hover:border-teal-400/50 hover:bg-teal-500/10 transition-all">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-teal-300 font-medium">Vector Store (SQLite)</p>
                                                </div>
                                                <p className="text-xs text-gray-500">768-dim embeddings per sector with quantization</p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-cyan-300 font-medium">Waypoint Graph</p>
                                                </div>
                                                <p className="text-xs text-gray-500">Single-waypoint associations with weight decay</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Layer 4: Retrieval */}
                                    <div className="mt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300">Layer 4</div>
                                            <h3 className="text-sm font-semibold text-white/90">Composite Retrieval Engine</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all">
                                                <p className="text-sm text-emerald-300 font-medium mb-2">Sector Fusion</p>
                                                <p className="text-xs text-gray-500 mb-3">Query against 2-3 likely sectors simultaneously</p>
                                                <div className="text-xs font-mono text-emerald-400/80">cosine_similarity()</div>
                                            </div>
                                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all">
                                                <p className="text-sm text-emerald-300 font-medium mb-2">Activation Spread</p>
                                                <p className="text-xs text-gray-500 mb-3">1-hop waypoint graph traversal for context</p>
                                                <div className="text-xs font-mono text-emerald-400/80">graph.expand(depth=1)</div>
                                            </div>
                                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all">
                                                <p className="text-sm text-emerald-300 font-medium mb-2">Composite Ranking</p>
                                                <p className="text-xs text-gray-500 mb-3">Weighted scoring with decay factors</p>
                                                <div className="text-xs font-mono text-emerald-400/80">0.6×sim + 0.2×sal + 0.1×rec</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Layer 5: Output */}
                                    <div className="mt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-300">Layer 5</div>
                                            <h3 className="text-sm font-semibold text-white/90">Response & Background Jobs</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center hover:border-amber-400/50 hover:bg-amber-500/10 transition-all">
                                                <p className="text-sm text-amber-300 font-medium">Ranked Results</p>
                                                <p className="text-xs text-gray-500 mt-1">JSON with attribution paths</p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 text-center hover:border-orange-400/50 hover:bg-orange-500/10 transition-all">
                                                <p className="text-sm text-orange-300 font-medium">Decay Scheduler</p>
                                                <p className="text-xs text-gray-500 mt-1">Runs every 12h via cron</p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-center hover:border-red-400/50 hover:bg-red-500/10 transition-all">
                                                <p className="text-sm text-red-300 font-medium">Reinforcement</p>
                                                <p className="text-xs text-gray-500 mt-1">Auto-boost on access</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technology Stack */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl border border-slate-700/35 bg-slate-950/40">
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        Backend Stack
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                            TypeScript + Node.js 20+
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                            Fubelt REST API
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                            Node-cron scheduler
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-6 rounded-2xl border border-slate-700/35 bg-slate-950/40">
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                        </svg>
                                        Storage Layer
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                            SQLite 3.40+ (WAL mode)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                            Vector quantization
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                            In-process graph logic
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-6 rounded-2xl border border-slate-700/35 bg-slate-950/40">
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Embedding Engines
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            OpenAI / Gemini
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Ollama (E5, BGE local)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Modular provider system
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

                    {/* Example Code Section */}
                    <section className="relative py-24 px-6 sm:px-8 lg:px-10" id="examples">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16">
                                <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-semibold text-indigo-400 mb-4">
                                    Quick Start
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                                    Get Started in Minutes
                                </h2>
                                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                                    Simple, intuitive API that gets you from zero to production-ready memory in just a few lines of code
                                </p>
                            </div>
                        </div>

                        <div className="max-w-5xl mx-auto bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Code Content */}
                            <div className="bg-black/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 bg-gray-900/50 border-b border-gray-800">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">example.js</span>
                                </div>
                                <CodeBlock language='javascript' value={`// Add a memory with automatic multi-sector embedding
await fetch('http://localhost:3000/memory/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'User prefers dark mode and minimal UI design',
    metadata: { source: 'preferences', category: 'UI' }
  })
});

// Query memories with decay-weighted relevance scoring
const response = await fetch('http://localhost:3000/memory/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What are user interface preferences?',
    topK: 5
  })
});

const { results } = await response.json();
// Results include memories with decay scores and sector breakdowns`} />
                            </div>
                        </div>
                    </section>

                    <section className="relative py-24 px-6 sm:px-8 lg:px-10">
                        <div className="max-w-6xl mx-auto">
                            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 px-10 sm:px-14 py-14">
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
                </div >
            </div >
        </>
    )
}
