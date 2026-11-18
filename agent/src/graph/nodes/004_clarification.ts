import {z} from 'zod'
import type { State } from '../types'
import { interrupt } from '@langchain/langgraph'

const SelectionSchema = z.object({
    orderId: z.string().min(1)
})

export async function ClarificationNode(state: State): Promise<Partial<State>>{

    // Pause graph and wait for the customer's selection
    const selection: unknown = interrupt({
        type: "order_clarification",
        message: "We found multiple orders. Which order are you asking about",
        orders: state.orders
    })

    // validate the shape of the customers answer
    const parsedSelection = SelectionSchema.safeParse(selection)

    if (!parsedSelection.success) {
        return {
            needsClarification: true,
            status: "awaiting_clarification",
            message: "Please select a valid orderId"
        }
    }

    const selectedOrderId = parsedSelection.data.orderId

    // Make sure the selected order was actually in the list provided
    const selectedOrder = state.orders?.find(order => order.orderId === selectedOrderId)

    if (!selectedOrder) {
        return {
            needsClarification: true,
            status: "awaiting_clarification",
            message: "That order was not in the list. Please select one of the available orders"
        }
    }

    // store the validated order ID
    return {
        orderId: selectedOrder.orderId,
        needsClarification: false,
        status: "investigating",
        message: `Customer selected ${selectedOrder.orderId}`
    }
}