// Client-side Paystack helper.
//
// SECURITY: only the PUBLIC key belongs here. The secret key must live in a
// backend env var and is used server-side to VERIFY a transaction — never in
// the browser. This popup collects the payment; a backend must confirm it
// really succeeded before granting portal access. See docs/backend-requests.md.

const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
  'pk_test_3e62f874550fa7d7c04e46fc341c3fcfcab8f9ad'

const SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js'

interface PaystackHandler {
  openIframe: () => void
}
interface PaystackPop {
  setup: (opts: Record<string, unknown>) => PaystackHandler
}

function loadScript(): Promise<PaystackPop | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null)
    const w = window as unknown as { PaystackPop?: PaystackPop }
    if (w.PaystackPop) return resolve(w.PaystackPop)

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    const onReady = () => resolve(w.PaystackPop ?? null)
    if (existing) {
      existing.addEventListener('load', onReady)
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.onload = onReady
    s.onerror = () => resolve(null)
    document.body.appendChild(s)
  })
}

export interface PayResult {
  status: 'success' | 'cancelled' | 'unavailable'
  reference?: string
}

/**
 * Open the Paystack popup for a Naira amount. Resolves when the popup closes.
 * `status: 'unavailable'` means the script couldn't load (offline) — the caller
 * decides how to handle that.
 */
export function payWithPaystack(params: {
  email: string
  amountNaira: number
  metadata?: Record<string, unknown>
}): Promise<PayResult> {
  return new Promise(async (resolve) => {
    const Paystack = await loadScript()
    if (!Paystack) return resolve({ status: 'unavailable' })

    // Reference must be unique; keep it deterministic-ish without Math.random
    // being required (fine in the browser).
    const reference = `DSA-${Date.now()}`
    const handler = Paystack.setup({
      key: PUBLIC_KEY,
      email: params.email,
      amount: Math.round(params.amountNaira * 100), // kobo
      currency: 'NGN',
      ref: reference,
      metadata: params.metadata ?? {},
      callback: (res: { reference: string }) =>
        resolve({ status: 'success', reference: res.reference }),
      onClose: () => resolve({ status: 'cancelled', reference }),
    })
    handler.openIframe()
  })
}
