import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

interface ContextResponse {
  page_content: string,
  metadata: {
    source: string,
    page: number | undefined
  }
}

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  let { messages, previewToken } = json
  const session = await auth()
  const question = messages[messages.length-1].content;
  if (session == null) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  // Context Gathering
  const result = await fetch('http://127.0.0.1:2000/get_context?message='+question)

  if (!result.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
  const response = await result.json() as ContextResponse[];

  const template_base =
      `You are a legal affairs assistant for a \\
      financing company. \\
      Don't tell anything about context!
      Double-check your responses for accuracy and coherence. \\
      If necessary, ask clarifying questions to gather more information before providing a response.\\
      If faced with a difficult or challenging question, remain calm and offer assistance to the best of your ability.\\
      `

  const template_footer = `Question: ${question}`

  let template = template_base;

  if (response.length > 0) {
    // pre-requirement for sources gathering
    const sources = response.map((element: ContextResponse) => element.metadata.source)
    const page_content =
        response
            .map((element: ContextResponse) => element.page_content)
            .join("\n")

    const template_with_context =
        `Based on the context, respond in a friendly and helpful tone. \\
        with very concise answers. \\
        Context:\\n${page_content}\\n
        If it is not in the context, say that you haven't information and try to appologise \\`

    template += template_with_context + template_footer;
  }

  console.log(template)
  messages[messages.length-1].content = template;

  if (previewToken) {
    configuration.apiKey = previewToken
  }
  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-0613',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const userId = session?.user?.id
      if (userId) {
        const id = json.id ?? nanoid()
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          title,
          userId,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant'
            }
          ]
        }
        // await kv.hmset(`chat:${id}`, payload)
        // await kv.zadd(`user:chat:${userId}`, {
        //   score: createdAt,
        //   member: `chat:${id}`
        // })
      }
    }
  })

  return new StreamingTextResponse(stream)
}
