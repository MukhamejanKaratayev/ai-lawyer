import { Milvus } from 'langchain/vectorstores/milvus'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function paperIntent(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { message } = JSON.parse(req.body)

  const vectorStore = await Milvus.fromExistingCollection(
    new OpenAIEmbeddings(),
    {
      collectionName: 'afsaindextest',
      url: process.env.MILVUS_URL,
      username: process.env.MILVUS_USERNAME,
      password: process.env.MILVUS_PASSWORD
    }
  )


  // console.log(messages);

  // send messages to milvus

  const response = await vectorStore.similaritySearch(
    message,
    2
  )
  console.log(response)
}
