import {z} from 'zod'
import type { State } from '../types'
import { interrupt } from '@langchain/langgraph'



const ApprovalSchema = z.object({
    approved: z.boolean(),
    feedback: z.string().optional()
})

type ApprvovalDecision = z.infer<typeof ApprovalSchema>

export async function ApproveNode(state: State): Promise<Partial<State>> {

    // Ensure there is something to review
    if (!state.resolution || !state.response) {
        return {
            status: "escalated",
            requiresHuman: true,
            message: "Cannot request approval because the proposed resolution is incomplete"
        }
    }

    // Pause execution for human approval
    const decison: ApprvovalDecision = interrupt({
        type: "human_approval",
        message: "Please review the proposed customer resolution",
        customerId: state.customerId,
        customerMessage: state.customerMessage,
        orderId: state.orderId,
        orderDetails: state.orderDetails,
        resolution: state.resolution,
        response: state.response
    })


    // Validate the human decison
    const parsedDecision = ApprovalSchema.safeParse(decison)
    if (!parsedDecision.success) {
        return {
            status: "escalated",
            requiresHuman: true,
            message: "Invalid approval decision recieved"
        }
    }

    const {approved, feedback} = parsedDecision.data

    // Handle rejection
    if (!approved) {
        return {
            approved: false,
            status: 'rejected',
            requiresHuman: true,
            message: feedback ?? "The support representative rejected the proposed resoltion"
        }
    }

    // Handle approval
    return {
        approved: true,
        status: "awaiting_approval",
        requiresHuman: false,
        message: "The proposed resoltion has been approved"
    }
}