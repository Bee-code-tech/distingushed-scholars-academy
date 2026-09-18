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

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
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
  Lock,
  Unlock,
  Pin,
  Pencil,
  Check,
  X,
  Hash,
  Users,
  UserMinus,
  BarChart3,
  Eye,
  Reply,
  SmilePlus,
  ChevronDown,
  Search,
} from 'lucide-react'
import { dsaApi } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import {
  type CommunityChannel,
  toChannel,
  getLocalChannels,
  addLocalChannel,
  removeLocalChannel,
  channelsForCategories,
} from '@/lib/communityChannels'
import {
  COURSE_CATEGORIES,
  categoryLabel,
  categoriesForStudent,
} from '@/lib/coursesStore'
import type { CourseCategory } from '@/lib/types'

type Mode = 'tutor' | 'student' | 'admin'
type MsgType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'poll'

export interface PollOption {
  index: number
  text: string
  votes: number
  voted: boolean
}

export interface PollData {
  question: string
  options: PollOption[]
  totalVotes: number
  myVote: number | null
  isQuiz: boolean
  closed: boolean
  /** Only present once the answer is revealed (you voted, or it closed). */
  correctOption?: number
}

/** The six emoji people may react with — must match the server's list. */
const REACTIONS = ['👍', '❤️', '😂', '🔥', '👏', '😮']

export interface Reaction {
  emoji: string
  count: number
  /** Whether I am one of the people who tapped it. */
  mine: boolean
}

/** Just enough of the answered message to quote it in the bubble. */
export interface ReplyPreview {
  id: string
  senderName: string
  text: string
  type: MsgType
}

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
  pinned: boolean
  poll?: PollData
  /** How many people have seen it ("seen by", WhatsApp-style). */
  readCount: number
  /** Emoji tallies, one row per emoji anyone has used. */
  reactions: Reaction[]
  /** Set when this message answers another one. */
  replyTo?: ReplyPreview
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

/** One line describing a message, for reply bars and quoted blocks. */
function previewText(m: {
  type: MsgType
  text?: string
  fileName?: string
  poll?: PollData
}): string {
  if (m.type === 'poll') return `📊 ${m.poll?.question ?? 'Poll'}`
  if (m.type === 'image') return '📷 Photo'
  if (m.type === 'video') return '🎥 Video'
  if (m.type === 'audio') return '🎤 Voice note'
  if (m.type === 'file') return `📄 ${m.fileName || 'Document'}`
  return m.text || ''
}

/** Messages are grouped under the day they were sent. */
const dayKey = (ms: number) => new Date(ms).toDateString()

function dayLabel(ms: number): string {
  const d = new Date(ms)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (dayKey(ms) === today.toDateString()) return 'Today'
  if (dayKey(ms) === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    ...(d.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' }),
  })
}

