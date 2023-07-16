import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Какие требование к фотографиям для документов?',
    message: `Какие требование к фотографиям для документов?`
  },
  {
    heading: 'Как открыть egov в телефоне?',
    message: 'Как открыть egov в телефоне?'
  },
  {
    heading: 'Как посмотреть очередь в детский сад?',
    message: `Как посмотреть очередь в детский сад?`
  }, 
  {
    heading: 'Потерял удостоверение личности?',
    message: `Я потерял удостоверение личности, что мне делать?`
  },
  {
    heading: 'Я родила зарубежом?',
    message: `Я родила зарубежом как мне зарегистрировать ребёнка?`
  },
  {
    heading: 'Я сломал руку как мне получить справку о нетрудоспособности?',
    message: `Я сломал руку как мне получить справку о нетрудоспособности?`
  },
  {
    heading: 'Как получить справку о несудимости?',
    message: `Как получить справку о несудимости?`
  },
  {
    heading: 'Как зарегистрировать ТОО по розничной упрощёнке?',
    message: `Как зарегистрировать ТОО по розничной упрощёнке?`
  },
  {
    heading: 'Я хочу учиться за рубежом какие есть программы?',
    message: `Я хочу учиться за рубежом какие есть программы?`
  },
  {
    heading: 'Как получить справку о доходах?',
    message: `Как получить справку о доходах?`
  },
  {
    heading: 'Хочу получить паспорт недвижимости?',
    message: `Хочу получить паспорт недвижимости?`
  },
  {
    heading: 'Как получить ЭЦП через мобильное приложение?',
    message: `Как получить ЭЦП через мобильное приложение?`
  },
  {
    heading: 'Как приготовить яблочный пирог?',
    message: `Как приготовить яблочный пирог?`
  },
  {
    heading: 'Что такое кибербуллинг?',
    message: 'Что такое кибербуллинг?'
  },
  {
    heading: 'Как распознать что ребенок подвергается кибербуллингу?',
    message: 'Как распознать что ребенок подвергается кибербуллингу?'
  },
  {
    heading: 'Что не подлежит аресту на имущество?',
    message: 'Что не подлежит аресту на имущество?'
  },
  {
    heading: 'Как страховать ипотечный займ?',
    message: 'Как страховать ипотечный займ?'
  },
  {
    heading: "Какие требования к участникам программы 'Абай жастары'",
    message: "Какие требования к участникам программы 'Абай жастары'"
  },
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          {/* Welcome to Nimbl AI Chatbot! */}
          Добро пожаловать в eGovAI Chatbot!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          {/* This is an open source AI chatbot app template built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink> and{' '}
          <ExternalLink href="https://vercel.com/storage/kv">
            Vercel KV
          </ExternalLink>
          . */}
          {/* This is a knowledge-based chatbot that can answer questions about your company. */}
          Это чатбот, который может ответить на вопросы по услугам eGov.
        </p>
        <p className="leading-normal text-muted-foreground">
          {/* You can start a conversation here or try the following examples: */}
          Вы можете начать диалог или попробовать следующие примеры:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
