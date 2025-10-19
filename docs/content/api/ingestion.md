---
title: Multimodal Ingestion
description: Ingest PDFs, DOCX, HTML, and URLs with automatic chunking
---

# Multimodal Ingestion

OpenMemory supports ingesting content from multiple file formats and web URLs with automatic text extraction, chunking, and memory creation.

## Supported Formats

| Format | Extension | Library | Features |
|--------|-----------|---------|----------|
| **PDF** | `.pdf` | pdf-parse | Text extraction, multi-page support |
| **Word** | `.docx` | mammoth | Raw text extraction, formatting preserved |
| **HTML** | `.html` | turndown | HTML to Markdown conversion |
| **Web URLs** | N/A | node-fetch | Automatic HTML fetching and parsing |

## File Upload API

### Endpoint

```
POST /memory/ingest
```

### Request

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | PDF, DOCX, or HTML file |
| `metadata` | JSON string | ❌ | Custom metadata object |

### Example: cURL

```bash
curl -X POST http://localhost:3000/memory/ingest \
  -F "file=@research-paper.pdf" \
  -F "metadata={\"source\":\"research\",\"author\":\"John Doe\"}"
```

### Example: Python SDK

```python
from openmemory import OpenMemoryClient

client = OpenMemoryClient(base_url="http://localhost:3000")

# Ingest PDF
result = client.ingest_file(
    file_path="research-paper.pdf",
    metadata={"source": "research", "author": "John Doe"}
)

print(f"Root Memory ID: {result['rootMemoryId']}")
print(f"Child Memories: {len(result['childMemoryIds'])}")
```

### Example: JavaScript

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('metadata', JSON.stringify({
  source: 'user_upload',
  category: 'documentation'
}));

const response = await fetch('http://localhost:3000/memory/ingest', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Root Memory:', result.rootMemoryId);
```

## URL Ingestion API

### Endpoint

```
POST /memory/ingest/url
```

### Request

**Content-Type**: `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | Web page URL (http/https) |
| `metadata` | object | ❌ | Custom metadata |

### Example: cURL

```bash
curl -X POST http://localhost:3000/memory/ingest/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/blog/ai-advances",
    "metadata": {
      "source": "blog",
      "category": "ai"
    }
  }'
```

### Example: Python SDK

```python
result = client.ingest_url(
    url="https://example.com/blog/ai-advances",
    metadata={"source": "blog", "category": "ai"}
)
```

## Root-Child Strategy

When ingesting **large documents** (>8000 tokens), OpenMemory automatically creates a **hierarchical memory structure**.

### How It Works

1. **Token Count Check**: Document is tokenized and counted
2. **Decision**: 
  - Small (less than 8000 tokens): Single memory
  - Large (≥8000 tokens): Root-child structure
3. **Root Creation**: 
   - Generates a **reflective summary** of the entire document
   - Creates root memory with summary content
4. **Child Creation**:
   - Splits document into **sections** (~3000 chars each)
   - Creates child memory for each section
5. **Waypoint Linking**:
   - Bidirectional edges connect root ↔ children
   - Enables graph traversal during queries

### Architecture

```
┌─────────────────────────────────┐
│    Root Memory (Summary)        │
│  "Research paper discusses..."  │
└──┬──────────────┬──────────────┬┘
   │              │              │
   │ waypoint     │ waypoint     │ waypoint
   │              │              │
┌──▼──────┐  ┌───▼──────┐  ┌───▼──────┐
│ Child 1 │  │ Child 2  │  │ Child 3  │
│ Intro   │  │ Methods  │  │ Results  │
└─────────┘  └──────────┘  └──────────┘
```

### Benefits

✅ **Efficient Querying**: Query the summary first, drill down to sections  
✅ **Better Context**: Root provides document overview  
✅ **Scalable**: Handles documents of any size  
✅ **Graph Traversal**: Follow waypoints for related content

### Example Response

```json
{
  "success": true,
  "rootMemoryId": "mem_root_123",
  "childMemoryIds": [
    "mem_child_456",
    "mem_child_789",
    "mem_child_abc"
  ],
  "message": "Document ingested with root-child structure",
  "metadata": {
    "totalSections": 3,
    "tokenCount": 12450,
    "fileType": "pdf"
  }
}
```

## Section Splitting Algorithm

Documents are split at **paragraph boundaries** to preserve semantic coherence.

### Logic

```typescript
function splitIntoSections(text: string, maxChars: number = 3000): string[] {
  const paragraphs = text.split(/\n\n+/);
  const sections: string[] = [];
  let currentSection = '';

  for (const paragraph of paragraphs) {
    if (currentSection.length + paragraph.length > maxChars && currentSection.length > 0) {
      sections.push(currentSection.trim());
      currentSection = paragraph;
    } else {
      currentSection += '\n\n' + paragraph;
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection.trim());
  }

  return sections;
}
```

### Characteristics

- **Max Section Size**: ~3000 characters (configurable)
- **Split Points**: Paragraph boundaries (`\n\n`)
- **Preserves Context**: Never splits mid-paragraph
- **Handles Edge Cases**: Very long paragraphs (>3000 chars) become their own section

## Format-Specific Details

### PDF Extraction

**Library**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)

