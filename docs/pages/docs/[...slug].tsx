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
    h1: (props: any) => <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-50 tracking-tight" {...props} />,
    h2: (props: any) => <h2 className="text-3xl md:text-4xl font-bold mt-12 mb-4 text-gray-50 pb-2 border-b border-dark-700" {...props} />,
    h3: (props: any) => <h3 className="text-2xl md:text-3xl font-semibold mt-10 mb-3 text-gray-100" {...props} />,
    h4: (props: any) => <h4 className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-gray-200" {...props} />,
    p: (props: any) => <p className="mb-5 text-gray-300 leading-relaxed" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-300" {...props} />,
    li: (props: any) => <li className="text-gray-300 leading-relaxed" {...props} />,
    a: (props: any) => <a className="text-primary-400 hover:text-primary-300 font-medium transition-colors" {...props} />,
    code: (props: any) => {
        if (props.className) {
            return <code className={`${props.className} text-sm`} {...props} />
        }
        return <code className="px-2 py-1 bg-primary-500/15 text-primary-300 rounded border border-primary-500/25 text-sm font-mono" {...props} />
    },
    pre: (props: any) => (
        <pre className="bg-dark-850/60 border border-dark-700 rounded-lg p-4 overflow-x-auto mb-6" {...props} />
    ),
    blockquote: (props: any) => (
        <blockquote className="border-l-4 border-primary-500/40 pl-4 py-2 my-6 italic text-gray-400 bg-primary-500/5 rounded-r" {...props} />
    ),
    table: (props: any) => (
        <div className="overflow-x-auto mb-6 rounded-lg border border-dark-700">
            <table className="min-w-full divide-y divide-dark-700" {...props} />
        </div>
    ),
    thead: (props: any) => <thead className="bg-dark-800/30" {...props} />,
    tbody: (props: any) => <tbody className="divide-y divide-dark-700" {...props} />,
    tr: (props: any) => <tr className="hover:bg-dark-800/30" {...props} />,
    th: (props: any) => <th className="px-4 py-3 text-left text-sm font-semibold text-gray-100" {...props} />,
    td: (props: any) => <td className="px-4 py-3 text-sm text-gray-300" {...props} />,
}

export default function DocPage({ meta, source }: DocPageProps) {
    return (
        <DocsLayout>
            <Head>
                <title>{String(meta.title)} - OpenMemory Documentation</title>
                {meta.description && <meta name="description" content={String(meta.description)} />}
            </Head>

            <div className="mb-8 pb-6 border-b border-dark-700">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-50 mb-4 tracking-tight">{String(meta.title)}</h1>
                {meta.description && (
                    <p className="text-lg text-gray-400 leading-relaxed">{String(meta.description)}</p>
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
