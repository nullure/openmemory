import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface ProcessNode extends d3.SimulationNodeDatum {
    id: string
    label: string
    color: string
    size: number
    type: 'input' | 'process' | 'storage' | 'output' | 'decision'
    description: string
    icon?: string
}

interface ProcessLink extends d3.SimulationLinkDatum<ProcessNode> {
    source: string | ProcessNode
    target: string | ProcessNode
    label?: string
}

const SystemArchitecture = () => {
    const svgRef = useRef<SVGSVGElement>(null)
    const [hoveredNode, setHoveredNode] = useState<ProcessNode | null>(null)
    const [dimensions, setDimensions] = useState({ width: 1000, height: 700 })

    useEffect(() => {
        const updateDimensions = () => {
            if (svgRef.current) {
                const container = svgRef.current.parentElement
                if (container) {
                    setDimensions({
                        width: container.clientWidth,
                        height: Math.min(700, window.innerHeight * 0.8)
                    })
                }
            }
        }
        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

    useEffect(() => {
        if (!svgRef.current) return

        const { width, height } = dimensions

        // Clear previous content
        d3.select(svgRef.current).selectAll('*').remove()

        // Define the complete process flow
        const nodes: ProcessNode[] = [
            // Input layer
            { id: 'input', label: 'New Memory', color: '#3b82f6', size: 35, type: 'input', description: 'Conversation, document, or event enters the system', x: 100, y: height / 2 },

            // Processing layer
            { id: 'parse', label: 'Parse & Extract', color: '#8b5cf6', size: 28, type: 'process', description: 'Extract entities, intent, and metadata', x: 250, y: height / 2 - 150 },
            { id: 'chunk', label: 'Chunking', color: '#8b5cf6', size: 28, type: 'process', description: 'Split into semantic chunks if needed', x: 250, y: height / 2 + 150 },

            // Sector classification
            { id: 'classify', label: 'Sector Classification', color: '#06b6d4', size: 32, type: 'decision', description: 'Determine which memory dimensions apply', x: 450, y: height / 2 },

            // 5 Memory sectors
            { id: 'episodic', label: 'Episodic', color: '#6366f1', size: 26, type: 'storage', description: 'Store experiences & events', x: 650, y: height / 2 - 200 },
            { id: 'semantic', label: 'Semantic', color: '#8b5cf6', size: 26, type: 'storage', description: 'Store facts & knowledge', x: 650, y: height / 2 - 100 },
            { id: 'procedural', label: 'Procedural', color: '#10b981', size: 26, type: 'storage', description: 'Store skills & patterns', x: 650, y: height / 2 },
            { id: 'emotional', label: 'Emotional', color: '#ec4899', size: 26, type: 'storage', description: 'Store sentiment & affect', x: 650, y: height / 2 + 100 },
            { id: 'reflective', label: 'Reflective', color: '#f59e0b', size: 26, type: 'storage', description: 'Store insights & lessons', x: 650, y: height / 2 + 200 },

            // Embedding process
            { id: 'embed', label: 'Vector Embedding', color: '#a855f7', size: 30, type: 'process', description: 'Generate multi-dimensional embeddings', x: 850, y: height / 2 },

            // Storage layer
            { id: 'vector_db', label: 'Vector Store', color: '#14b8a6', size: 28, type: 'storage', description: 'SQLite with vector search', x: width - 250, y: height / 2 - 80 },
            { id: 'graph_db', label: 'Knowledge Graph', color: '#14b8a6', size: 28, type: 'storage', description: 'Waypoints & relationships', x: width - 250, y: height / 2 + 80 },

            // Decay & retrieval
            { id: 'decay', label: 'Decay Engine', color: '#f59e0b', size: 26, type: 'process', description: 'Manages memory strength over time', x: width - 100, y: height / 2 - 200 },
            { id: 'retrieval', label: 'Smart Retrieval', color: '#10b981', size: 28, type: 'output', description: 'Context-aware memory recall', x: width - 100, y: height / 2 + 200 },
        ]

        // Define the process flow links
        const links: ProcessLink[] = [
            // Input to processing
            { source: 'input', target: 'parse', label: '1' },
            { source: 'input', target: 'chunk', label: '2' },

            // Processing to classification
            { source: 'parse', target: 'classify', label: '3' },
            { source: 'chunk', target: 'classify', label: '4' },

            // Classification to sectors (showing all 5 sectors receive the classified data)
            { source: 'classify', target: 'episodic', label: '5a' },
            { source: 'classify', target: 'semantic', label: '5b' },
            { source: 'classify', target: 'procedural', label: '5c' },
            { source: 'classify', target: 'emotional', label: '5d' },
            { source: 'classify', target: 'reflective', label: '5e' },

            // Sectors to embedding
            { source: 'episodic', target: 'embed' },
            { source: 'semantic', target: 'embed' },
            { source: 'procedural', target: 'embed' },
            { source: 'emotional', target: 'embed' },
            { source: 'reflective', target: 'embed' },

            // Embedding to storage
            { source: 'embed', target: 'vector_db', label: '6' },
            { source: 'embed', target: 'graph_db', label: '7' },

            // Storage to decay & retrieval
            { source: 'vector_db', target: 'decay' },
            { source: 'graph_db', target: 'decay' },
            { source: 'vector_db', target: 'retrieval', label: '8' },
            { source: 'graph_db', target: 'retrieval', label: '9' },
        ]

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])

        // Create container for zoom
        const g = svg.append('g')

        // Add zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 2])
            .on('zoom', (event) => {
                g.attr('transform', event.transform)
            })

        svg.call(zoom)

        // Create arrow markers for directed edges
        const defs = svg.append('defs')

        // Arrow marker
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 8)
            .attr('refY', 3)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3, 0 6')
            .attr('fill', '#64748b')

        // Gradients for nodes
        nodes.forEach(node => {
            const gradient = defs.append('radialGradient')
                .attr('id', `gradient-${node.id}`)
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', node.color)
                .attr('stop-opacity', 0.95)
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', node.color)
                .attr('stop-opacity', 0.5)
        })

        // Create links
        const link = g.append('g')
            .selectAll('g')
            .data(links)
            .join('g')

        link.append('line')
            .attr('stroke', '#64748b')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)')
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y)

        // Add link labels
        link.filter((d: ProcessLink) => !!d.label)
            .append('text')
            .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
            .attr('y', (d: any) => (d.source.y + d.target.y) / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', 10)
            .attr('fill', '#94a3b8')
            .attr('dy', -5)
            .text((d: ProcessLink) => d.label || '')

        // Create node groups
        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('transform', (d: ProcessNode) => `translate(${d.x},${d.y})`)
            .style('cursor', 'pointer')

        // Add shapes based on node type
        node.each(function (d: ProcessNode) {
            const group = d3.select(this)

            switch (d.type) {
                case 'input':
                    // Rounded rectangle for input
                    group.append('rect')
                        .attr('x', -d.size)
                        .attr('y', -d.size * 0.6)
                        .attr('width', d.size * 2)
                        .attr('height', d.size * 1.2)
                        .attr('rx', 10)
                        .attr('fill', `url(#gradient-${d.id})`)
                        .attr('stroke', d.color)
                        .attr('stroke-width', 2.5)
                    break

                case 'decision':
                    // Diamond for decision
                    const diamondSize = d.size * 1.2
                    group.append('path')
                        .attr('d', `M 0,-${diamondSize} L ${diamondSize},0 L 0,${diamondSize} L -${diamondSize},0 Z`)
                        .attr('fill', `url(#gradient-${d.id})`)
                        .attr('stroke', d.color)
                        .attr('stroke-width', 2.5)
                    break

                case 'storage':
                    // Cylinder for storage
                    group.append('ellipse')
                        .attr('cx', 0)
                        .attr('cy', -d.size * 0.5)
                        .attr('rx', d.size)
                        .attr('ry', d.size * 0.3)
                        .attr('fill', d.color)
                        .attr('fill-opacity', 0.3)
                        .attr('stroke', d.color)
                        .attr('stroke-width', 2)

                    group.append('rect')
                        .attr('x', -d.size)
                        .attr('y', -d.size * 0.5)
                        .attr('width', d.size * 2)
                        .attr('height', d.size)
                        .attr('fill', `url(#gradient-${d.id})`)

                    group.append('ellipse')
                        .attr('cx', 0)
                        .attr('cy', d.size * 0.5)
                        .attr('rx', d.size)
                        .attr('ry', d.size * 0.3)
                        .attr('fill', `url(#gradient-${d.id})`)
                        .attr('stroke', d.color)
                        .attr('stroke-width', 2)
                    break

                case 'process':
                case 'output':
                default:
                    // Rectangle for process
                    group.append('rect')
                        .attr('x', -d.size)
                        .attr('y', -d.size * 0.7)
                        .attr('width', d.size * 2)
                        .attr('height', d.size * 1.4)
                        .attr('rx', 6)
                        .attr('fill', `url(#gradient-${d.id})`)
                        .attr('stroke', d.color)
                        .attr('stroke-width', 2.5)
                    break
            }
        })

        // Add hover effects
        node.on('mouseenter', function (event, d) {
            setHoveredNode(d)
            d3.select(this).selectAll('rect, ellipse, path, circle')
                .transition()
                .duration(200)
                .attr('stroke-width', 4)
        })
            .on('mouseleave', function (event, d) {
                setHoveredNode(null)
                d3.select(this).selectAll('rect, ellipse, path, circle')
                    .transition()
                    .duration(200)
                    .attr('stroke-width', 2.5)
            })

        // Add labels
        node.append('text')
            .text((d: ProcessNode) => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', 4)
            .attr('font-size', (d: ProcessNode) => d.size > 30 ? 12 : 10)
            .attr('font-weight', 600)
            .attr('fill', '#f8fafc')
            .attr('pointer-events', 'none')
            .style('user-select', 'none')

        return () => {
            // Cleanup
        }
    }, [dimensions])

    return (
        <div className="relative w-full h-full">
            <svg ref={svgRef} className="w-full h-full" />

            {/* Hover tooltip */}
            {hoveredNode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-xs px-4 py-3 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl pointer-events-none z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: hoveredNode.color }}
                        />
                        <p className="text-white text-sm font-semibold">{hoveredNode.label}</p>
                    </div>
                    <p className="text-gray-400 text-xs">{hoveredNode.description}</p>
                    <div className="mt-2 px-2 py-1 bg-slate-800/50 rounded text-[10px] text-gray-500 uppercase tracking-wider">
                        {hoveredNode.type}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-slate-700/40 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Process Flow</p>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-4 rounded border-2 border-blue-500 bg-blue-500/20"></div>
                        <span className="text-gray-300">Input</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-4 rounded border-2 border-purple-500 bg-purple-500/20"></div>
                        <span className="text-gray-300">Process</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rotate-45 border-2 border-cyan-500 bg-cyan-500/20"></div>
                        <span className="text-gray-300">Decision</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-4 rounded-full border-2 border-teal-500 bg-teal-500/20"></div>
                        <span className="text-gray-300">Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-4 rounded border-2 border-emerald-500 bg-emerald-500/20"></div>
                        <span className="text-gray-300">Output</span>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Scroll to zoom
                </span>
                <span className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Hover for details
                </span>
            </div>
        </div>
    )
}

export default SystemArchitecture
