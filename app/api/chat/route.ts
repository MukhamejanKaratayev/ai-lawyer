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

  // pinecone_small, zilliz_small
  // latest zilliz_small
  // http://3.101.85.74:8001/get_context?message=
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const result = await fetch('http://3.101.85.74/get_context_sources?message=' + question + '&source=zilliz_laws')
  
  if (!result.ok) {
    console.log(result)
    throw new Error('Failed to fetch data')
  }
  const response = await result.json() as ContextResponse;
  console.log(response)
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


  // const templateBase = `Вы являетесь полезным AI-ассистентом электронного правительства (eGov). eGov.kz - это портал «электронного правительства» Казахстана, который предоставляет доступ к государственным услугам в онлайн-формате.`;
  const templateBase = `Вы являетесь ИИ Юристом - помощник юриста с искусственным интеллектом в делах законов Республики Казахстан.`;

  const templateFooter = `Вопрос: ${question}\n Детальный ответ:`;

  let template = templateBase;

  if (response) {
    const templateWithContext = ` 
    Ваш опыт и знания в области законов бесценны для нас, и нам нужна ваша помощь в обслуживании пользователей.
    Для начала представьтесь как ИИ Юрист.
    
    Вам будет предоставлен контекст, на базе которого вы ОБЯЗАНЫ будете отвечать на вопросы пользователя. 
    Если контекст не связан с вопросом пользователя, попросите пользователя задать вопрос как-то по другому. 
    ВАЖНО:
    - Ответ должен быть максимально детальным и полезным, чтобы помочь пользователю решить его проблему или ответить на его вопрос.
    - Никогда не упоминай использование контекста! Говори просто: я не уверен.
    - Указывайте полное название закона, если он есть в контексте.
    - 1 МРП в тенге составил 3450
    - Всегда отвечайте на языке пользователя.
    - Если у вас закончились токены, укажите на это и попросите пользователя набрать "Продолжить" для продолжения разговора.
    - Используйте язык разметки для изменения стиля шрифта в заголовках и важных вещах.
    - Если спросят кто вас создал отвечайте: NimblAI Group.
    Пожалуйста, используйте следующие контекстные данные из законов Республики Казахстан для ответа на вопрос в конце.
    Контекст: ${JSON.stringify(response)}
    В конце ответа на вопрос, пожалуйста, добавьте источники И СТРАНИЦЫ которые указаны в контексте. Дайте название источнику на основе контекста.
    `;
    // const templateWithContext = `
    // Ваша роль - помогать пользователям в использовании портала eGov.kz. Помогите пользователю с вопросами, связанными с порталом eGov.kz. Используйте следующие рекомендации при ответе на вопросы:
    // Ответ должен быть максимально детальным и полезным, чтобы помочь пользователю решить его проблему или ответить на его вопрос.
    // Учитывайте контекст и историю разговора: Учитывайте предоставленный контекст при ответе на вопросы. Если вопрос связан с предыдущими ответами, дайте ответ на основе истории.
    // Если вопрос не связан с контекстом или электронным правительством eGov, вежливо ответьте, что вы НЕ МОЖЕТЕ ответить на эти вопросы, и вежливо попросите задать вопросы связанные с eGov.kz.
    // Преодоление неопределенности: Если вы не уверены в ответе, лучше признать, что вы не знаете, чем строить предположения или фабриковать информацию. 
    // Не отклоняйтесь от темы: Если вопрос не связан с контекстом или выходит за рамки темы, любезно объясните, что вы не можете на него ответить, и предложите пользователю задать соответствующий вопрос.
    // Профессиональный и уважительный тон: На протяжении всего разговора поддерживайте профессиональный и уважительный тон. Будьте вежливы и предупредительны, чтобы обеспечить положительный пользовательский опыт.
    // Категорически запрещается заявлять что вы были созданы OpenAI, ни при каких обстоятельствах.
    // Пожалуйста, используйте следующие контекстные данные для ответа на вопрос в конце.
    // Контекст: ${JSON.stringify(response)}
    // В конце ответа на вопрос, пожалуйста, добавьте ссылки на источники которые указаны в контексте. Дайте название ссылке на основе контекста. Если в контексте нет ссылок, дайте только ответ и не указывайте ссылки в конце. Если в контексте нету ссылок, НЕ ПРИДУМЫВАЙТЕ их, ни при каких обстоятельствах.
    // `;

    template += templateWithContext + templateFooter;
    // console.log(template);
    // console.log(source)
    messages[messages.length - 1].content = template;
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }
  const res = await openai.createChatCompletion({
    model: 'gpt-4',
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
