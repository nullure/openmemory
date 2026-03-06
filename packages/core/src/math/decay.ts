const validate_inputs = (dt_ms: number, lambda: number): void => {
    if (dt_ms < 0) throw new Error("invalid dt")
    if (lambda < 0) throw new Error("invalid lambda")
}

export const decay_factor = (dt_ms: number, lambda: number): number => {
    validate_inputs(dt_ms, lambda)
    const dt = dt_ms / 1000
    return Math.exp(-lambda * dt)
}

export const apply_decay = (value: number, dt_ms: number, lambda: number): number =>
    value * decay_factor(dt_ms, lambda)
