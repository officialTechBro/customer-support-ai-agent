import { Annotation } from "@langchain/langgraph";

export const CustomerSupportState = Annotation.Root({
  // Customer information
  customerId: Annotation<string>(),
  customerMessage: Annotation<string>(),

  // AI analysis
  intent: Annotation<"refund" | "delivery" | "payment" | "technical" | "other" | undefined>(),

  sentiment: Annotation<"positive" | "neutral" | "negative" | undefined>(),

  // Order investigation
  orderId: Annotation<string | undefined>(),

  orderDetails: Annotation<{
    status: string;
    amount: number;
    deliveryDate?: string;
  } | undefined>(),

  // Resolution
  resolution: Annotation<string | undefined>(),
  response: Annotation<string | undefined>(),

  // Human approval
  requiresHuman: Annotation<boolean>(),
  approved: Annotation<boolean | undefined>(),

  // Workflow status
  status: Annotation<
    | "received"
    | "investigating"
    | "awaiting_approval"
    | "resolved"
    | "escalated"
    | "rejected" 
    | "awaiting_clarification">(),

  // message
  message: Annotation<string | undefined>(),

  orders: Annotation<Array<{
    orderId: string;
    status: string;
    amount: number;
    deliveryDate?: string;
  }> | undefined>(),

needsClarification: Annotation<boolean>(),

selectedOrderId: Annotation<string | undefined>(),

messageId: Annotation<string | undefined>(),
sentAt: Annotation<string | undefined>(),

});

export type State = typeof CustomerSupportState.State;