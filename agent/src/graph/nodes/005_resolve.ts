
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { env } from "../../utils/env";
import type { State } from "../types";


const ResolveSchema = z.object({
    resolution: z.string().min(10).max(500),
    response: z.string().min(10).max(1000)
})

type ResolveOutput = z.infer<typeof ResolveSchema>

function makeModel () {
    return new ChatGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
        model: env.GOOGLE_MODEL,
        temperature: 0.2
    })
}

const SYSTEM_PROMPT = `
    You are an experienced e-commerce customer support assistant.

    Your responsibility is to propose an appropriate resolution
    and draft a response for the customer.

    Rules:
    - Use only the customer information and verified order details provided.
    - Never invent order information.
    - Never claim that a refund, cancellation, or other action has already been completed.
    - Do not promise outcomes that are not supported by the available information.
    - Consider the customer's intent and sentiment.
    - Be professional, empathetic, and concise.
    - If the available information is insufficient, recommend escalation to a human support representative.
    - Return structured output matching the supplied schema.

    The resolution is an internal recommendation for the support team.
    The response is the proposed message for the customer.
`

function createHumanPrompt(state: State): string{
    return `
        CUSTOMER INFORMATION

        Customer ID: ${state.customerId}

        Customer message:
        ${state.customerMessage}

        CUSTOMER INTENT
        ${state.intent}

        CUSTOMER SENTIMENT
        ${state.sentiment}

        VERIFIED ORDER INFORMATION

        Order ID: ${state.orderId ?? "Not available"}

        Order status: ${state.orderDetails?.status ?? "Not available"}

        Order amount: ${state.orderDetails?.amount ?? "Not available"}

        Expected delivery date:
        ${state.orderDetails?.deliveryDate ?? "Not available"}

        Based on this information:

        1. Recommend an appropriate resolution for the support team.
        2. Draft a suitable response to the customer.

        Remember: Do not claim that any action has already been performed.
    `
}


export async function ResolveNode(state: State): Promise<Partial<State>> {
    if (!state.orderId || !state.orderDetails) {
        return {
            status: "escalated",
            requiresHuman: true,
            message: "Verified order information is missing. Human investigation is required"
        }
    }

    try {
        const model = makeModel()
        const structuredModel = model.withStructuredOutput(ResolveSchema)

        const output: ResolveOutput = await structuredModel.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(createHumanPrompt(state))
        ])

        return {
            resolution: output.resolution,
            response: output.response,
            requiresHuman: true,
            approved: undefined,
            status: "awaiting_approval",
            message: "Resolution generated. Awaiting support agent approval"
        }
    } catch (error) {
        console.error("Resolved faild", error)
        return {
            status: "escalated",
            requiresHuman: true,
            message: "Unable to generate a resolution. Human support is required.",
        }
    }
}