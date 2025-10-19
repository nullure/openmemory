import { GetStaticProps, GetStaticPaths } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import Head from 'next/head'
import DocsLayout from '@/components/DocsLayout'
import { getDocBySlug, getAllDocSlugs, DocMeta } from '@/lib/mdx'

interface DocPageProps {
    meta: DocMeta
    source: MDXRemoteSerializeResult
}

const components = {
    // Custom components for MDX
    h1: (props: any) => <h1 className="text-5xl font-black mb-8 gradient-text-purple" {...props} />,
    h2: (props: any) => <h2 className="text-4xl font-bold mt-16 mb-6 text-white pb-3 border-b border-gray-800/50" {...props} />,
    h3: (props: any) => <h3 className="text-3xl font-bold mt-12 mb-4 gradient-text-blue" {...props} />,
    h4: (props: any) => <h4 className="text-2xl font-semibold mt-8 mb-3 text-gray-200" {...props} />,
    p: (props: any) => <p className="mb-6 text-gray-300 leading-relaxed text-lg" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-6 space-y-3 text-gray-300" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 mb-6 space-y-3 text-gray-300" {...props} />,
    li: (props: any) => <li className="text-gray-300 leading-relaxed" {...props} />,
    a: (props: any) => <a className="text-purple-400 hover:text-purple-300 font-medium underline decoration-purple-400/30 hover:decoration-purple-300 transition-all duration-300" {...props} />,
    code: (props: any) => {
        if (props.className) {
            // Block code (has language class)
            return <code className={`${props.className} text-sm`} {...props} />
        }
        // Inline code
        return <code className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-lg text-sm font-mono border border-purple-500/30" {...props} />
    },
    pre: (props: any) => (
        <pre className="bg-black/50 border border-gray-800 rounded-2xl p-8 overflow-x-auto mb-8 shadow-lg shadow-purple-500/10" {...props} />
    ),
    blockquote: (props: any) => (
        <blockquote className="border-l-4 border-purple-500 pl-6 py-4 my-8 italic text-gray-400 bg-gradient-to-r from-purple-500/10 to-transparent rounded-r-lg" {...props} />
    ),
    table: (props: any) => (
        <div className="overflow-x-auto mb-8 rounded-2xl border border-gray-800 shadow-lg">
            <table className="min-w-full divide-y divide-gray-800" {...props} />
        </div>
    ),
    thead: (props: any) => <thead className="bg-gradient-to-r from-purple-500/20 to-blue-500/20" {...props} />,
    tbody: (props: any) => <tbody className="divide-y divide-gray-800/50" {...props} />,
    tr: (props: any) => <tr className="hover:bg-gray-800/30 transition-colors" {...props} />,
    th: (props: any) => <th className="px-6 py-4 text-left text-sm font-bold text-white" {...props} />,
    td: (props: any) => <td className="px-6 py-4 text-sm text-gray-300" {...props} />,
}

export default function DocPage({ meta, source }: DocPageProps) {
    return (
        <DocsLayout>
            <Head>
                <title>{String(meta.title)} - OpenMemory Documentation</title>
                {meta.description && <meta name="description" content={String(meta.description)} />}
            </Head>

            <div className="mb-12 pb-8 border-b border-gray-800/50">
                <h1 className="text-5xl md:text-6xl font-black gradient-text-purple mb-6">{String(meta.title)}</h1>
                {meta.description && (
                    <p className="text-xl text-gray-400 leading-relaxed">{String(meta.description)}</p>
                )}
            </div>

            <MDXRemote {...source} components={components} />
        </DocsLayout>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const slugs = getAllDocSlugs()

    return {
        paths: slugs.map((slug) => ({
            params: { slug },
        })),
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const slug = params?.slug as string[]

    if (!slug) {
        return { notFound: true }
    }

    const doc = await getDocBySlug(slug)

    if (!doc) {
        return { notFound: true }
    }

    return {
        props: {
            meta: doc.meta,
            source: doc.source,
        },
    }
}
