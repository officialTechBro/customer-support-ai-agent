# AI Customer Support Agent

A customer support AI agent built with **LangChain** and **LangGraph**. It validates and analyzes incoming requests, looks up the customer's orders, asks for clarification when needed, drafts a resolution, and waits for human approval before replying.

## Workflow

```
validate -> analyze -> investigate -> (clarification) -> resolve -> approve -> send_response -> finalize
```

- **validate**: rejects invalid requests early
- **analyze**: detects intent (refund, delivery, payment, technical, other) and sentiment
- **investigate**: finds the customer's orders; asks which one if there are several
- **clarification**: pauses until the customer selects an order
- **resolve**: drafts a resolution and response
- **approve**: pauses for a support representative to approve or reject
- **send_response**: delivers the approved response
- **finalize**: sets the final status

State is persisted per thread with a LangGraph checkpointer (in-memory), so the graph can pause for the customer or a human and resume later.

## Tech stack

TypeScript, Express 5, LangChain, LangGraph, Google Gemini (OpenAI optional), Zod

## Getting started

```bash
cd agent
npm install
cp .env.example .env   # then fill in your keys
npm run dev
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | yes | Server port |
| `GOOGLE_API_KEY` | yes | Google Gemini API key |
| `GEMINI_MODEL` | yes | e.g. `gemini-2.5-flash` |
| `OPENAI_API_KEY` | no | OpenAI API key |
| `OPENAI_MODEL` | no | OpenAI model name |

Scripts: `npm run dev` (watch mode), `npm start`, `npm run typecheck`.

## API

Base path: `/api/support`

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| POST | `/requests` | `{ customerId, customerMessage }` | Start a new support request |
| POST | `/:threadId/clarification` | `{ orderId }` | Customer selects an order |
| POST | `/:threadId/approval` | `{ approved, feedback? }` | Support rep approves or rejects the resolution |
| GET | `/:threadId` | none | Get the current state of a request |

`threadId` is a UUID.

## Project structure

```
agent/src/
  controller/   request handling and validation
  routes/       Express routes
  services/     support and order logic
  graph/        LangGraph workflow, state and nodes
  utils/        env parsing, HTTP errors
```
