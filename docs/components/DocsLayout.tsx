import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

interface NavItem {
    title: string
    href: string
    children?: NavItem[]
}

const navigation: NavItem[] = [
    {
        title: 'Getting Started',
        href: '/docs/getting-started',
        children: [
            { title: 'Introduction', href: '/docs/introduction' },
            { title: 'Quick Start', href: '/docs/quick-start' },
            { title: 'Installation', href: '/docs/installation' },
        ]
    },
    {
        title: 'Core Concepts',
        href: '/docs/concepts',
        children: [
            { title: 'Memory Sectors', href: '/docs/concepts/sectors' },
            { title: 'HMD v2 Specification', href: '/docs/concepts/hmd-v2' },
            { title: 'Waypoints & Graph', href: '/docs/concepts/waypoints' },
            { title: 'Decay Algorithm', href: '/docs/concepts/decay' },
        ]
    },
    {
        title: 'API Reference',
        href: '/docs/api',
        children: [
            { title: 'Add Memory', href: '/docs/api/add-memory' },
            { title: 'Query Memory', href: '/docs/api/query' },
            { title: 'Multimodal Ingestion', href: '/docs/api/ingestion' },
            { title: 'Reinforcement', href: '/docs/api/reinforce' },
        ]
    },
    {
        title: 'Advanced',
        href: '/docs/advanced',
        children: [
            { title: 'Embedding Modes', href: '/docs/advanced/embedding-modes' },
            { title: 'Custom Providers', href: '/docs/advanced/providers' },
            { title: 'Chunking Strategy', href: '/docs/advanced/chunking' },
        ]
    },
]

interface LayoutProps {
    children: ReactNode
}

export default function DocsLayout({ children }: LayoutProps) {
    const router = useRouter()

    const isActive = (href: string) => {
        return router.pathname === href || router.pathname.startsWith(href + '/')
    }

    return (
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
            <header className="sticky top-0 z-50 navbar-blur border-b border-gray-800/30">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-lg">OM</span>
                        </div>
                        <span className="text-xl font-black gradient-text-purple">OpenMemory</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-gray-300 hover:text-purple-400 transition-all duration-300">
                            Home
                        </Link>
                        <Link href="/docs/introduction" className="text-gray-300 hover:text-blue-400 transition-all duration-300">
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
            </header>

            <div className="pt-16 relative z-10">
                <div className="container mx-auto px-6 flex gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-8">
                        <nav className="space-y-8">
                            {navigation.map((section) => (
                                <div key={section.href}>
                                    <h3 className="text-xs font-bold uppercase tracking-wider gradient-text-purple mb-4 px-4">
                                        {section.title}
                                    </h3>
                                    {section.children && (
                                        <ul className="space-y-2">
                                            {section.children.map((item) => (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(item.href)
                                                                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-l-4 border-purple-500 text-white pl-3'
                                                                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                                                            }`}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0 py-8 px-4 lg:px-8 max-w-4xl">
                        <article className="prose prose-invert max-w-none">
                            <div className="glass-card p-8 lg:p-12 rounded-3xl">
                                {children}
                            </div>
                        </article>

                        {/* Footer nav */}
                        <div className="mt-8 pt-6 border-t border-gray-800/30">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                                <div>
                                    © 2025 OpenMemory · MIT License
                                </div>
                                <div className="flex space-x-6">
                                    <a href="https://github.com/nullure/openmemory/issues" className="hover:text-purple-400 transition-colors">
                                        Report Issue
                                    </a>
                                    <a href="https://github.com/nullure/openmemory" className="hover:text-purple-400 transition-colors">
                                        Edit on GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Right sidebar - Table of Contents */}
                    <aside className="hidden xl:block w-56 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-8">
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider gradient-text-blue mb-3 px-2">On this page</h4>
                            <div id="toc" className="text-sm space-y-1 text-gray-400">
                                <p className="text-xs px-2">Table of contents</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
