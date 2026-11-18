
import { randomUUID } from "node:crypto";
import { Command } from "@langchain/langgraph";
import { customerSupportGraph } from "../graph/graph";
import { HttpError } from "../utils/http-error";

const getConfig = (threadId: string) => ({
  configurable: {
    thread_id: threadId,
  },
});

function getPendingInterrupt(snapshot: any) {
  for (const task of snapshot.tasks ?? []) {
    for (const interrupt of task.interrupts ?? []) {
      return interrupt.value;
    }
  }

  return undefined;
}

function isEmptySnapshot(snapshot: any) {
  return (
    !snapshot || !snapshot.values || Object.keys(snapshot.values).length === 0
  );
}

// Threads currently being resumed; blocks concurrent double-submits
const resumingThreads = new Set<string>();

async function resumeThread(
  threadId: string,
  expectedType: string,
  notWaitingMessage: string,
  resumeValue: unknown
) {
  if (resumingThreads.has(threadId)) {
    throw new HttpError(409, "This support request is already being processed.");
  }

  resumingThreads.add(threadId);

  try {
    const config = getConfig(threadId);

    const snapshot = await customerSupportGraph.getState(config);

    if (isEmptySnapshot(snapshot)) {
      throw new HttpError(404, "Support request not found.");
    }

    const pending = getPendingInterrupt(snapshot);

    if (pending?.type !== expectedType) {
      throw new HttpError(409, notWaitingMessage);
    }

    await customerSupportGraph.invoke(
      new Command({ resume: resumeValue }),
      config
    );

    const updatedSnapshot = await customerSupportGraph.getState(config);

    return formatSession(updatedSnapshot);
  } finally {
    resumingThreads.delete(threadId);
  }
}

function formatSession(snapshot: any) {
  const pendingInteraction = getPendingInterrupt(snapshot);

  return {
    state: snapshot.values,
    next: snapshot.next,
    pendingInteraction: pendingInteraction ?? null,
    isPaused: Boolean(pendingInteraction),
    isCompleted: snapshot.next.length === 0,
  };
}

// Start a new support request
export async function startSupportRequest(
  customerId: string,
  customerMessage: string
) {
  const threadId = randomUUID();

  const config = getConfig(threadId);

  await customerSupportGraph.invoke(
    {
      customerId,
      customerMessage,
      needsClarification: false,
      requiresHuman: false,
    },
    config
  );

  const snapshot = await customerSupportGraph.getState(config);

  return {
    threadId,
    ...formatSession(snapshot),
  };
}

// Resume after customer selects an order
export async function submitOrderSelection(
  threadId: string,
  orderId: string
) {
  return resumeThread(
    threadId,
    "order_clarification",
    "This support request is not waiting for order selection.",
    { orderId }
  );
}

// Resume after support representative approves/rejects
export async function submitApproval(
  threadId: string,
  approved: boolean,
  feedback?: string
) {
  return resumeThread(
    threadId,
    "human_approval",
    "This support request is not waiting for approval.",
    { approved, feedback }
  );
}

// Retrieve the current support request state
export async function getSupportRequest(threadId: string) {
  const config = getConfig(threadId);

  const snapshot = await customerSupportGraph.getState(config);

  if (isEmptySnapshot(snapshot)) {
    throw new HttpError(404, "Support request not found.");
  }

  return {
    threadId,
    ...formatSession(snapshot),
  };
}