```typescript
import PDFParse from 'pdf-parse';

async function extractPDF(buffer: Buffer): Promise<string> {
  const data = await PDFParse(buffer);
  return data.text;
}
```

**Features**:
- Multi-page text extraction
- Preserves line breaks
- Handles embedded fonts
- UTF-8 encoding

**Limitations**:
- Images and charts are ignored
- Complex layouts may have formatting issues
- Scanned PDFs require OCR (not included)

### DOCX Extraction

**Library**: [mammoth](https://www.npmjs.com/package/mammoth)

```typescript
import mammoth from 'mammoth';

async function extractDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
```

**Features**:
- Raw text extraction
- Preserves paragraph structure
- Handles tables and lists
- UTF-8 encoding

**Limitations**:
- Images and embedded objects ignored
- Complex formatting stripped
- Comments and tracked changes not extracted

### HTML Extraction

**Library**: [turndown](https://www.npmjs.com/package/turndown)

```typescript
import TurndownService from 'turndown';

function extractHTML(html: string): Promise<string> {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });
  return Promise.resolve(turndown.turndown(html));
}
```

**Features**:
- HTML to Markdown conversion
- Preserves headings, lists, code blocks
- Removes scripts and styles
- Clean text output

**Conversions**:
- `<h1>` → `# Heading`
- `<strong>` → `**bold**`
- `<code>` → `` `code` ``
- `<a href>` → `[text](url)`

### URL Fetching

**Library**: Node.js `fetch`

```typescript
async function fetchURL(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  return extractHTML(html);
}
```

**Features**:
- Automatic HTTP/HTTPS handling
- Follows redirects
- Converts HTML to Markdown
- UTF-8 encoding

**Limitations**:
- No JavaScript execution (static content only)
- No authentication support
- Rate limits from target sites

## Error Handling

### File Validation

```json
{
  "error": "Unsupported file type: .txt",
  "message": "Only PDF, DOCX, and HTML files are supported"
}
```

### URL Validation

```json
{
  "error": "Invalid URL",
  "message": "URL must start with http:// or https://"
}
```

### Extraction Failures

```json
{
  "error": "PDF extraction failed",
  "message": "Could not parse PDF file. File may be corrupted or password-protected."
}
```

## Performance Considerations

### File Size Limits

- **Recommended Max**: 10 MB per file
- **Large PDFs**: May take 5-10 seconds to process
- **Memory Usage**: ~3x file size during processing

### Rate Limiting

When ingesting **many documents**:
- Use **Simple embedding mode** to reduce API calls
- Add delays between ingestions
- Monitor embedding provider rate limits

### Database Growth

Each ingested document creates:
- 1 root memory (if large)
- N child memories (sections)
- N waypoints (root-child links)
- 5 embeddings per memory (HMD v2 sectors)

**Example**: 10-page PDF → ~3 sections → 4 memories → 20 embeddings

## Best Practices

### Metadata Tagging

Always include metadata for filtering:

```javascript
{
  source: 'research_papers',
  author: 'John Doe',
  year: 2024,
  category: 'machine_learning',
  file_name: 'paper.pdf'
}
```

### Batch Processing

For bulk ingestion:

```python
import os
from openmemory import OpenMemoryClient

client = OpenMemoryClient()

for filename in os.listdir('./documents'):
    if filename.endswith('.pdf'):
        result = client.ingest_file(
            file_path=f'./documents/{filename}',
            metadata={'source': 'bulk_upload', 'filename': filename}
        )
        print(f"Processed {filename}: {result['rootMemoryId']}")
```

### Error Recovery

Implement retry logic for failed ingestions:

```python
import time

def ingest_with_retry(file_path, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.ingest_file(file_path)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise
```

## Next Steps

- **[Waypoints](/docs/concepts/waypoints)**: Understand memory graph connections
- **[API Reference](/docs/api/ingestion)**: Full ingestion API documentation
- **[Embedding Modes](/docs/advanced/embedding-modes)**: Optimize ingestion performance
- **[Chunking Strategy](/docs/advanced/chunking)**: Customize section splitting
