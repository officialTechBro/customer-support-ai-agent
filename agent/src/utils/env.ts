import "dotenv/config"
import {z} from 'zod'

const envSchema = z.object({
    PORT: z.string().min(1, "PORT is required"),
    GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),
    GEMINI_MODEL: z.string().min(1, "GEMINI_MODEL is required (e.g. gemini-2.5-flash)"),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
    const problems = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")
    throw new Error(`Error parsing env: ${problems}`)
}

const raw = parsed.data

export const env = Object.freeze({
    PORT: raw.PORT,
    GOOGLE_API_KEY: raw.GOOGLE_API_KEY,
    GOOGLE_MODEL: raw.GEMINI_MODEL,
    OPENAI_KEY: raw.OPENAI_API_KEY,
    OPENAI_MODEL: raw.OPENAI_MODEL,
})