/** Where this browser last left each channel, so "New messages" lands right. */
const seenKey = (channelId: string) => `dsa_community_seen_${channelId}`

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
  // The message the next send will answer (cleared once it goes out).
  const [replyTarget, setReplyTarget] = useState<Msg | null>(null)
  // Search across the channels this person can open.
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchScope, setSearchScope] = useState<'all' | 'files' | 'links'>('all')
  const [searchHits, setSearchHits] = useState<Msg[] | null>(null)
  const [searchChannel, setSearchChannel] = useState<Record<string, string>>({})
  const [searching, setSearching] = useState(false)
  // Everything newer than this was posted since you last had the channel open.
  const [newSince, setNewSince] = useState(0)
  // Only follow new messages when you are already at the bottom — nobody wants
  // to be yanked away from something they are reading.
  const [atBottom, setAtBottom] = useState(true)
  const msgChannelRef = useRef('')
  // Poll composer (tutors / admins).
  const [pollOpen, setPollOpen] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [pollIsQuiz, setPollIsQuiz] = useState(false)
  const [pollCorrect, setPollCorrect] = useState(0)

  // Channels — General + one per programme (JAMB/Post-UTME/WAEC by department,
  // etc.). Students see General + their programme's; tutors/admin see them all.
  const [channels, setChannels] = useState<CommunityChannel[]>([])
  const [activeChannel, setActiveChannel] = useState('general')
  const [membersOpen, setMembersOpen] = useState(false)
  const [members, setMembers] = useState<
    { id: string; name: string; role: string }[]
  >([])
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSubject, setNewSubject] = useState('')
  // Admin: who may open the Community, and renaming the active channel.
  const [access, setAccess] = useState<'all' | 'paid'>('all')
  const [renameValue, setRenameValue] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [newCategory, setNewCategory] = useState<CourseCategory | ''>('')

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

  // Everyone can post. Tutors and admins additionally get voice notes; admins
  // also moderate (delete any message). Students get everything except audio.
  const canCompose = true
  const canRecord = mode === 'tutor' || mode === 'admin'
  const isModerator = mode === 'admin'
  // Tutors + admins can pin messages and lock the channel (lesson mode).
  const canManage = mode === 'tutor' || mode === 'admin'

  // Channel lock (lesson / broadcast mode): when locked, students cannot post;
  // tutors and admins still can.
  const [locked, setLockedState] = useState(false)
  const postingBlocked = locked && mode === 'student'

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
      if (
        !type ||
        !['text', 'image', 'video', 'audio', 'file', 'poll'].includes(type)
      ) {
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
        pinned: !!raw.pinned,
        poll: raw.poll ? (raw.poll as unknown as PollData) : undefined,
        readCount:
          typeof raw.readCount === 'number' ? raw.readCount : 0,
        reactions: Array.isArray(raw.reactions)
          ? (raw.reactions as Record<string, unknown>[])
              .map((r) => ({
                emoji: str(r.emoji),
                count: typeof r.count === 'number' ? r.count : 0,
                mine: !!r.mine,
              }))
              .filter((r) => r.emoji && r.count > 0)
          : [],
        replyTo: raw.replyTo
          ? (() => {
              const p = raw.replyTo as Record<string, unknown>
              return {
                id: str(p.id ?? p._id),
                senderName: str(p.senderName) || 'Member',
                text: str(p.text),
                type: (str(p.type) || 'text') as MsgType,
              }
            })()
          : undefined,
      }
    },
    [myId, myName],
  )

  const load = useCallback(
    async (initial = false) => {
      try {
        const rows = (await dsaApi.community.list(
          { limit: 100, channelId: activeChannel },
          token,
        )) as Record<string, unknown>[]
        const mapped = rows.map(normalize).sort((a, b) => a.createdAt - b.createdAt)
        setMessages(mapped)
        msgChannelRef.current = activeChannel
        setNotReady(false)
      } catch {
        // The channel endpoint may not be live yet — show a soft notice rather
        // than a crash. Sending will surface the real error inline if tried.
        if (initial) setNotReady(true)
      } finally {
        if (initial) setLoading(false)
      }
    },
    [normalize, token, activeChannel],
  )

  // Keep the channel lock state in sync (best-effort: if the settings endpoint
  // isn't live yet, treat the channel as unlocked so posting still works).
  const loadSettings = useCallback(async () => {
    try {
      const s = await dsaApi.community.getSettings(token, activeChannel)
      setLockedState(!!s?.locked)
    } catch {
      /* settings endpoint not available yet — stay unlocked */
    }
  }, [token, activeChannel])

  // Initial load + light polling + refresh when the tab regains focus.
  useEffect(() => {
    load(true)
    loadSettings()
    const poll = setInterval(() => {
      load(false)
      loadSettings()
    }, 5000)
    const onFocus = () => {
      load(false)
      loadSettings()
    }
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(poll)
      window.removeEventListener('focus', onFocus)
    }
  }, [load, loadSettings])

  // Opening a channel: remember where this browser left it, so anything newer
  // gets the "New messages" line.
  useEffect(() => {
    setAtBottom(true)
    try {
      setNewSince(Number(localStorage.getItem(seenKey(activeChannel))) || 0)
    } catch {
      setNewSince(0)
    }
  }, [activeChannel])

  // Move the mark forward as messages arrive (the divider itself stays put
  // until you leave the channel, so it doesn't vanish while you read).
  useEffect(() => {
    if (!messages.length || msgChannelRef.current !== activeChannel) return
    try {
      localStorage.setItem(
        seenKey(activeChannel),
        String(messages[messages.length - 1].createdAt),
      )
    } catch {
      /* private mode — the divider just won't survive a reload */
    }
  }, [messages, activeChannel])

  // Keep the newest message in view, unless you have scrolled up to read.
  useEffect(() => {
    const el = scrollRef.current
    if (el && atBottom) el.scrollTop = el.scrollHeight
    // `atBottom` is a condition here, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  const runSearch = useCallback(async () => {
    const q = searchTerm.trim()
    if (q.length < 2) return
    setSearching(true)
    try {
      const rows = (await dsaApi.community.search(
        { q, type: searchScope },
        token,
      )) as Record<string, unknown>[]
      const channelOf: Record<string, string> = {}
      rows.forEach((r) => {
        channelOf[str(r.id ?? r._id)] = str(r.channelId || 'general')
      })
      setSearchChannel(channelOf)
      setSearchHits(rows.map(normalize))
    } catch {
      setSearchHits([])
    } finally {
      setSearching(false)
    }
  }, [searchTerm, searchScope, token, normalize])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchTerm('')
    setSearchHits(null)
  }, [])

  const jumpToLatest = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    setAtBottom(true)
  }, [])

  const post = useCallback(
    async (body: Parameters<typeof dsaApi.community.send>[0]) => {
      setError(null)
      setSending(true)
      try {
        await dsaApi.community.send(
          {
            ...body,
            channelId: activeChannel,
            ...(replyTarget ? { replyTo: replyTarget.id } : {}),
          },
          token,
        )
        setReplyTarget(null)
        await load(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not send message.')
      } finally {
        setSending(false)
      }
    },
    [load, token, activeChannel, replyTarget],
  )

  // Tap an emoji to add it, tap it again to take it back. The bubble updates
  // straight away so it feels instant; the reload settles the real tally.
  const react = useCallback(
    async (id: string, emoji: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m
          const existing = m.reactions.find((r) => r.emoji === emoji)
          if (!existing)
            return { ...m, reactions: [...m.reactions, { emoji, count: 1, mine: true }] }
          const count = existing.count + (existing.mine ? -1 : 1)
          return {
            ...m,
            reactions: m.reactions
              .map((r) =>
                r.emoji === emoji ? { ...r, count, mine: !r.mine } : r,
              )
              .filter((r) => r.count > 0),
          }
        }),
      )
      try {
        await dsaApi.community.react(id, emoji, token)
      } catch {
        /* the next poll puts the real tally back */
      }
      load(false)
    },
    [load, token],
  )

  // Replying to a message you can no longer see (deleted mid-reply) is a dead
  // end — drop the target when it leaves the feed.
  useEffect(() => {
    if (replyTarget && !messages.some((m) => m.id === replyTarget.id))
      setReplyTarget(null)
  }, [messages, replyTarget])

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

  // Edit own message text (author only).
  const editMessage = useCallback(
    async (id: string, newText: string) => {
      setError(null)
      try {
        await dsaApi.community.update(id, { text: newText }, token)
        await load(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not edit message.')
      }
    },
    [load, token],
  )

  // Pin / unpin a message (tutor / admin).
  const togglePin = useCallback(
    async (m: Msg) => {
      setError(null)
      try {
        await dsaApi.community.update(m.id, { pinned: !m.pinned }, token)
        await load(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not pin message.')
      }
    },
    [load, token],
  )

  // Admin: load + change who can open the Community.
  useEffect(() => {
    if (mode !== 'admin') return
    let cancelled = false
    dsaApi.community
      .getAccess(token)
      .then((a) => {
        if (!cancelled) setAccess(a === 'paid' ? 'paid' : 'all')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [mode, token])

  const changeAccess = useCallback(
    async (next: 'all' | 'paid') => {
      const prev = access
      setAccess(next)
      try {
        await dsaApi.community.setAccess(next, token)
      } catch (e) {
        setAccess(prev)
        setError(
          e instanceof Error ? e.message : 'Could not change community access.',
        )
      }
    },
    [access, token],
  )

  // Post a poll — plain, or marked as a quiz with a correct option.
  const sendPoll = useCallback(async () => {
    const question = pollQuestion.trim()
    const options = pollOptions.map((o) => o.trim()).filter(Boolean)
    if (!question) return setError('Add a poll question.')
    if (options.length < 2) return setError('A poll needs at least 2 options.')
    if (pollIsQuiz && (pollCorrect < 0 || pollCorrect >= options.length)) {
      return setError('Choose which option is the correct answer.')
    }
    setError(null)
    setSending(true)
    try {
      await dsaApi.community.send(
        {
          type: 'poll',
          channelId: activeChannel,
          poll: {
            question,
            options,
            isQuiz: pollIsQuiz,
            ...(pollIsQuiz ? { correctOption: pollCorrect } : {}),
          },
        },
        token,
      )
      setPollOpen(false)
      setPollQuestion('')
      setPollOptions(['', ''])
      setPollIsQuiz(false)
      setPollCorrect(0)
      await load(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post the poll.')
    } finally {
      setSending(false)
    }
  }, [
    pollQuestion,
    pollOptions,
    pollIsQuiz,
    pollCorrect,
    activeChannel,
    token,
    load,
  ])

  // Vote on a poll — the server returns the updated tallies.
  const votePoll = useCallback(
    async (messageId: string, option: number) => {
      setError(null)
      try {
        const updated = (await dsaApi.community.vote(
          messageId,
          option,
          token,
        )) as Record<string, unknown>
        const next = normalize(updated)
        setMessages((prev) => prev.map((m) => (m.id === next.id ? next : m)))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not record your vote.')
      }
    },
    [normalize, token],
  )

  // Who has seen a message (sender taps "Seen by").
  const loadReads = useCallback(
    async (messageId: string) => {
      const rows = (await dsaApi.community.reads(messageId, token)) as Record<
        string,
        unknown
      >[]
      return rows.map((r) => ({ fullname: str(r.fullname) || 'Member' }))
    },
    [token],
  )

  // Mark everyone else's messages in this channel as seen, once they're loaded.
  useEffect(() => {
    const unseen = messages
      .filter((m) => !m.own && m.id)
      .map((m) => m.id)
      .slice(-100)
    if (!unseen.length) return
    let cancelled = false
    const id = setTimeout(() => {
      dsaApi.community
        .markRead(activeChannel, unseen, token)
        .catch(() => {})
        .finally(() => {
          if (cancelled) return
        })
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
    // Re-runs when the visible set changes; the server ignores duplicates.
  }, [messages, activeChannel, token])

  // Lock / unlock the channel (tutor / admin) — optimistic with rollback.
  const toggleLock = useCallback(async () => {
    const next = !locked
    setLockedState(next)
    setError(null)
    try {
      await dsaApi.community.setLocked(next, token, activeChannel)
    } catch (e) {
      setLockedState(!next)
      setError(
        e instanceof Error ? e.message : 'Could not change the lock state.',
      )
    }
  }, [locked, token, activeChannel])

  // ---- Channels ----
  const loadChannels = useCallback(async () => {
    let list: CommunityChannel[]
    try {
      const rows = (await dsaApi.community.channels(token)) as Record<
        string,
        unknown
      >[]
      list = rows.length ? rows.map(toChannel) : getLocalChannels()
    } catch {
      // Channels endpoint not live yet — fall back to the seeded local list so
      // the switcher still works.
      list = getLocalChannels()
    }
    let visible = list
    if (mode === 'student') {
      // Students see General + the community for each category they belong to
      // (their class AND their exam track).
      visible = channelsForCategories(list, categoriesForStudent(getUser()))
    } else if (mode === 'tutor') {
      // Tutors are scoped to the communities for the categories they teach —
      // derived from their assigned courses. Fail open (show all) if we can't
      // resolve any courses, so a tutor is never locked out of the switcher.
      try {
        const courses = (await dsaApi.courses.list(
          { tutorId: 'me' },
          token,
        )) as Record<string, unknown>[]
        const cats = [
          ...new Set(
            courses.map((c) => String(c.category ?? '')).filter(Boolean),
          ),
        ]
        if (cats.length) visible = channelsForCategories(list, cats)
      } catch {
        /* keep all channels visible */
      }
    }
    // Admin sees every channel (moderation).
    setChannels(visible)
    setActiveChannel((cur) =>
      visible.some((c) => c.id === cur) ? cur : 'general',
    )
  }, [mode, token])

  // Unread counts ride along with the channel list, so refresh it on the same
  // beat as the messages (slower — it is only a badge).
  useEffect(() => {
    loadChannels()
    const poll = setInterval(loadChannels, 15000)
    return () => clearInterval(poll)
  }, [loadChannels])

  const createChannel = useCallback(async () => {
    const name = newName.trim()
    if (!name) return
    const category = newCategory || undefined
    const subject = newSubject.trim() || undefined
    try {
      // The backend stores the category in its `track` string field; `subject`
      // scopes it further (e.g. a Physics class community).
      await dsaApi.community.createChannel(
        { name, track: category, subject },
        token,
      )
    } catch {
      addLocalChannel({ name, category: category ?? null })
    }
    setNewName('')
    setNewCategory('')
    setNewSubject('')
    setNewOpen(false)
    await loadChannels()
  }, [newName, newCategory, newSubject, token, loadChannels])

  const deleteChannel = useCallback(
    async (id: string) => {
      if (id === 'general') return
      try {
        await dsaApi.community.removeChannel(id, token)
      } catch {
        removeLocalChannel(id)
      }
      if (activeChannel === id) setActiveChannel('general')
      await loadChannels()
    },
    [token, activeChannel, loadChannels],
  )

  // Admin: rename the active channel.
  const renameChannel = useCallback(async () => {
    const name = renameValue.trim()
    if (!name) return
    setRenaming(true)
    setError(null)
    try {
      await dsaApi.community.updateChannel(activeChannel, { name }, token)
      setRenameValue('')
      await loadChannels()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not rename the channel.')
    } finally {
      setRenaming(false)
    }
  }, [renameValue, activeChannel, token, loadChannels])

  // ---- Members (tutor / admin) ----
  const loadMembers = useCallback(async () => {
    if (!(mode === 'tutor' || mode === 'admin')) return
    try {
      const rows = (await dsaApi.community.members(
        activeChannel,
        token,
      )) as Record<string, unknown>[]
      if (rows.length) {
        setMembers(
          rows.map((r) => ({
            id: str(r.id ?? r._id ?? r.userId),
            name:
              str(r.fullname ?? r.fullName ?? r.name ?? r.username) || 'Member',
            role: str(r.role ?? 'student'),
          })),
        )
        return
      }
    } catch {
      /* members endpoint not live — derive from who has posted */
    }
    const seen = new Map<string, { id: string; name: string; role: string }>()
    messages.forEach((m) => {
      if (m.senderId && !seen.has(m.senderId))
        seen.set(m.senderId, {
          id: m.senderId,
          name: m.senderName,
          role: m.senderRole,
        })
    })
    setMembers([...seen.values()])
  }, [mode, activeChannel, token, messages])

  useEffect(() => {
    if (membersOpen) loadMembers()
  }, [membersOpen, loadMembers])

  const removeMember = useCallback(
    async (userId: string) => {
      setError(null)
      const prev = members
      setMembers((ms) => ms.filter((x) => x.id !== userId))
      try {
        await dsaApi.community.removeMember(activeChannel, userId, token)
      } catch (e) {
        setMembers(prev)
        setError(
          e instanceof Error
            ? e.message
            : 'Could not remove the member (needs the backend endpoint).',
        )
      }
    },
    [activeChannel, token, members],
  )

  const busy = sending || uploading
  const pinned = messages.filter((m) => m.pinned)
  const active =
    channels.find((c) => c.id === activeChannel) ??
    ({ id: 'general', name: 'General', kind: 'general' } as CommunityChannel)
  const canManageMembers = mode === 'tutor' || mode === 'admin'
  const isAdmin = mode === 'admin'

  return (
    <div className='max-w-3xl mx-auto flex flex-col h-[calc(100vh-9rem)] min-h-[520px]'>
      {/* Header */}
      <div className='flex items-center justify-between px-1 pb-3'>
        <div>
          <h2 className='text-xl md:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2'>
            DSA <span className='text-[#002EFF]'>Community</span>
            {active.id !== 'general' && (
              <span className='text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-600'>
                {active.name}
              </span>
            )}
          </h2>
          <p className='text-[11px] font-medium text-zinc-500'>
            {isModerator
              ? 'Post updates, share files and voice notes — and delete any message.'
              : 'Chat with tutors and students. Share notes, files and updates.'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {canManageMembers && (
            <button
              onClick={() => setMembersOpen((o) => !o)}
              title='Members'
              className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-colors ${
                membersOpen
                  ? 'bg-[#002EFF] text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Users size={11} /> Members
            </button>
          )}
          {canManage && (
            <button
              onClick={toggleLock}
              title={locked ? 'Unlock the community' : 'Lock (lesson mode)'}
              className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-colors ${
                locked
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {locked ? <Lock size={11} /> : <Unlock size={11} />}
              {locked ? 'Locked' : 'Lock'}
            </button>
          )}
          <button
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
              searchOpen
                ? 'bg-[#002EFF] text-white'
                : 'bg-slate-100 text-slate-500 hover:text-[#002EFF]'
            }`}
            title='Search the community'
          >
            <Search size={11} /> Search
          </button>
          <span className='text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-600'>
            {messages.length} message{messages.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Channel switcher */}
      {channels.length > 1 && (
        <div className='mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar'>
          {channels.map((c) => {
            const on = c.id === activeChannel
            return (
              <button
                key={c.id}
                onClick={() => setActiveChannel(c.id)}
                className={`group inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition-colors ${
                  on
                    ? 'bg-[#002EFF] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Hash size={11} className={on ? 'text-white/80' : 'text-slate-400'} />
                {c.name}
                {/* What's waiting in the channels you aren't looking at */}
                {!on && !!c.unread && (
                  <span
                    className='ml-0.5 min-w-[18px] rounded-full bg-[#002EFF] px-1.5 py-0.5 text-[9px] font-black text-white tabular-nums'
                    title={
                      c.lastMessageSender && c.lastMessageText
                        ? `${c.lastMessageSender}: ${c.lastMessageText}`
                        : undefined
                    }
                  >
                    {c.unread > 99 ? '99+' : c.unread}
                  </span>
                )}
                {isAdmin && c.id !== 'general' && (
                  <span
                    role='button'
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (
                        window.confirm(`Delete the "${c.name}" community? Its messages will be removed.`)
                      )
                        deleteChannel(c.id)
                    }}
                    className={`ml-0.5 rounded-full p-0.5 ${on ? 'hover:bg-white/20' : 'hover:bg-rose-100 hover:text-rose-500'}`}
                    title='Delete community'
                  >
                    <X size={11} />
                  </span>
                )}
              </button>
            )
          })}
          {isAdmin && (
            <button
              onClick={() => setNewOpen((o) => !o)}
              className='inline-flex items-center gap-1 shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              title='Create a community'
            >
              <Plus size={12} /> New
            </button>
          )}
        </div>
      )}

      {/* Admin controls: who can open Community + rename the active channel */}
      {isAdmin && (
        <div className='mb-3 rounded-2xl border border-slate-200 bg-white p-3 flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-2'>
            <span className='text-[10px] font-black uppercase text-slate-400'>
              Access
            </span>
            <div className='inline-flex rounded-lg bg-slate-100 p-0.5'>
              {(['all', 'paid'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => changeAccess(a)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                    access === a
                      ? 'bg-white text-[#002EFF] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {a === 'all' ? 'All students' : 'Paid only'}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-2 flex-1 min-w-[220px]'>
            <span className='text-[10px] font-black uppercase text-slate-400 shrink-0'>
              Rename
            </span>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={active.name}
              className='h-9 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-[12px] font-bold flex-1 min-w-0'
            />
            <button
              onClick={renameChannel}
              disabled={!renameValue.trim() || renaming}
              className='h-9 px-3 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase hover:text-[#002EFF] disabled:opacity-50 shrink-0'
            >
              {renaming ? <Loader2 size={12} className='animate-spin' /> : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* New-channel form (admin) */}
      {isAdmin && newOpen && (
        <div className='mb-3 rounded-2xl border border-slate-200 bg-white p-3 space-y-2'>
          <p className='text-[10px] font-black uppercase text-slate-400'>
            New community
          </p>
          <div className='flex flex-wrap items-center gap-2'>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='Name (e.g. SS1, JAMB)'
              className='h-9 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-[12px] font-bold flex-1 min-w-[160px]'
            />
            <select
              value={newCategory}
              onChange={(e) => {
                const cat = e.target.value as CourseCategory | ''
                setNewCategory(cat)
                // Prefill the name from the category label if left blank.
                if (cat && !newName.trim()) setNewName(categoryLabel(cat))
              }}
              className='h-9 px-2 rounded-lg bg-slate-50 border border-slate-200 outline-none text-[12px] font-black'
            >
              <option value=''>No class/track (everyone)</option>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder='Subject (optional, e.g. Physics)'
              title='Scope this community to a subject — e.g. a Physics class'
              className='h-9 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-[12px] font-bold flex-1 min-w-[150px]'
            />
            <button
              onClick={createChannel}
              disabled={!newName.trim()}
              className='h-9 px-4 rounded-lg bg-[#002EFF] text-white text-[10px] font-black uppercase hover:bg-blue-700 disabled:opacity-50'
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Members panel (tutor / admin) */}
      {canManageMembers && membersOpen && (
        <div className='mb-3 rounded-2xl border border-slate-200 bg-white p-3'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-[10px] font-black uppercase text-slate-400 flex items-center gap-1'>
              <Users size={12} /> Members of {active.name}
            </p>
            <button
              onClick={() => setMembersOpen(false)}
              className='text-slate-400 hover:text-slate-600'
            >
              <X size={14} />
            </button>
          </div>
          {members.length === 0 ? (
            <p className='text-[11px] font-medium text-slate-400 py-2'>
              No members to show yet.
            </p>
          ) : (
            <div className='space-y-1 max-h-52 overflow-y-auto custom-scrollbar'>
              {members.map((mem) => (
                <div
                  key={mem.id}
                  className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50'
                >
                  <span className='text-[11px] font-bold text-zinc-700 flex-1 truncate'>
                    {mem.name}
                  </span>
                  <span
                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${roleTint(mem.role)}`}
                  >
                    {roleLabel(mem.role)}
                  </span>
                  {mem.role.toLowerCase() === 'student' && (
                    <button
                      onClick={() => removeMember(mem.id)}
                      className='p-1 text-slate-300 hover:text-rose-500'
                      title='Remove from this community'
                    >
                      <UserMinus size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {notReady && (
        <div className='mb-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3'>
          <AlertCircle size={16} className='text-amber-600 mt-0.5 shrink-0' />
          <p className='text-[11px] font-medium text-amber-700'>
            The community channel is being set up on the server. Once it is live,
            messages will appear here automatically.
          </p>
        </div>
      )}

      {locked && (
        <div className='mb-3 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5'>
          <Lock size={14} className='text-rose-500 shrink-0' />
          <p className='text-[11px] font-bold text-rose-600'>
            {canManage
              ? 'Lesson mode — the community is locked. Students can’t post; you still can.'
              : 'The community is locked by a tutor right now. You can read but not post.'}
          </p>
        </div>
      )}

      {pinned.length > 0 && (
        <div className='mb-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-3 py-2'>
          <p className='text-[9px] font-black uppercase tracking-widest text-[#002EFF] mb-1.5 flex items-center gap-1'>
            <Pin size={10} /> Pinned
          </p>
          <div className='space-y-1'>
            {pinned.map((m) => (
              <div key={m.id} className='flex items-center gap-2 text-[11px]'>
                <span className='font-black text-zinc-700 shrink-0'>
                  {m.own ? 'You' : m.senderName}:
                </span>
                <span className='text-zinc-600 truncate'>
                  {m.type === 'text'
                    ? m.text
                    : `📎 ${m.fileName || m.type}`}
                </span>
                {canManage && (
                  <button
                    onClick={() => togglePin(m)}
                    className='ml-auto text-[#002EFF] hover:text-rose-500 shrink-0'
                    title='Unpin'
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search — results replace the feed until it is closed */}
      {searchOpen && (
        <div className='mb-3 rounded-2xl border border-slate-200 bg-white p-3 space-y-2'>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <Search
                size={13}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'
              />
              <input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch()
                  if (e.key === 'Escape') closeSearch()
                }}
                placeholder='Search messages, files and links…'
                className='w-full h-9 pl-8 pr-3 rounded-xl bg-zinc-50 text-[13px] font-medium outline-none focus:bg-white focus:ring-1 focus:ring-[#002EFF]/30'
              />
            </div>
            <button
              onClick={runSearch}
              disabled={searchTerm.trim().length < 2 || searching}
              className='h-9 px-3 rounded-xl bg-[#002EFF] text-white text-[10px] font-black uppercase tracking-wide disabled:opacity-40'
            >
              {searching ? <Loader2 size={13} className='animate-spin' /> : 'Find'}
            </button>
            <button
              onClick={closeSearch}
              className='h-9 w-9 grid place-items-center rounded-xl text-zinc-400 hover:bg-zinc-100'
              aria-label='Close search'
            >
              <X size={14} />
            </button>
          </div>
          <div className='flex items-center gap-1'>
            {(['all', 'files', 'links'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSearchScope(s)}
                className={`px-2.5 h-7 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                  searchScope === s
                    ? 'bg-blue-50 text-[#002EFF]'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {s === 'all' ? 'Messages' : s}
              </button>
            ))}
          </div>

          {searchHits && (
            <div className='max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar'>
              {searchHits.length === 0 ? (
                <p className='py-4 text-center text-[11px] font-bold text-zinc-400'>
                  Nothing matched “{searchTerm.trim()}”.
                </p>
              ) : (
                <>
                  <p className='text-[9px] font-black uppercase tracking-widest text-zinc-400'>
                    {searchHits.length} result
                    {searchHits.length === 1 ? '' : 's'}
                  </p>
                  {searchHits.map((h) => {
                    const where = searchChannel[h.id] || 'general'
                    const channelName =
                      channels.find((c) => c.id === where)?.name || where
                    return (
                      <button
                        key={h.id}
                        onClick={() => {
                          setActiveChannel(where)
                          closeSearch()
                        }}
                        className='w-full text-left rounded-xl bg-zinc-50 px-3 py-2 hover:bg-blue-50/60'
                      >
                        <span className='flex items-center gap-1.5 text-[10px] font-black text-[#002EFF]'>
                          <Hash size={10} />
                          {channelName}
                          <span className='font-bold text-zinc-400'>
                            · {h.senderName} ·{' '}
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                        <span className='mt-0.5 block text-[12px] font-medium text-zinc-700 line-clamp-2'>
                          {previewText(h)}
                        </span>
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message list */}
      <div className='relative flex-1 min-h-0'>
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80)
        }}
        className='h-full overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-4 space-y-3 custom-scrollbar'
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
          (() => {
            let lastDay = ''
            let dividerPlaced = false
            return messages.map((m, i) => {
              const day = dayKey(m.createdAt)
              const newDay = day !== lastDay
              lastDay = day
              const prev = messages[i - 1]
              // A run of messages from one person within five minutes reads as
              // one block, the way a phone chat does.
              const grouped =
                !newDay &&
                !!prev &&
                prev.senderId === m.senderId &&
                !m.replyTo &&
                m.createdAt - prev.createdAt < 5 * 60 * 1000
              const firstUnread =
                !dividerPlaced && !!newSince && m.createdAt > newSince && !m.own
              if (firstUnread) dividerPlaced = true
              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <div className='flex items-center justify-center py-1'>
                      <span className='sticky top-0 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-500'>
                        {dayLabel(m.createdAt)}
                      </span>
                    </div>
                  )}
                  {firstUnread && (
                    <div className='flex items-center gap-2 py-0.5'>
                      <span className='h-px flex-1 bg-[#002EFF]/30' />
                      <span className='text-[9px] font-black uppercase tracking-widest text-[#002EFF]'>
                        New messages
                      </span>
                      <span className='h-px flex-1 bg-[#002EFF]/30' />
                    </div>
                  )}
                  <MessageBubble
                    m={m}
                    grouped={grouped}
                    showDelete={isModerator || m.own}
                    canEdit={m.own && m.type === 'text'}
                    canPin={canManage}
                    onDelete={() => remove(m.id)}
                    onEdit={(newText) => editMessage(m.id, newText)}
                    onPin={() => togglePin(m)}
                    onVote={(option) => votePoll(m.id, option)}
                    onSeen={() => loadReads(m.id)}
                    canReply={canCompose && !postingBlocked}
                    onReply={() => setReplyTarget(m)}
                    onReact={(emoji) => react(m.id, emoji)}
                  />
                </Fragment>
              )
            })
          })()
        )}
      </div>

      {/* Jump back down — only while you are reading further up */}
      {!atBottom && messages.length > 0 && (
        <button
          onClick={jumpToLatest}
          className='absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-[#002EFF] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-lg hover:bg-blue-700'
        >
          <ChevronDown size={13} /> Latest
        </button>
      )}
      </div>

      {error && (
        <p className='text-[11px] font-semibold text-rose-600 px-1 pt-2'>{error}</p>
      )}

      {/* Composer */}
      {postingBlocked ? (
        <div className='pt-3'>
          <div className='flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] font-bold text-zinc-500'>
            <Lock size={14} className='text-zinc-400 shrink-0' />
            The community is locked. Only tutors can post right now.
          </div>
        </div>
      ) : canCompose ? (
        <div className='pt-3'>
          {replyTarget && !recording && (
            <div className='flex items-start gap-2 rounded-t-2xl border border-b-0 border-zinc-200 bg-zinc-50 px-3 py-2'>
              <span className='mt-0.5 h-full w-0.5 rounded-full bg-[#002EFF] self-stretch' />
              <div className='min-w-0 flex-1'>
                <p className='text-[10px] font-black uppercase tracking-wide text-[#002EFF]'>
                  Replying to {replyTarget.own ? 'yourself' : replyTarget.senderName}
                </p>
                <p className='text-[11px] font-medium text-zinc-500 truncate'>
                  {previewText(replyTarget)}
                </p>
              </div>
              <button
                onClick={() => setReplyTarget(null)}
                className='shrink-0 rounded-lg p-1 text-zinc-400 hover:bg-white hover:text-zinc-700'
                aria-label='Cancel reply'
              >
                <X size={13} />
              </button>
            </div>
          )}
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
              {/* Poll composer */}
              {pollOpen && (
                <div className='absolute bottom-14 left-0 right-0 z-20 rounded-2xl border border-zinc-200 bg-white shadow-xl p-3 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <p className='text-[11px] font-black uppercase tracking-wide text-zinc-500 flex items-center gap-1.5'>
                      <BarChart3 size={13} className='text-[#002EFF]' /> New poll
                    </p>
                    <button
                      onClick={() => setPollOpen(false)}
                      className='text-zinc-400 hover:text-rose-500'
                      aria-label='Close poll composer'
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder='Ask a question…'
                    className='w-full h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 outline-none text-[13px] font-bold focus:border-[#002EFF]/40'
                  />

                  <div className='space-y-1.5'>
                    {pollOptions.map((o, i) => (
                      <div key={i} className='flex items-center gap-2'>
                        {pollIsQuiz && (
                          <input
                            type='radio'
                            name='poll-correct'
                            checked={pollCorrect === i}
                            onChange={() => setPollCorrect(i)}
                            title='Mark as the correct answer'
                            className='accent-emerald-600 shrink-0'
                          />
                        )}
                        <input
                          value={o}
                          onChange={(e) =>
                            setPollOptions((prev) =>
                              prev.map((p, idx) => (idx === i ? e.target.value : p)),
                            )
                          }
                          placeholder={`Option ${i + 1}`}
                          className='flex-1 h-9 px-3 rounded-lg bg-zinc-50 border border-zinc-200 outline-none text-[12px] font-medium focus:border-[#002EFF]/40'
                        />
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() =>
                              setPollOptions((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            className='text-zinc-300 hover:text-rose-500 shrink-0'
                            aria-label={`Remove option ${i + 1}`}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 10 && (
                      <button
                        onClick={() => setPollOptions((prev) => [...prev, ''])}
                        className='inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#002EFF] hover:underline'
                      >
                        <Plus size={11} /> Add option
                      </button>
                    )}
                  </div>

                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={pollIsQuiz}
                      onChange={(e) => setPollIsQuiz(e.target.checked)}
                      className='h-4 w-4 accent-[#002EFF]'
                    />
                    <span className='text-[11px] font-bold text-zinc-600'>
                      Mark as a quiz (reveals the answer after voting)
                    </span>
                  </label>

                  <button
                    onClick={sendPoll}
                    disabled={sending}
                    className='w-full h-10 rounded-xl bg-[#002EFF] text-white font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    {sending ? (
                      <Loader2 size={14} className='animate-spin' />
                    ) : (
                      <Send size={14} />
                    )}
                    Post poll
                  </button>
                </div>
              )}

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
                    {canManage && (
                      <AttachItem
                        icon={BarChart3}
                        label='Poll'
                        onClick={() => {
                          setAttachOpen(false)
                          setPollOpen(true)
                        }}
                      />
                    )}
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
      ) : null}
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
  grouped,
  showDelete,
  canEdit,
  canPin,
  onDelete,
  onEdit,
  onPin,
  onVote,
  onSeen,
  canReply,
  onReply,
  onReact,
}: {
  m: Msg
  /** Follows another message from the same person, moments earlier. */
  grouped: boolean
  showDelete: boolean
  canEdit: boolean
  canPin: boolean
  onDelete: () => void
  onEdit: (newText: string) => void
  onPin: () => void
  onVote: (option: number) => void
  onSeen: () => Promise<{ fullname: string }[]>
  canReply: boolean
  onReply: () => void
  onReact: (emoji: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(m.text ?? '')
  const [pickerOpen, setPickerOpen] = useState(false)
  // "Seen by" — names are fetched only when the sender taps the row.
  const [seen, setSeen] = useState<{ fullname: string }[] | null>(null)
  const [seenLoading, setSeenLoading] = useState(false)
  const toggleSeen = async () => {
    if (seen) return setSeen(null)
    setSeenLoading(true)
    try {
      setSeen(await onSeen())
    } catch {
      setSeen([])
    } finally {
      setSeenLoading(false)
    }
  }

  const initials = m.senderName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const saveEdit = () => {
    const t = draft.trim()
    setEditing(false)
    if (t && t !== m.text) onEdit(t)
  }

  return (
    <div
      className={`flex gap-2.5 group ${m.own ? 'flex-row-reverse' : ''} ${
        grouped ? '-mt-2' : ''
      }`}
    >
      {grouped ? (
        <div className='h-8 w-8 shrink-0' aria-hidden />
      ) : (
        <div className='h-8 w-8 shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-black text-zinc-600'>
          {initials || '?'}
        </div>
      )}

      <div className={`max-w-[76%] ${m.own ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className='flex items-center gap-2 mb-1 px-1'>
          {!grouped && (
            <>
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
            </>
          )}
          <span className='text-[9px] font-medium text-zinc-400'>
            {clock(m.createdAt)}
          </span>
          {m.pinned && (
            <Pin size={11} className='text-[#002EFF] fill-[#002EFF]/20' />
          )}
          <span className='flex items-center gap-1.5'>
            <span className='relative'>
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className={`transition-opacity text-zinc-300 hover:text-[#002EFF] ${
                  pickerOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                aria-label='React to message'
                aria-expanded={pickerOpen}
              >
                <SmilePlus size={12} />
              </button>
              {pickerOpen && (
                <>
                  <button
                    className='fixed inset-0 z-10 cursor-default'
                    onClick={() => setPickerOpen(false)}
                    aria-label='Close reactions'
                    tabIndex={-1}
                  />
                  <span
                    className={`absolute z-20 top-5 flex items-center gap-0.5 rounded-2xl border border-zinc-200 bg-white p-1 shadow-lg ${
                      m.own ? 'right-0' : 'left-0'
                    }`}
                  >
                    {REACTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setPickerOpen(false)
                          onReact(e)
                        }}
                        className='h-8 w-8 rounded-xl text-base leading-none hover:bg-zinc-100 active:scale-90 transition-transform'
                        aria-label={`React ${e}`}
                      >
                        {e}
                      </button>
                    ))}
                  </span>
                </>
              )}
            </span>
            {canReply && (
              <button
                onClick={onReply}
                className='opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-[#002EFF]'
                aria-label='Reply to message'
              >
                <Reply size={12} />
              </button>
            )}
            {canPin && (
              <button
                onClick={onPin}
                className='opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-[#002EFF]'
                title={m.pinned ? 'Unpin' : 'Pin'}
              >
                <Pin size={12} />
              </button>
            )}
            {canEdit && !editing && (
              <button
                onClick={() => {
                  setDraft(m.text ?? '')
                  setEditing(true)
                }}
                className='opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-[#002EFF]'
                title='Edit'
              >
                <Pencil size={12} />
              </button>
            )}
            {showDelete && (
              <button
                onClick={onDelete}
                className='opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-rose-500'
                aria-label='Delete message'
              >
                <Trash2 size={12} />
              </button>
            )}
          </span>
        </div>

        <div
          className={`rounded-2xl overflow-hidden ${
            m.type === 'text'
              ? m.own
                ? 'bg-[#002EFF] text-white px-4 py-2.5'
                : 'bg-zinc-100 text-zinc-800 px-4 py-2.5'
              : m.type === 'poll'
                ? 'bg-white border border-zinc-200 p-3 min-w-[250px]'
                : 'bg-white border border-zinc-200 p-1.5'
          }`}
        >
          {/* Quoted message — what this one is answering */}
          {m.replyTo && (
            <div
              className={`mb-2 flex gap-2 rounded-xl px-2.5 py-1.5 ${
                m.type === 'text' && m.own
                  ? 'bg-white/15'
                  : 'bg-zinc-50 border border-zinc-100'
              }`}
            >
              <span
                className={`w-0.5 shrink-0 rounded-full ${
                  m.type === 'text' && m.own ? 'bg-white/60' : 'bg-[#002EFF]'
                }`}
              />
              <span className='min-w-0'>
                <span
                  className={`block text-[10px] font-black ${
                    m.type === 'text' && m.own ? 'text-white/80' : 'text-[#002EFF]'
                  }`}
                >
                  {m.replyTo.senderName}
                </span>
                <span
                  className={`block text-[11px] font-medium truncate ${
                    m.type === 'text' && m.own ? 'text-white/70' : 'text-zinc-500'
                  }`}
                >
                  {previewText(m.replyTo)}
                </span>
              </span>
            </div>
          )}

          {m.type === 'poll' && m.poll && (
            <div className='space-y-2'>
              <div className='flex items-start gap-1.5'>
                <BarChart3
                  size={14}
                  className='text-[#002EFF] mt-0.5 shrink-0'
                  aria-hidden
                />
                <p className='text-[13px] font-black text-zinc-800 leading-snug break-words'>
                  {m.poll.question}
                </p>
              </div>
              {m.poll.isQuiz && (
                <span className='inline-block text-[8px] font-black uppercase tracking-wide bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded'>
                  Quiz
                </span>
              )}
              <div className='space-y-1.5'>
                {m.poll.options.map((o) => {
                  const total = m.poll?.totalVotes ?? 0
                  const share = total ? Math.round((o.votes / total) * 100) : 0
                  const answered = m.poll?.myVote != null
                  const correct = m.poll?.correctOption
                  const isCorrect = correct != null && correct === o.index
                  const wrongPick = o.voted && correct != null && !isCorrect
                  return (
                    <button
                      key={o.index}
                      onClick={() => onVote(o.index)}
                      disabled={m.poll?.closed}
                      className={`relative w-full text-left rounded-xl px-2.5 py-2 text-[12px] font-bold overflow-hidden border transition-colors disabled:cursor-not-allowed ${
                        isCorrect && answered
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : wrongPick
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : o.voted
                              ? 'border-[#002EFF] bg-blue-50 text-[#002EFF]'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:border-[#002EFF]/40'
                      }`}
                    >
                      {answered && (
                        <span
                          aria-hidden
                          className='absolute inset-y-0 left-0 bg-current opacity-10'
                          style={{ width: `${share}%` }}
                        />
                      )}
                      <span className='relative flex items-center justify-between gap-2'>
                        <span className='truncate'>{o.text}</span>
                        {answered && (
                          <span className='tabular-nums shrink-0'>{share}%</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className='text-[10px] font-bold text-zinc-400 tabular-nums'>
                {m.poll.totalVotes} vote{m.poll.totalVotes === 1 ? '' : 's'}
                {m.poll.closed ? ' · closed' : ''}
              </p>
            </div>
          )}

          {m.type === 'text' &&
            (editing ? (
              <div className='min-w-[220px]'>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      saveEdit()
                    }
                    if (e.key === 'Escape') setEditing(false)
                  }}
                  autoFocus
                  rows={2}
                  className='w-full resize-none rounded-lg bg-white/90 text-zinc-800 text-[13px] p-2 outline-none'
                />
                <div className='flex items-center gap-2 mt-1 justify-end'>
                  <button
                    onClick={() => setEditing(false)}
                    className='text-[11px] font-bold text-white/70 hover:text-white'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className='flex items-center gap-1 text-[11px] font-black text-white'
                  >
                    <Check size={12} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className='text-[13px] leading-relaxed whitespace-pre-wrap break-words'>
                {m.text}
              </p>
            ))}

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

        {/* Reactions — tap a chip to join it, tap again to take yours back */}
        {m.reactions.length > 0 && (
          <div
            className={`mt-1 flex flex-wrap gap-1 ${
              m.own ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black tabular-nums transition-colors active:scale-95 ${
                  r.mine
                    ? 'border-[#002EFF] bg-blue-50 text-[#002EFF]'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                }`}
                aria-label={`${r.emoji} ${r.count}`}
                aria-pressed={r.mine}
              >
                <span className='text-[13px] leading-none'>{r.emoji}</span>
                {r.count}
              </button>
            ))}
          </div>
        )}

        {/* Seen by — only on your own messages, names on tap (WhatsApp-style) */}
        {m.own && m.readCount > 0 && (
          <div className='mt-1 px-1'>
            <button
              onClick={toggleSeen}
              className='inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-zinc-400 hover:text-[#002EFF] transition-colors'
            >
              {seenLoading ? (
                <Loader2 size={10} className='animate-spin' />
              ) : (
                <Eye size={10} />
              )}
              Seen by {m.readCount}
            </button>
            {seen && (
              <p className='mt-0.5 text-[10px] font-medium text-zinc-500 max-w-[220px] break-words'>
                {seen.length
                  ? seen.map((s) => s.fullname).join(', ')
                  : 'No one yet'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
