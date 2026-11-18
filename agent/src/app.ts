
import express from "express";
import supportRoutes from "./routes/support";

const app = express();

app.use(express.json());

app.use("/api/support", supportRoutes);

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // HttpError uses `status`; body-parser errors (e.g. malformed JSON) use `status`/`statusCode`
  const status: number = error?.status ?? error?.statusCode ?? 500;
  const isClientError = status >= 400 && status < 500;

  if (!isClientError) {
    console.error(error);
  }

  res.status(isClientError ? status : 500).json({
    message: isClientError
      ? error.message || "Bad request."
      : "Internal server error.",
  });
});

export default app;
