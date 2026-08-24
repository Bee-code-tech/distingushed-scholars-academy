'use client'

// Community — a single shared channel for tutors and students.
//
//  • Tutors  : text, photo, video, document (pdf/doc) and voice notes.
//  • Students: text, photo, video and document (pdf/doc) — no voice notes.
//  • Admin   : read-only moderation — sees every message and can delete any.
//
// Files upload straight to Cloudinary from the browser (see lib/cloudinary.ts);
// only the hosted URL is sent to the API. Messages sync by polling the channel.
// Role rules are also enforced server-side — this component only shapes the UI.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Mic,
  Trash2,
  Loader2,
  Plus,
  Download,
  AlertCircle,
} from 'lucide-react'
import { dsaApi } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

type Mode = 'tutor' | 'student' | 'admin'
type MsgType = 'text' | 'image' | 'video' | 'audio' | 'file'

interface Msg {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  type: MsgType
  text?: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  durationSec?: number
  createdAt: number
  own: boolean
}

// Largest file we let the browser attempt (Cloudinary's unsigned preset caps it
// too; this just fails fast with a friendly message before the upload starts).
const MAX_BYTES = 50 * 1024 * 1024

const str = (v: unknown): string => (v == null ? '' : String(v))

function humanSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function clock(ms: number): string {
  const d = new Date(ms)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function duration(sec?: number): string {
  if (!sec || sec <= 0) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const roleLabel = (r: string): string => {
  const k = r.toLowerCase()
  if (k === 'tutor') return 'Tutor'
  if (k === 'student') return 'Student'
  if (k.includes('admin')) return 'Admin'
  return r || 'Member'
}

const roleTint = (r: string): string => {
  const k = r.toLowerCase()
  if (k === 'tutor') return 'bg-blue-50 text-[#002EFF]'
  if (k.includes('admin')) return 'bg-amber-50 text-amber-600'
  return 'bg-slate-100 text-slate-500'
}

export default function Community({
  mode,
  token,
}: {
  mode: Mode
  /** Explicit bearer token — admin passes its admin token; members omit it. */
  token?: string
}) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notReady, setNotReady] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)

  // Voice-note recording (tutors only).
  const [recording, setRecording] = useState(false)
  const [recSecs, setRecSecs] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const imageInput = useRef<HTMLInputElement | null>(null)
  const videoInput = useRef<HTMLInputElement | null>(null)
  const docInput = useRef<HTMLInputElement | null>(null)

  const canCompose = mode !== 'admin'
  const canRecord = mode === 'tutor'
  const isModerator = mode === 'admin'

  // Identify the current user so their own bubbles align right.
  const me = getUser() as
    | (ReturnType<typeof getUser> & { id?: string; _id?: string })
    | null
  const myId = str(me?.id || me?._id)
  const myName = str(me?.fullName || (me as { username?: string })?.username)

  const normalize = useCallback(
    (raw: Record<string, unknown>): Msg => {
      const sender = (raw.sender ?? raw.user ?? {}) as Record<string, unknown>
      const senderId = str(
        sender.id ?? sender._id ?? raw.senderId ?? raw.userId,
      )
      const senderName =
        str(
          sender.fullname ??
            sender.fullName ??
            sender.name ??
            sender.username ??
            raw.senderName,
        ) || 'Member'
      const senderRole = str(
        sender.role ?? raw.senderRole ?? raw.role ?? 'student',
      )
      const fileType = str(raw.fileType ?? raw.mimeType)
      let type = str(raw.type) as MsgType
      if (!type || !['text', 'image', 'video', 'audio', 'file'].includes(type)) {
        if (fileType.startsWith('image/')) type = 'image'
        else if (fileType.startsWith('video/')) type = 'video'
        else if (fileType.startsWith('audio/')) type = 'audio'
        else if (raw.fileUrl) type = 'file'
        else type = 'text'
      }
      const createdRaw = raw.createdAt ?? raw.timestamp ?? raw.date
      const createdAt =
        (createdRaw ? Date.parse(str(createdRaw)) : NaN) || Date.now()
      const own =
        (!!myId && senderId === myId) ||
        (!myId && !!myName && senderName === myName)
      return {
        id: str(raw.id ?? raw._id),
        senderId,
        senderName,
        senderRole,
        type,
        text: raw.text ? str(raw.text) : undefined,
        fileUrl: raw.fileUrl ? str(raw.fileUrl) : undefined,
        fileName: raw.fileName ? str(raw.fileName) : undefined,
        fileType: fileType || undefined,
        fileSize: typeof raw.fileSize === 'number' ? raw.fileSize : undefined,
        durationSec:
          typeof raw.durationSec === 'number' ? raw.durationSec : undefined,
        createdAt,
        own,
      }
    },
    [myId, myName],
  )

  const load = useCallback(
    async (initial = false) => {
      try {
        const rows = (await dsaApi.community.list(
          { limit: 100 },
          token,
        )) as Record<string, unknown>[]
        const mapped = rows.map(normalize).sort((a, b) => a.createdAt - b.createdAt)
        setMessages(mapped)
        setNotReady(false)
      } catch {
        // The channel endpoint may not be live yet — show a soft notice rather
        // than a crash. Sending will surface the real error inline if tried.
        if (initial) setNotReady(true)
      } finally {
        if (initial) setLoading(false)
      }
    },
    [normalize, token],
  )

  // Initial load + light polling + refresh when the tab regains focus.
  useEffect(() => {
    load(true)
    const poll = setInterval(() => load(false), 5000)
    const onFocus = () => load(false)
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(poll)
      window.removeEventListener('focus', onFocus)
    }
  }, [load])

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const post = useCallback(
    async (body: Parameters<typeof dsaApi.community.send>[0]) => {
      setError(null)
      setSending(true)
      try {
        await dsaApi.community.send(body, token)
        await load(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not send message.')
      } finally {
        setSending(false)
      }
    },
    [load, token],
  )

  const sendText = useCallback(() => {
    const t = text.trim()
    if (!t || sending) return
    setText('')
    post({ type: 'text', text: t })
  }, [text, sending, post])

  const handleFile = useCallback(
    async (file: File | null, type: MsgType) => {
      setAttachOpen(false)
      if (!file) return
      setError(null)
      if (file.size > MAX_BYTES) {
        setError(`That file is too large (max ${humanSize(MAX_BYTES)}).`)
        return
      }
      setUploading(true)
      try {
        const res = await uploadToCloudinary(file, 'dsa/community')
        await post({
          type,
          fileUrl: res.url,
          fileName: file.name,
          fileType: file.type || undefined,
          fileSize: res.bytes ?? file.size,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed.')
      } finally {
        setUploading(false)
      }
    },
    [post],
  )

  // ---- Voice notes (tutors) ----
  const startRecording = useCallback(async () => {
    setError(null)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Voice recording is not supported on this device.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data)
      }
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        if (recTimerRef.current) clearInterval(recTimerRef.current)
        const secs = recSecs
        setRecording(false)
        setRecSecs(0)
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || 'audio/webm',
        })
        if (blob.size === 0) return
        const ext = (rec.mimeType || 'audio/webm').includes('mp4') ? 'm4a' : 'webm'
        const file = new File([blob], `voice-note.${ext}`, { type: blob.type })
        setUploading(true)
        try {
          const res = await uploadToCloudinary(file, 'dsa/community')
          await post({
            type: 'audio',
            fileUrl: res.url,
            fileName: file.name,
            fileType: file.type || undefined,
            fileSize: res.bytes ?? file.size,
            durationSec: secs,
          })
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not send voice note.')
        } finally {
          setUploading(false)
        }
      }
      recorderRef.current = rec
      rec.start()
      setRecording(true)
      setRecSecs(0)
      recTimerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000)
    } catch {
      setError('Microphone permission was denied.')
    }
  }, [post, recSecs])

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop()
  }, [])

  const cancelRecording = useCallback(() => {
    const rec = recorderRef.current
    if (!rec) return
    rec.onstop = null
    rec.stream?.getTracks?.().forEach((t) => t.stop())
    try {
      rec.stop()
    } catch {
      /* already stopped */
    }
    if (recTimerRef.current) clearInterval(recTimerRef.current)
    chunksRef.current = []
    setRecording(false)
    setRecSecs(0)
  }, [])

  const remove = useCallback(
    async (id: string) => {
      const prev = messages
      setMessages((m) => m.filter((x) => x.id !== id))
      try {
        await dsaApi.community.remove(id, token)
      } catch (e) {
        setMessages(prev) // put it back if the delete failed
        setError(e instanceof Error ? e.message : 'Could not delete message.')
      }
    },
    [messages, token],
  )

  const busy = sending || uploading

  return (
    <div className='max-w-3xl mx-auto flex flex-col h-[calc(100vh-9rem)] min-h-[520px]'>
      {/* Header */}
      <div className='flex items-center justify-between px-1 pb-3'>
        <div>
          <h2 className='text-xl md:text-2xl font-black text-zinc-900 tracking-tight'>
            DSA <span className='text-[#002EFF]'>Community</span>
          </h2>
          <p className='text-[11px] font-medium text-zinc-500'>
            {isModerator
              ? 'Moderation view — every message from tutors and students.'
              : 'Chat with tutors and students. Share notes, files and updates.'}
          </p>
        </div>
        <span className='text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-600'>
          {messages.length} message{messages.length === 1 ? '' : 's'}
        </span>
      </div>

      {notReady && (
        <div className='mb-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3'>
          <AlertCircle size={16} className='text-amber-600 mt-0.5 shrink-0' />
          <p className='text-[11px] font-medium text-amber-700'>
            The community channel is being set up on the server. Once it is live,
            messages will appear here automatically.
          </p>
        </div>
      )}

      {/* Message list */}
      <div
        ref={scrollRef}
        className='flex-1 overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-4 space-y-3 custom-scrollbar'
      >
        {loading ? (
          <div className='h-full flex items-center justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' size={28} />
          </div>
        ) : messages.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center text-center px-6'>
            <div className='h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3'>
              <Send size={20} className='text-[#002EFF]' />
            </div>
            <p className='text-sm font-bold text-zinc-700'>No messages yet</p>
            <p className='text-[11px] text-zinc-400 font-medium mt-1'>
              {canCompose
                ? 'Be the first to say hello 👋'
                : 'Messages from tutors and students will show here.'}
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              m={m}
              showDelete={isModerator || m.own}
              onDelete={() => remove(m.id)}
            />
          ))
        )}
      </div>

      {error && (
        <p className='text-[11px] font-semibold text-rose-600 px-1 pt-2'>{error}</p>
      )}

      {/* Composer */}
      {canCompose && (
        <div className='pt-3'>
          {recording ? (
            <div className='flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3'>
              <span className='h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse' />
              <span className='text-xs font-black text-rose-600 tabular-nums'>
                Recording {duration(recSecs) || '0:00'}
              </span>
              <div className='ml-auto flex items-center gap-2'>
                <button
                  onClick={cancelRecording}
                  className='px-3 py-1.5 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-white'
                >
                  Cancel
                </button>
                <button
                  onClick={stopRecording}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002EFF] text-white text-[11px] font-bold'
                >
                  <Send size={12} /> Send
                </button>
              </div>
            </div>
          ) : (
            <div className='relative flex items-end gap-2'>
              {/* Attach */}
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setAttachOpen((o) => !o)}
                  disabled={busy}
                  className='h-11 w-11 shrink-0 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#002EFF] hover:border-blue-200 transition-colors disabled:opacity-50'
                  aria-label='Attach'
                >
                  {uploading ? (
                    <Loader2 size={18} className='animate-spin' />
                  ) : (
                    <Plus size={18} />
                  )}
                </button>
                {attachOpen && (
                  <div className='absolute bottom-14 left-0 w-44 rounded-2xl border border-zinc-200 bg-white shadow-xl p-1.5 z-10'>
                    <AttachItem
                      icon={ImageIcon}
                      label='Photo'
                      onClick={() => imageInput.current?.click()}
                    />
                    <AttachItem
                      icon={VideoIcon}
                      label='Video'
                      onClick={() => videoInput.current?.click()}
                    />
                    <AttachItem
                      icon={FileText}
                      label='Document'
                      onClick={() => docInput.current?.click()}
                    />
                    {canRecord && (
                      <AttachItem
                        icon={Mic}
                        label='Voice note'
                        onClick={() => {
                          setAttachOpen(false)
                          startRecording()
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendText()
                  }
                }}
                placeholder='Write a message…'
                className='flex-1 resize-none max-h-32 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#002EFF] focus:ring-2 focus:ring-[#002EFF]/10'
              />

              {canRecord && !text.trim() ? (
                <button
                  type='button'
                  onClick={startRecording}
                  disabled={busy}
                  className='h-11 w-11 shrink-0 rounded-2xl bg-[#002EFF] text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50'
                  aria-label='Record voice note'
                >
                  <Mic size={18} />
                </button>
              ) : (
                <button
                  type='button'
                  onClick={sendText}
                  disabled={busy || !text.trim()}
                  className='h-11 w-11 shrink-0 rounded-2xl bg-[#002EFF] text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40'
                  aria-label='Send'
                >
                  {sending ? (
                    <Loader2 size={18} className='animate-spin' />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={imageInput}
            type='file'
            accept='image/*'
            hidden
            onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'image')}
          />
          <input
            ref={videoInput}
            type='file'
            accept='video/*'
            hidden
            onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'video')}
          />
          <input
            ref={docInput}
            type='file'
            accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            hidden
            onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'file')}
          />
        </div>
      )}
    </div>
  )
}

function AttachItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold text-zinc-700 hover:bg-blue-50 hover:text-[#002EFF] transition-colors'
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function MessageBubble({
  m,
  showDelete,
  onDelete,
}: {
  m: Msg
  showDelete: boolean
  onDelete: () => void
}) {
  const initials = m.senderName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`flex gap-2.5 group ${m.own ? 'flex-row-reverse' : ''}`}>
      <div className='h-8 w-8 shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-black text-zinc-600'>
        {initials || '?'}
      </div>

      <div className={`max-w-[76%] ${m.own ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className='flex items-center gap-2 mb-1 px-1'>
          <span className='text-[11px] font-black text-zinc-700'>
            {m.own ? 'You' : m.senderName}
          </span>
          <span
            className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${roleTint(
              m.senderRole,
            )}`}
          >
            {roleLabel(m.senderRole)}
          </span>
          <span className='text-[9px] font-medium text-zinc-400'>
            {clock(m.createdAt)}
          </span>
          {showDelete && (
            <button
              onClick={onDelete}
              className='opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-rose-500'
              aria-label='Delete message'
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        <div
          className={`rounded-2xl overflow-hidden ${
            m.type === 'text'
              ? m.own
                ? 'bg-[#002EFF] text-white px-4 py-2.5'
                : 'bg-zinc-100 text-zinc-800 px-4 py-2.5'
              : 'bg-white border border-zinc-200 p-1.5'
          }`}
        >
          {m.type === 'text' && (
            <p className='text-[13px] leading-relaxed whitespace-pre-wrap break-words'>
              {m.text}
            </p>
          )}

          {m.type === 'image' && m.fileUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.fileUrl}
              alt={m.fileName || 'image'}
              className='rounded-xl max-h-72 w-auto object-cover cursor-pointer'
              onClick={() => window.open(m.fileUrl, '_blank')}
            />
          )}

          {m.type === 'video' && m.fileUrl && (
            <video
              src={m.fileUrl}
              controls
              className='rounded-xl max-h-72 w-full'
            />
          )}

          {m.type === 'audio' && m.fileUrl && (
            <div className='flex items-center gap-2 px-2 py-1 min-w-[220px]'>
              <audio src={m.fileUrl} controls className='w-full h-9' />
              {m.durationSec ? (
                <span className='text-[10px] font-bold text-zinc-400 tabular-nums'>
                  {duration(m.durationSec)}
                </span>
              ) : null}
            </div>
          )}

          {m.type === 'file' && m.fileUrl && (
            <a
              href={m.fileUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 px-3 py-2.5 min-w-[220px] hover:bg-blue-50/50 rounded-xl transition-colors'
            >
              <div className='h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0'>
                <FileText size={16} className='text-[#002EFF]' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[12px] font-bold text-zinc-800 truncate'>
                  {m.fileName || 'Document'}
                </p>
                <p className='text-[10px] font-medium text-zinc-400'>
                  {humanSize(m.fileSize) || 'Open'}
                </p>
              </div>
              <Download size={15} className='text-zinc-400 shrink-0' />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
