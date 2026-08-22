// Client-side (unsigned) uploads to Cloudinary.
//
// The browser uploads the file straight to Cloudinary and we store the returned
// `secure_url` — this bypasses the backend entirely (its object storage is not
// configured and its JSON body limit is ~100KB, so files can't go through it).
//
// Configure two PUBLIC values (safe to expose to the browser — that is how
// unsigned uploads work; never put the Cloudinary API *secret* in the client):
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME     e.g. "dsa-portal"
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  an *unsigned* upload preset name
//
// In Cloudinary: Settings → Upload → Upload presets → add an **Unsigned** preset
// (optionally lock it down: allowed formats, a target folder, max file size).

// These are PUBLIC values (cloud name + an *unsigned* preset) — they ship in the
// client bundle on the live site regardless, so committing them as defaults is
// safe and means uploads work in every environment without per-host env config.
// Override per-environment with the NEXT_PUBLIC_CLOUDINARY_* vars if needed.
// (Lock the preset down in Cloudinary — allowed formats, folder, limits — to
// limit abuse, since any unsigned preset is by nature exposed to the browser.)
const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxpbjxzfv'
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'dsa_academy'

/** True when the two public Cloudinary env vars are set. */
export function cloudinaryConfigured(): boolean {
  return !!CLOUD_NAME && !!UPLOAD_PRESET
}

export interface CloudinaryResult {
  url: string // secure_url — the hosted file/image URL
  resourceType: string // "image" | "video" | "raw"
  format?: string
  bytes?: number
}

/**
 * Upload a file to Cloudinary and return its hosted URL.
 *
 * `resource_type=auto` lets Cloudinary handle images, video, PDFs and other raw
 * files with the same call. Throws a clear error when Cloudinary isn't
 * configured or the upload fails, so callers can fall back to a pasted link.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'dsa',
): Promise<CloudinaryResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'File upload isn’t configured yet. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, then reload.',
    )
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  if (folder) form.append('folder', folder)

  let res: Response
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: form },
    )
  } catch {
    throw new Error('Could not reach Cloudinary. Check your connection and try again.')
  }

  const data = (await res.json().catch(() => null)) as
    | {
        secure_url?: string
        resource_type?: string
        format?: string
        bytes?: number
        error?: { message?: string }
      }
    | null

  if (!res.ok || !data?.secure_url) {
    throw new Error(
      data?.error?.message ||
        `Upload failed (HTTP ${res.status}). Please try again or paste a link.`,
    )
  }

  return {
    url: data.secure_url,
    resourceType: data.resource_type || 'raw',
    format: data.format,
    bytes: data.bytes,
  }
}
