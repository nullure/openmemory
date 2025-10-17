export const now = () => Date.now()
export const rid = () => crypto.randomUUID()
export const cos = (a: Float32Array, b: Float32Array) => {
    let s = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { const x = a[i], y = b[i]; s += x * y; na += x * x; nb += y * y }
    const d = Math.sqrt(na) * Math.sqrt(nb); return d ? s / d : 0
}
export const j = JSON.stringify
export const p = (x: string) => JSON.parse(x)
export const to_buf = (v: number[]) => {
    const f = new Float32Array(v); return Buffer.from(f.buffer)
}
export const from_buf = (b: Buffer) => new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4)