// Client-side Paystack helper — server-initialized ("register-first") flow.
//
// The backend's POST /api/auth/register creates a PENDING student, initializes
// the Paystack transaction server-side, and returns an `accessCode`. We then
// RESUME that same transaction in the browser so the reference the user pays
// under is the one the server tracks — the Paystack webhook reconciles it and
// marks the student paid. The frontend never decides "paid"; the backend does.
//
// SECURITY: only the PUBLIC key belongs here (and it's only a fallback used by
// newTransaction, which we don't use in the main flow). The secret key stays in
// a backend env var and is used server-side to initialize/verify — never here.

const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
  'pk_test_3e62f874550fa7d7c04e46fc341c3fcfcab8f9ad'

// v2 Popup JS (a.k.a. @paystack/inline-js) — this is the one that exposes
// `resumeTransaction(accessCode)`. The legacy v1 inline.js does NOT.
const SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'

interface PaystackTransaction {
  reference: string
  [key: string]: unknown
}

interface ResumeCallbacks {
  onSuccess?: (t: PaystackTransaction) => void
  onCancel?: () => void
  onError?: (e: { message?: string }) => void
  onLoad?: (r: unknown) => void
}

interface PaystackV2Instance {
  resumeTransaction: (accessCode: string, callbacks?: ResumeCallbacks) => void
}

type PaystackV2Ctor = new () => PaystackV2Instance

function loadScript(): Promise<PaystackV2Ctor | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null)
    const w = window as unknown as { PaystackPop?: PaystackV2Ctor }
    if (w.PaystackPop) return resolve(w.PaystackPop)

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    const onReady = () => resolve(w.PaystackPop ?? null)
    if (existing) {
      existing.addEventListener('load', onReady)
      existing.addEventListener('error', () => resolve(null))
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
  // success  — user completed payment (webhook will confirm server-side)
  // cancelled — user closed the popup
  // error     — Paystack reported an error opening/processing
  // unavailable — the Paystack script couldn't load (offline / blocked)
  status: 'success' | 'cancelled' | 'error' | 'unavailable'
  reference?: string
  message?: string
}

/**
 * Resume a transaction the backend already created, using its `accessCode`.
 * Resolves when the popup closes. The amount/currency were fixed server-side at
 * register time, so nothing money-related is trusted from the client here.
 */
export function resumePaystack(params: {
  accessCode: string
}): Promise<PayResult> {
  return new Promise(async (resolve) => {
    const Paystack = await loadScript()
    if (!Paystack) return resolve({ status: 'unavailable' })

    let settled = false
    const done = (r: PayResult) => {
      if (settled) return
      settled = true
      resolve(r)
    }

    try {
      const popup = new Paystack()
      popup.resumeTransaction(params.accessCode, {
        onSuccess: (t) => done({ status: 'success', reference: t?.reference }),
        onCancel: () => done({ status: 'cancelled' }),
        onError: (e) => done({ status: 'error', message: e?.message }),
      })
    } catch (e) {
      done({
        status: 'error',
        message: e instanceof Error ? e.message : 'Paystack failed to start',
      })
    }
  })
}

// Exported so callers/tests can reference the key origin if needed.
export const PAYSTACK_PUBLIC_KEY = PUBLIC_KEY
