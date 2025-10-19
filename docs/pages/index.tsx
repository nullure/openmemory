import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
    return (
        <>
            <Head>
                <title>OpenMemory - Long-term Memory System for AI Agents</title>
                <meta name="description" content="A production-ready long-term memory system for AI agents using HMD v2 specification with multi-sector embeddings and graph-based waypoints." />
            </Head>

            <div className="min-h-screen bg-black text-white overflow-x-hidden">
                {/* Animated Background Patches */}
                <div className="bg-patches">
                    <div className="patch patch-1"></div>
                    <div className="patch patch-2"></div>
                    <div className="patch patch-3"></div>
                    <div className="patch patch-4"></div>
                    <div className="patch patch-5"></div>
                </div>
                {/* Header */}
                <header className="fixed top-0 w-full navbar-blur z-50 border-b border-gray-800/30">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-lg">OM</span>
                                </div>
                                <span className="text-2xl font-black gradient-text-purple">OpenMemory</span>
                            </div>

                            <nav className="hidden lg:flex items-center space-x-8">
                                <a href="#features" className="text-gray-300 hover:text-purple-400 transition-all duration-300">
                                    Features
                                </a>
                                <a href="#architecture" className="text-gray-300 hover:text-blue-400 transition-all duration-300">
                                    Architecture
                                </a>
                                <a href="#use-cases" className="text-gray-300 hover:text-cyan-400 transition-all duration-300">
                                    Use Cases
                                </a>
                                <Link href="/docs/introduction" className="text-gray-300 hover:text-emerald-400 transition-all duration-300">
                                    Docs
                                </Link>
                                <a
                                    href="https://github.com/nullure/openmemory"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all duration-300"
                                >
                                    GitHub
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center pt-20">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="text-center space-y-8">
                            <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm mb-4">
                                <span className="text-sm font-bold gradient-text-blue">
                                    🧠 HMD v2 Specification • Production Ready
                                </span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black leading-tight">
                                <span className="block text-white">Long-term Memory</span>
                                <span className="gradient-text-purple">for AI Agents</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
                                Multi-sector embeddings, decay algorithms, and graph-based waypoints in a production-ready memory system
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
                                <Link
                                    href="/docs/quick-start"
                                    className="px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                                >
                                    🚀 Get Started
                                </Link>
                                <Link
                                    href="/docs/introduction"
                                    className="px-12 py-5 border-2 border-purple-400 text-purple-400 font-bold text-lg rounded-full hover:bg-purple-400 hover:text-black transition-all duration-300"
                                >
                                    📚 Documentation
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-12">
                                <div className="glass-card p-8 rounded-3xl text-center">
                                    <div className="text-4xl font-black gradient-text-purple mb-2">5</div>
                                    <div className="text-sm text-gray-400 font-medium">Memory Sectors</div>
                                </div>
                                <div className="glass-card p-8 rounded-3xl text-center">
                                    <div className="text-4xl font-black gradient-text-blue mb-2">∞</div>
                                    <div className="text-sm text-gray-400 font-medium">Scalable Storage</div>
                                </div>
                                <div className="glass-card p-8 rounded-3xl text-center">
                                    <div className="text-4xl font-black gradient-text-purple mb-2">100%</div>
                                    <div className="text-sm text-gray-400 font-medium">Open Source</div>
                                </div>
                                <div className="glass-card p-8 rounded-3xl text-center">
                                    <div className="text-4xl font-black gradient-text-blue mb-2">API</div>
                                    <div className="text-sm text-gray-400 font-medium">REST Interface</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative py-32" id="features">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl md:text-6xl font-black mb-6">
                                Powerful <span className="gradient-text-purple">Features</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                Production-ready memory management with cutting-edge AI capabilities
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all duration-500">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                                    <span className="text-3xl">🧠</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 gradient-text-purple">Multi-Sector Memory</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    5-sector HMD v2 specification: factual, emotional, temporal, relational, and behavioral dimensions for comprehensive AI memory
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all duration-500">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                                    <span className="text-3xl">⚡</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 gradient-text-blue">Decay Algorithm</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Natural memory decay with reinforcement. Important memories strengthen over time, irrelevant ones fade naturally
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all duration-500">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                                    <span className="text-3xl">🕸️</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 gradient-text-purple">Graph Waypoints</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Bidirectional connections create knowledge graphs. Context-aware retrieval through memory relationships
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all duration-500">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                                    <span className="text-3xl">📄</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 gradient-text-blue">Multimodal Ingestion</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Process PDFs, DOCX, HTML, and URLs. Root-child strategies for large documents with smart chunking
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all duration-500">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                                    <span className="text-3xl">🎯</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 gradient-text-purple">Flexible Providers</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    OpenAI, Gemini, Voyage AI support. Simple or Advanced embedding modes for any use case
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all duration-500">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                                    <span className="text-3xl">⚙️</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 gradient-text-blue">SQLite Backend</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Lightning-fast vector similarity with better-sqlite3. Efficient decay calculations built-in
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Architecture Section */}
                <section className="relative py-32" id="architecture">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl md:text-6xl font-black mb-6">
                                System <span className="gradient-text-blue">Architecture</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                Built on HMD v2 specification with production-grade components
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                            {/* Architecture Diagram */}
                            <div className="glass-card p-12 rounded-3xl">
                                <div className="space-y-8">
                                    {/* Layer 1 */}
                                    <div className="relative">
                                        <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-500/50 rounded-2xl p-6 text-center">
                                            <div className="text-4xl mb-3">🌐</div>
                                            <h4 className="font-bold text-xl mb-2">REST API Layer</h4>
                                            <p className="text-sm text-gray-400">Express.js endpoints</p>
                                        </div>
                                        <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2">
                                            <div className="text-3xl text-purple-500">↓</div>
                                        </div>
                                    </div>

                                    {/* Layer 2 */}
                                    <div className="relative pt-6">
                                        <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-2 border-blue-500/50 rounded-2xl p-6 text-center">
                                            <div className="text-4xl mb-3">🧠</div>
                                            <h4 className="font-bold text-xl mb-2">Memory Engine</h4>
                                            <p className="text-sm text-gray-400">5-sector embeddings + decay</p>
                                        </div>
                                        <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2">
                                            <div className="text-3xl text-blue-500">↓</div>
                                        </div>
                                    </div>

                                    {/* Layer 3 */}
                                    <div className="relative pt-6">
                                        <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-2 border-emerald-500/50 rounded-2xl p-6 text-center">
                                            <div className="text-4xl mb-3">💾</div>
                                            <h4 className="font-bold text-xl mb-2">SQLite Storage</h4>
                                            <p className="text-sm text-gray-400">Vector search + graph waypoints</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Architecture Details */}
                            <div className="space-y-6">
                                <div className="glass-card p-6 rounded-2xl">
                                    <div className="flex items-start space-x-4">
                                        <div className="text-3xl">📊</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">Multi-Sector Embeddings</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                Each memory is encoded across 5 distinct sectors: Factual (core content), Emotional (sentiment), Temporal (time context), Relational (connections), and Behavioral (patterns)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-2xl">
                                    <div className="flex items-start space-x-4">
                                        <div className="text-3xl">⏰</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">Time-Based Decay</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                Memories decay naturally over time using exponential functions. Reinforcement through queries or explicit calls strengthens important memories
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-2xl">
                                    <div className="flex items-start space-x-4">
                                        <div className="text-3xl">🔗</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">Graph Waypoints</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                Bidirectional memory connections form a knowledge graph. Navigate through related memories for context-aware retrieval
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className="glass-card p-8 rounded-3xl">
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-black mb-3">Simple Integration</h3>
                                <p className="text-gray-400">Add memories and query with a clean REST API</p>
                            </div>

                            <div className="bg-black/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 bg-gray-900/50 border-b border-gray-800">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">example.js</span>
                                </div>
                                <pre className="p-8 text-sm text-gray-300 overflow-x-auto font-mono">
                                    <code>{`// Add a memory with automatic multi-sector embedding
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
// Results include memories with decay scores and sector breakdowns`}</code>
                                </pre>
                            </div>

                            <div className="mt-8 text-center">
                                <Link
                                    href="/docs/quick-start"
                                    className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-full transition-all duration-300"
                                >
                                    View Full Documentation →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section className="relative py-32" id="use-cases">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl md:text-6xl font-black mb-6">
                                Real-World <span className="gradient-text-purple">Use Cases</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                From chatbots to personal assistants, OpenMemory powers intelligent AI applications
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Use Case 1 */}
                            <div className="glass-card p-10 rounded-3xl hover:scale-105 transition-all duration-500">
                                <div className="text-5xl mb-6">💬</div>
                                <h3 className="text-2xl font-black mb-4">Conversational AI</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Build chatbots that remember user preferences, conversation history, and context across sessions. Perfect for customer support and virtual assistants.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm font-medium">Long Context</span>
                                    <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm font-medium">User Preferences</span>
                                    <span className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full text-sm font-medium">Emotional Tone</span>
                                </div>
                            </div>

                            {/* Use Case 2 */}
                            <div className="glass-card p-10 rounded-3xl hover:scale-105 transition-all duration-500">
                                <div className="text-5xl mb-6">🤖</div>
                                <h3 className="text-2xl font-black mb-4">Personal AI Assistants</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Create assistants that learn from interactions, remember tasks, and provide personalized recommendations based on behavioral patterns.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm font-medium">Task Memory</span>
                                    <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm font-medium">Learning</span>
                                    <span className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-sm font-medium">Personalization</span>
                                </div>
                            </div>

                            {/* Use Case 3 */}
                            <div className="glass-card p-10 rounded-3xl hover:scale-105 transition-all duration-500">
                                <div className="text-5xl mb-6">📚</div>
                                <h3 className="text-2xl font-black mb-4">Knowledge Management</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Ingest documents, build knowledge graphs, and retrieve relevant information with context-aware search powered by waypoints.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm font-medium">Document AI</span>
                                    <span className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full text-sm font-medium">Graph Search</span>
                                    <span className="px-4 py-2 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-full text-sm font-medium">RAG</span>
                                </div>
                            </div>

                            {/* Use Case 4 */}
                            <div className="glass-card p-10 rounded-3xl hover:scale-105 transition-all duration-500">
                                <div className="text-5xl mb-6">🎯</div>
                                <h3 className="text-2xl font-black mb-4">AI Agents</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Power autonomous agents with long-term memory for complex workflows, tool use, and adaptive behavior over time.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-sm font-medium">Workflows</span>
                                    <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-sm font-medium">Tool Memory</span>
                                    <span className="px-4 py-2 bg-lime-500/20 border border-lime-500/30 rounded-full text-sm font-medium">Adaptation</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-20 text-center glass-card p-12 rounded-3xl">
                            <h3 className="text-4xl font-black mb-6">Ready to Build?</h3>
                            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                                Start building intelligent AI applications with production-ready memory management
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link
                                    href="/docs/quick-start"
                                    className="px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg shadow-purple-500/30"
                                >
                                    Get Started Now
                                </Link>
                                <a
                                    href="https://github.com/nullure/openmemory"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-12 py-5 border-2 border-purple-400 text-purple-400 font-bold text-lg rounded-full hover:bg-purple-400 hover:text-black transition-all duration-300"
                                >
                                    Star on GitHub ⭐
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative py-20 border-t border-gray-800/30">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-4 gap-12 mb-12">
                            {/* Brand */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                        <span className="text-white font-black text-xl">OM</span>
                                    </div>
                                    <span className="text-2xl font-black gradient-text-purple">OpenMemory</span>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Production-ready long-term memory system for AI agents. Built with ❤️ by the open source community.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="https://github.com/nullure/openmemory" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 transition-all duration-300">
                                        <span className="text-lg">⭐</span>
                                    </a>
                                    <a href="https://github.com/nullure/openmemory/issues" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 transition-all duration-300">
                                        <span className="text-lg">💬</span>
                                    </a>
                                </div>
                            </div>

                            {/* Resources */}
                            <div>
                                <h4 className="font-bold text-lg mb-6 gradient-text-purple">Resources</h4>
                                <ul className="space-y-3">
                                    <li><Link href="/docs/introduction" className="text-gray-400 hover:text-purple-400 transition-colors">Documentation</Link></li>
                                    <li><Link href="/docs/quick-start" className="text-gray-400 hover:text-purple-400 transition-colors">Quick Start</Link></li>
                                    <li><Link href="/docs/api/add-memory" className="text-gray-400 hover:text-purple-400 transition-colors">API Reference</Link></li>
                                    <li><Link href="/docs/concepts/hmd-v2" className="text-gray-400 hover:text-purple-400 transition-colors">HMD v2 Spec</Link></li>
                                </ul>
                            </div>

                            {/* Concepts */}
                            <div>
                                <h4 className="font-bold text-lg mb-6 gradient-text-blue">Core Concepts</h4>
                                <ul className="space-y-3">
                                    <li><Link href="/docs/concepts/sectors" className="text-gray-400 hover:text-blue-400 transition-colors">Memory Sectors</Link></li>
                                    <li><Link href="/docs/concepts/decay" className="text-gray-400 hover:text-blue-400 transition-colors">Decay Algorithm</Link></li>
                                    <li><Link href="/docs/concepts/waypoints" className="text-gray-400 hover:text-blue-400 transition-colors">Graph Waypoints</Link></li>
                                    <li><Link href="/docs/advanced/embedding-modes" className="text-gray-400 hover:text-blue-400 transition-colors">Embeddings</Link></li>
                                </ul>
                            </div>

                            {/* Community */}
                            <div>
                                <h4 className="font-bold text-lg mb-6 gradient-text-purple">Community</h4>
                                <ul className="space-y-3">
                                    <li><a href="https://github.com/nullure/openmemory" className="text-gray-400 hover:text-purple-400 transition-colors">GitHub</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/issues" className="text-gray-400 hover:text-purple-400 transition-colors">Issues</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/discussions" className="text-gray-400 hover:text-purple-400 transition-colors">Discussions</a></li>
                                    <li><a href="https://github.com/nullure/openmemory/blob/main/LICENSE" className="text-gray-400 hover:text-purple-400 transition-colors">MIT License</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom */}
                        <div className="border-t border-gray-800/30 pt-8 flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm mb-4 md:mb-0">
                                © 2025 OpenMemory · MIT License · Built with Next.js & Tailwind CSS
                            </p>
                            <div className="flex items-center space-x-6 text-sm text-gray-400">
                                <span className="flex items-center space-x-2">
                                    <span>🔒</span>
                                    <span>Secure</span>
                                </span>
                                <span className="flex items-center space-x-2">
                                    <span>⚡</span>
                                    <span>Fast</span>
                                </span>
                                <span className="flex items-center space-x-2">
                                    <span>🌐</span>
                                    <span>Open Source</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
