import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

const docsDirectory = path.join(process.cwd(), 'content')

export interface DocMeta {
    title: string
    description?: string
    slug: string
}

export async function getDocBySlug(slug: string[]) {
    const realSlug = slug.join('/')
    const fullPath = path.join(docsDirectory, `${realSlug}.md`)

    if (!fs.existsSync(fullPath)) {
        return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const mdxSource = await serialize(content, {
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeHighlight],
        },
    })

    // Ensure frontmatter values are canonical strings.
    const rawTitle = (data && (data.title ?? ''))
    const title = Array.isArray(rawTitle) ? rawTitle.join(' ') : String(rawTitle || '')

    const rawDesc = data && data.description
    const description = rawDesc == null ? undefined : (Array.isArray(rawDesc) ? rawDesc.join(' ') : String(rawDesc))

    return {
        meta: {
            title,
            description,
            slug: realSlug,
        } as DocMeta,
        source: mdxSource,
    }
}

export function getAllDocSlugs() {
    const slugs: string[][] = []

    function getFiles(dir: string, base: string[] = []) {
        const files = fs.readdirSync(dir)

        files.forEach((file) => {
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)

            if (stat.isDirectory()) {
                getFiles(filePath, [...base, file])
            } else if (file.endsWith('.md')) {
                const slug = [...base, file.replace(/\.md$/, '')]
                slugs.push(slug)
            }
        })
    }

    if (fs.existsSync(docsDirectory)) {
        getFiles(docsDirectory)
    }

    return slugs
}
