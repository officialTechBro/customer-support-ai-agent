import {z} from 'zod'
import type { State } from '../types'
import { getCustomerOrderById, getCustomerOrders } from '../../services/order'

const InvestigateSchema = z.object({
    orderId: z.string().min(1, "OrderId is required"),
    orderDetails: z.object({
        status: z.string(),
        amount: z.number(),
        deliveryDate: z.string().nullable()
    }),
})

type Investigate = z.infer<typeof InvestigateSchema>


export async function InvestigateNode(state: State): Promise<Partial<State>> {
    
    // Scenerio 1
    // Customer already supplied an orderID
    if (state.orderId) {
        const order = await getCustomerOrderById(state.orderId, state.customerId)
        
        if (!order) {
            return {
                status: "escalated",
                message: "We couldn't find an order matching that ID for your account"
            }
        }

        return {
            orderId: order.orderId,
            orderDetails: {
                status: order.status,
                amount: order.amount,
                deliveryDate: order.deliveryDate
            }
        }
    }


    // Scenario 2
    // No order ID was supplied
    // Retrieve all orders belonging to this customer

    const customerOrders = await getCustomerOrders(state.customerId)

    // No order found
    if (customerOrders.length === 0) {
        return {
            status: "escalated",
            message: "No orders were found for your account"
        }
    }

    // only one order found. select without asking the customer
    if (customerOrders.length === 1) {
        const order = customerOrders[0]
        if (!order) {
            return {
                status: "escalated",
                message: "We couldn't retrieve your order"
            }
        }

        return {
            orderId: order.orderId,
            orderDetails: {
                status: order.status,
                amount: order.amount,
                deliveryDate: order.deliveryDate
            }
        }
    }

    // Multiple order found
    return {
        orders: customerOrders.map(order => ({
            orderId: order.orderId,
            status: order.status,
            amount: order.amount,
            deliveryDate: order.deliveryDate
        })),
        needsClarification: true,
        status: "awaiting_clarification",
        message: "Multiple orders found. Customer selection required"
    }
}