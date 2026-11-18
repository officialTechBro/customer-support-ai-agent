
import { END, MemorySaver, START, StateGraph,} from "@langchain/langgraph";
import { CustomerSupportState } from "./types";
import type { State } from "./types";
import { ValidateNode } from "./nodes/001_validate";
import { AnalyzeNode } from "./nodes/002_analyze";
import { InvestigateNode } from "./nodes/003_investigate";
import { ClarificationNode } from "./nodes/004_clarification";
import { ResolveNode } from "./nodes/005_resolve";
import { ApproveNode } from "./nodes/006_approve";
import { SendResponseNode } from "./nodes/007_send_response";
import { FinalizeNode } from "./nodes/008_finalize";


// Routing function
function routeAfterValidation(state: State) {
  if (state.status === "rejected") {
    return "finalize";
  }

  return "analyze";
}

function routeAfterInvestigation(state: State) {
  if (state.needsClarification) {
    return "clarification";
  }

  if (state.status === "escalated") {
    return "finalize";
  }

  return "resolve";
}

function routeAfterClarification(state: State) {
  if (state.needsClarification) {
    return "clarification";
  }

  return "investigate";
}

function routeAfterResolution(state: State) {
  if (state.status === "escalated") {
    return "finalize";
  }

  return "approve";
}

function routeAfterApproval(state: State) {
  if (state.approved === true) {
    return "send_response";
  }

  return "finalize";
}

function routeAfterSending(state: State) {
  if (state.status === "escalated") {
    return "finalize";
  }

  return "finalize";
}




// Build graph
const workflow = new StateGraph(CustomerSupportState)

  // Register nodes
  .addNode("validate", ValidateNode)
  .addNode("analyze", AnalyzeNode)
  .addNode("investigate", InvestigateNode)
  .addNode("clarification", ClarificationNode)
  .addNode("resolve", ResolveNode)
  .addNode("approve", ApproveNode)
  .addNode("send_response", SendResponseNode)
  .addNode("finalize", FinalizeNode)

  // Starting point
  .addEdge(START, "validate")

  // Validation routing
  .addConditionalEdges( "validate", routeAfterValidation, {
      analyze: "analyze",
      finalize: "finalize",
    }
  )

  // Analyze -> Investigate
  .addEdge("analyze", "investigate")

  // Investigation routing
  .addConditionalEdges( "investigate", routeAfterInvestigation, {
      clarification: "clarification",
      resolve: "resolve",
      finalize: "finalize",
    }
  )

  // Customer clarification routing
  .addConditionalEdges( "clarification", routeAfterClarification, {
      clarification: "clarification",
      investigate: "investigate",
    }
  )

  // Resolution routing
  .addConditionalEdges( "resolve", routeAfterResolution, {
      approve: "approve",
      finalize: "finalize",
    }
  )

  // Human approval routing
  .addConditionalEdges( "approve", routeAfterApproval, {
      send_response: "send_response",
      finalize: "finalize",
    }
  )

  // Response delivery
  .addConditionalEdges( "send_response", routeAfterSending, {
      finalize: "finalize",
    }
  )

  // Final node
  .addEdge("finalize", END);


// checkpointer
const checkpointer = new MemorySaver();

export const customerSupportGraph = workflow.compile({
  checkpointer,
});
