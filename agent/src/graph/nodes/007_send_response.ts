
import type { State } from "../types.js";

interface SendMessageResult {
  messageId: string;
  sentAt: string;
}

// Mock implementation for learning purposes.
// Replace this with your actual messaging service later.
async function sendCustomerMessage( customerId: string, message: string): Promise<SendMessageResult> {
  console.log("Sending message to customer...");
  console.log("Customer:", customerId);
  console.log("Message:", message);

  return {
    messageId: `MSG-${Date.now()}`,
    sentAt: new Date().toISOString(),
  };
}

export async function SendResponseNode(state: State): Promise<Partial<State>> {

  // Ensure human approval was granted
  if (state.approved !== true) {
    return {
      status: "escalated",
      requiresHuman: true,
      message: "Cannot send response without human approval.",
    };
  }

  // Ensure a response exists
  if (!state.response) {
    return {
      status: "escalated",
      requiresHuman: true,
      message: "No customer response is available to send.",
    };
  }

  try {
    const result = await sendCustomerMessage(
      state.customerId,
      state.response
    );

    return {
      messageId: result.messageId,
      sentAt: result.sentAt,
      status: "resolved",
      requiresHuman: false,
      message: "Customer response sent successfully.",
    };

  } catch (error) {
    console.error("SendResponseNode failed:", error);

    return {
      status: "escalated",
      requiresHuman: true,
      message: "Failed to send customer response. Human follow-up is required.",
    };
  }
}
