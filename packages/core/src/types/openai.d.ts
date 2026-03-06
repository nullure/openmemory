declare module "openai" {
  type embedding_request = {
    model: string
    input: string | string[]
    encoding_format: "float"
    dimensions?: number
  }

  type embedding_response = {
    data: Array<{ embedding: number[]; index?: number }>
  }

  class OpenAIClient {
    embeddings: {
      create: (params: embedding_request) => Promise<embedding_response>
    }
    constructor(opts: { apiKey: string; baseURL?: string })
  }

  export default OpenAIClient
}
