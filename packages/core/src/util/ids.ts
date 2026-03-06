import { randomBytes } from "node:crypto"

export const generateId = (size = 16): string => {
    const bytes = randomBytes(size)
    return bytes.toString("base64url")
}
