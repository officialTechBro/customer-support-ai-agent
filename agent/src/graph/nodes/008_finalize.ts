
import type { State } from "../types.js";

export async function FinalizeNode(state: State): Promise<Partial<State>> {

  // 1. Customer input was invalid
  if (state.status === "rejected") {
    return {
      requiresHuman: false,
      message:
        state.message ?? "Your support request could not be processed.",
    };
  }

  // 2. Request requires manual investigation
  if (state.status === "escalated") {
    return {
      requiresHuman: true,
      message:
        state.message ?? "Your request has been escalated to our support team.",
    };
  }

  // 3. Support representative rejected the proposed resolution
  if (state.approved === false) {
    return {
      status: "rejected",
      requiresHuman: true,
      message:
        state.message ?? "The proposed resolution was not approved and requires further review.",
    };
  }

  // 4. Approval has not been completed
  if (state.approved !== true) {
    return {
      status: "awaiting_approval",
      requiresHuman: true,
      message: "Your request is waiting for support team approval.",
    };
  }

  // 5. Ensure a response was successfully sent
  if (!state.messageId || !state.sentAt) {
    return {
      status: "escalated",
      requiresHuman: true,
      message: "The response could not be confirmed as delivered. Human follow-up is required.",
    };
  }

  // 6. Everything completed successfully
  return {
    status: "resolved",
    requiresHuman: false,
    message: "Your support request has been successfully resolved.",
  };
}
