import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import {z} from 'zod'
import { env } from '../../utils/env'
import type { State } from '../types'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'

const AnalyzeSchema = z.object({
    intent: z.enum(["refund", "delivery", "payment", "technical", "other"]),
    sentiment: z.enum(["positive", "neutral", "negative"]),
    // Gemini rejects nullable schemas, so omit the field when no order ID is present
    orderId: z.string().optional()
})

type Analysis = z.infer<typeof AnalyzeSchema>

function makeModel () {
    return new ChatGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
        model: env.GOOGLE_MODEL,
        temperature: 0.2
    })
}

const SYSTEM_PROMPT = `
    You are an intelligent customer support message analyzer.

    Your task is to analyze the customer's message.

    Identify:
    - The customer's intent.
    - The customer's sentiment.
    - An order ID explicitly mentioned in the message, if any.

    Rules:
    - Choose only from the supplied intent categories.
    - Sentiment must be positive, neutral, or negative.
    - Extract an order ID only when it is explicitly present in the customer's message.
    - Never guess, generate, or infer an order ID.
    - If no order ID is explicitly mentioned, omit the orderId field.
    - Do not invent information.
    - Return structured output matching the schema.
`

function createHumanPrompt(message: string): string{
    return `
        Analyze the following customer message.

        Extract an order ID only if the customer explicitly
        included one in the message.

        Customer message:
        ${message}
    `
}


export async function AnalyzeNode(state: State): Promise<Partial<State>> {
    const model = makeModel()
    const structuredModel = model.withStructuredOutput(AnalyzeSchema)
    const output: Analysis = await structuredModel.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(createHumanPrompt(state.customerMessage))
    ])

    return {
        intent: output.intent,
        sentiment: output.sentiment,
        orderId: output.orderId?.trim() || undefined,
        status: "investigating"
    }
}