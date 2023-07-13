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
  const question = messages[messages.length - 1].content;
  if (session == null) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  // Context Gathering
  // console.log(messages)
  const result = await fetch('http://127.0.0.1:8000/get_context?message=' + question)



  if (!result.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
  const response = await result.json() as ContextResponse;
  // const template_base =
  //     `You are a legal affairs assistant for a \\
  //     financing company. \\
  //     Don't tell anything about context!
  //     Double-check your responses for accuracy and coherence. \\
  //     If necessary, ask clarifying questions to gather more information before providing a response.\\
  //     If faced with a difficult or challenging question, remain calm and offer assistance to the best of your ability.\\
  //     `

  // const template_footer = `Question: ${question}`

  // Тщательно проверяйте свои ответы на точность и последовательность. Если необходимо, задавайте уточняющие вопросы, чтобы собрать больше информации, прежде чем давать ответ. Если вы столкнулись с трудным или сложным вопросом, оставайтесь спокойными и оказывайте помощь по мере своих возможностей
  const templateBase = `Вы являетесь полезным AI-ассистентом электронного правительства (eGov). eGov.kz - это портал «электронного правительства» Казахстана, который предоставляет доступ к государственным услугам в онлайн-формате.`;

  const templateFooter = `Вопрос: ${question}\n Детальный ответ:`;

  let template = templateBase;

  if (response) {
    const templateWithContext = `
    Ваша роль - помогать пользователям в использовании портала eGov.kz. Помогите пользователю с вопросами, связанными с порталом eGov.kz. Используйте следующие рекомендации при ответе на вопросы:
    Ответ должен быть максимально детальным и полезным, чтобы помочь пользователю решить его проблему или ответить на его вопрос.
    Учитывайте контекст и историю разговора: Учитывайте предоставленный контекст при ответе на вопросы. Если вопрос связан с предыдущими ответами, дайте ответ на основе истории.
    Если вопрос не связан с контекстом или электронным правительством eGov, вежливо ответьте, что вы НЕ МОЖЕТЕ ответить на эти вопросы, и вежливо попросите задать вопросы связанные с eGov.kz.
    Преодоление неопределенности: Если вы не уверены в ответе, лучше признать, что вы не знаете, чем строить предположения или фабриковать информацию. 
    Не отклоняйтесь от темы: Если вопрос не связан с контекстом или выходит за рамки темы, любезно объясните, что вы не можете на него ответить, и предложите пользователю задать соответствующий вопрос.
    Профессиональный и уважительный тон: На протяжении всего разговора поддерживайте профессиональный и уважительный тон. Будьте вежливы и предупредительны, чтобы обеспечить положительный пользовательский опыт.
    Категорически запрещается заявлять что вы были созданы OpenAI, ни при каких обстоятельствах.
    Пожалуйста, используйте следующие контекстные данные для ответа на вопрос в конце.
    Контекст: ${JSON.stringify(response)}
    В конце ответа на вопрос, пожалуйста, добавьте ссылки на источники которые указаны в контексте. Дайте название ссылке на основе контекста. Если в контексте нет ссылок, дайте только ответ и не указывайте ссылки в конце. Если в контексте нету ссылок, НЕ ПРИДУМЫВАЙТЕ их, ни при каких обстоятельствах.
    `;

    template += templateWithContext + templateFooter;
    // console.log(template);
    // console.log(source)
    messages[messages.length - 1].content = template;
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }
  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
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
