import { type UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconArrowRight, IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export interface ChatPanelProps
  extends Pick<
  UseChatHelpers,
  | 'append'
  | 'isLoading'
  | 'reload'
  | 'messages'
  | 'stop'
  | 'input'
  | 'setInput'
  > {
  id?: string
}

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages
}: ChatPanelProps) {

  useEffect(() => {
    if (!isLoading && messages?.length > 0) {
      console.log("Finished!!!");
      setLink('');
      const lastAssistantMessage = messages
        .filter((msg) => msg.role === 'assistant')
        .slice(-1)[0];

      setLinkHandler(lastAssistantMessage.content);

      // Text-to-speech part
      // const utterance = new SpeechSynthesisUtterance(lastAssistantMessage.content);
      // utterance.lang = 'ru-RU'; // Set the language code for Russian

      // speechSynthesis.speak(utterance);
    }
  }, [isLoading, messages]);

  const [link, setLink] = useState('')
  const setLinkHandler = (text: string) => {
    const urlRegex = /\((https?:\/\/[^\s]+)\)/;
    const match = text.match(urlRegex);
    if (match && match[1] && match[1].includes('services')) setLink(match[1]);
  }
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        {/* before h-28 if link */}
        <div className={`flex ${isLoading || link == '' ? 'h-10' : 'h-12'} items-center justify-center`}>
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <div className='flex flex-row space-x-4'>
                {/* <p>{JSON.stringify(messages.filter((msg:any) => msg.role == 'assistant')[0].content)}</p> */}

                <Button
                  // size='lg'
                  variant="outline"
                  onClick={() => reload()}
                  className="bg-background"
                >
                  <IconRefresh className="mr-2" />
                  Regenerate response
                </Button>

                {link != '' && (
                  <Link href={link} target="_blank" rel="nofollow">
                    <Button size='sm' variant="link" className='bg-[#0a8323] text-[12px] text-white uppercase'>
                      <IconArrowRight className="mr-2" />
                      Заказать услугу онлайн
                    </Button>
                  </Link>
                )}
              </div>
            )
          )}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          {/* <Dictaphone /> */}
          <PromptForm
            onSubmit={async value => {
              await append({
                content: value,
                role: "user",
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
