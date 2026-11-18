import type { State } from "../types"



const MIN_MESSAGE_LENGTH = 5
const MAX_MESSAGE_LENGTH = 2000


export async function ValidateNode(state: State): Promise<Partial<State>> {
    const customerId = state.customerId?.trim()
    if (!customerId) {
        return {
            status: "rejected",
            message: "Customer ID is required"
        }
    }

    const customerMessage = state.customerMessage?.trim()
    if (!customerMessage) {
        return {
            status: "rejected",
            message: "Customer message is cannot be empty"
        }
    }

    if (customerMessage.length < MIN_MESSAGE_LENGTH) {
        return {
            status: "rejected",
            message: "Customer message is too short"
        }
    }

    if (customerMessage.length > MAX_MESSAGE_LENGTH) {
        return {
            status: "rejected",
            message: `Customer message canot exceed ${MAX_MESSAGE_LENGTH} characters`
        }
    }

    return {
        customerId,
        customerMessage,
        status: "received",
        message: "Customer information validated successfully"
    }
}