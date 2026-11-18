
import { Router } from "express";

import {
  createSupportRequest,
  clarifySupportRequest,
  approveSupportRequest,
  getSupportRequestStatus,
} from "../controller/support.controller";

const router = Router();

// Start a new customer support request
router.post("/requests", createSupportRequest);

// Customer selects an order
router.post(
  "/:threadId/clarification",
  clarifySupportRequest
);

// Support representative approves/rejects resolution
router.post(
  "/:threadId/approval",
  approveSupportRequest
);

// Get current support request state
router.get(
  "/:threadId",
  getSupportRequestStatus
);

export default router;
