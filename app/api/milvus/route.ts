import {Milvus} from "langchain/vectorstores/milvus";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export async function GET(req: Request){
    const vectorStore = await Milvus.fromExistingCollection(
        new OpenAIEmbeddings(),
        {
            collectionName: "afsaindextest",
            url: process.env.MILVUS_URL,
            username: process.env.MILVUS_USERNAME,
            password: process.env.MILVUS_PASSWORD,
        }
    )
    return await vectorStore.similaritySearch("Hello)")
}