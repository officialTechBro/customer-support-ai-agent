
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { 
    startSupportRequest,
    submitOrderSelection,
    submitApproval,
    getSupportRequest,
} from "../services/support";
import { HttpError } from "../utils/http-error";


// Validation schemas
const StartRequestSchema = z.object({
  customerId: z.string().min(1),
  customerMessage: z.string().min(5).max(2000),
});

const OrderSelectionSchema = z.object({
  orderId: z.string().min(1),
});

const ApprovalSchema = z.object({
  approved: z.boolean(),
  feedback: z.string().optional(),
});

const ThreadIdSchema = z.uuid();

const getThreadId = (req: Request): string => {
  const parsed = ThreadIdSchema.safeParse(req.params.threadId);

  if (!parsed.success) {
    throw new HttpError(400, "Invalid thread id.");
  }

  return parsed.data;
};

// POST /api/support/requests
export const createSupportRequest = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = StartRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid support request.",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const result = await startSupportRequest(
      parsed.data.customerId,
      parsed.data.customerMessage
    );

    res.status(201).json({
      message: "Support request started successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/support/:threadId/clarification
export const clarifySupportRequest = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = OrderSelectionSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid order selection.",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const result = await submitOrderSelection(
      getThreadId(req),
      parsed.data.orderId
    );

    res.status(200).json({
      message: "Order selection submitted successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/support/:threadId/approval
export const approveSupportRequest = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ApprovalSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid approval decision.",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const result = await submitApproval(
      getThreadId(req),
      parsed.data.approved,
      parsed.data.feedback
    );

    res.status(200).json({
      message: "Approval decision submitted successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/support/:threadId
export const getSupportRequestStatus = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getSupportRequest(getThreadId(req));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
