'use client'

// Quiz leaderboard — claymorphic, playful ranking board (chunky rounded cards,
// soft double shadows, bouncy press) built on the DSA palette. Shows a top-3
// podium then the ranked rows, with the current student highlighted as "YOU".
//
// Icons are SVG (lucide), never emoji. Numbers use tabular figures so ranks and
// scores line up. Motion is wrapped in `motion-safe:` so reduced-motion is
// respected.

import { Trophy, Crown, Medal, Clock, Loader2 } from 'lucide-react'

export type LeaderboardRow = {
  userId?: string | null
  username: string
  profilePic?: string | null
  /** Percentage — stored as a fraction (0–1) by the API; we normalise here. */
  score?: number
  totalScore?: number
  totalMarks?: number
  timeTaken?: number
}

/** What this attempt says about where the student is. */
const BANDS = [
  { min: 70, label: 'Excellent', tone: 'text-emerald-600', bar: 'bg-emerald-500',
    note: 'Strong work. Keep this pace and the real thing will feel familiar.' },
  { min: 60, label: 'Very good', tone: 'text-emerald-600', bar: 'bg-emerald-500',
    note: 'Nearly there. Tighten the weak topics and you are in the top band.' },
  { min: 50, label: 'Good', tone: 'text-[#002EFF]', bar: 'bg-[#002EFF]',
    note: 'A solid base. More practice on the subjects that cost you marks.' },
  { min: 40, label: 'Fair', tone: 'text-amber-600', bar: 'bg-[#FCB900]',
    note: 'Half way. Work through the corrections before your next attempt.' },
  { min: 0, label: 'Practice required', tone: 'text-rose-500', bar: 'bg-rose-500',
    note: 'Keep practising. Complete more questions to improve your score.' },
]

const bandFor = (score: number) =>
  BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1]

const pct = (v: unknown) => {
  const n = Number(v)
  if (!isFinite(n) || n <= 0) return 0
  return Math.round(n <= 1 ? n * 100 : n)
}

/** seconds → 00:46:53 (or 25:29 when under an hour). */
const fmtTime = (secs: unknown) => {
  const s = Math.max(0, Math.round(Number(secs) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const two = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${two(h)}:${two(m)}:${two(r)}` : `${two(m)}:${two(r)}`
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

/** Stable, cheerful avatar tint per name. */
const TINTS = [
  'bg-blue-100 text-[#002EFF]',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-600',
  'bg-cyan-100 text-cyan-700',
]
const tintFor = (name: string) => {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return TINTS[Math.abs(h) % TINTS.length]
}

function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string
  src?: string | null
  size?: 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'h-16 w-16 text-lg' : 'h-10 w-10 text-[11px]'
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name}'s profile photo`}
        className={`${dim} rounded-2xl object-cover shrink-0 ring-2 ring-white shadow-sm`}
      />
    )
  }
  return (
    <div
      aria-hidden
      className={`${dim} rounded-2xl shrink-0 flex items-center justify-center font-black ring-2 ring-white shadow-sm ${tintFor(name)}`}
    >
      {initials(name)}
    </div>
  )
}

/** Podium card for ranks 1–3. */
function PodiumCard({
  row,
  rank,
  isMe,
}: {
  row: LeaderboardRow
  rank: 1 | 2 | 3
  isMe: boolean
}) {
  const look =
    rank === 1
      ? {
          wrap: 'bg-gradient-to-b from-[#FCB900] to-[#f0a500] text-[#002EFF] shadow-[0_10px_0_-2px_rgba(180,120,0,0.45),0_18px_30px_-10px_rgba(252,185,0,0.6)] sm:-mt-5',
          label: 'text-[#002EFF]/70',
          Icon: Crown,
        }
      : rank === 2
        ? {
            wrap: 'bg-gradient-to-b from-slate-200 to-slate-300 text-slate-800 shadow-[0_10px_0_-2px_rgba(100,116,139,0.35),0_18px_30px_-12px_rgba(100,116,139,0.45)]',
            label: 'text-slate-600',
            Icon: Medal,
          }
        : {
            wrap: 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-[0_10px_0_-2px_rgba(146,64,14,0.35),0_18px_30px_-12px_rgba(180,83,9,0.45)]',
            label: 'text-amber-900/70',
            Icon: Medal,
          }
  const { Icon } = look
  return (
    <div
      className={`relative rounded-3xl p-4 flex flex-col items-center text-center transition-transform duration-200 motion-safe:hover:-translate-y-1 ${look.wrap} ${
        isMe ? 'ring-4 ring-[#002EFF] ring-offset-2 ring-offset-slate-50' : ''
      }`}
    >
      <Icon size={rank === 1 ? 22 : 18} className='mb-1' aria-hidden />
      <Avatar name={row.username} src={row.profilePic} size='lg' />
      <p className='mt-2 text-[12px] font-black leading-tight line-clamp-2 break-words'>
        {row.username}
      </p>
      <p className='text-2xl font-black tabular-nums leading-none mt-1'>
        {pct(row.score)}%
      </p>
      {!!row.totalMarks && (
        <p className={`text-[10px] font-bold tabular-nums ${look.label}`}>
          {row.totalScore ?? 0}/{row.totalMarks}
        </p>
      )}
      <span
        className={`mt-1.5 inline-flex items-center gap-1 text-[9px] font-black tabular-nums ${look.label}`}
      >
        <Clock size={10} aria-hidden /> {fmtTime(row.timeTaken)}
      </span>
      {isMe && (
        <span className='absolute -top-2 -right-2 rounded-lg bg-[#002EFF] text-white text-[9px] font-black px-2 py-0.5 shadow-md'>
          YOU
        </span>
      )}
    </div>
  )
}

export default function QuizLeaderboard({
  entries,
  meId,
  meName,
  title = 'Leaderboard',
  subtitle = 'Compete for the top spot',
  loading = false,
  me,
}: {
  entries: LeaderboardRow[]
  meId?: string | null
  meName?: string | null
  title?: string
  subtitle?: string
  loading?: boolean
  /**
   * This student's own figures. Position comes from the board itself; the rest
   * only the caller knows. Omit it on an admin view — the ranking card is for
   * the person who sat the quiz.
   */
  me?: {
    /** This attempt, as a percentage or a 0–1 fraction. */
    score?: number
    /** Their best across every attempt at this quiz. */
    bestScore?: number
    questionsAttempted?: number
    questionsTotal?: number
  }
}) {
  const isMe = (r: LeaderboardRow) =>
    (!!meId && !!r.userId && String(r.userId) === String(meId)) ||
    (!meId &&
      !!meName &&
      r.username.trim().toLowerCase() === meName.trim().toLowerCase())

  // Where the student sits on this board, and what to say about it.
  const myIndex = entries.findIndex((r) => isMe(r))
  const myRow = myIndex >= 0 ? entries[myIndex] : null
  const myScore = pct(me?.score ?? myRow?.score ?? 0)
  const myBest = me?.bestScore != null ? pct(me.bestScore) : null
  const band = bandFor(myScore)
  const showRanking = !!me || !!myRow

  const top = entries.slice(0, 3)
  const rest = entries.slice(3)
  // Podium order: 2nd, 1st, 3rd (1st raised in the middle).
  const podium: { row: LeaderboardRow; rank: 1 | 2 | 3 }[] = []
  if (top[1]) podium.push({ row: top[1], rank: 2 })
  if (top[0]) podium.push({ row: top[0], rank: 1 })
  if (top[2]) podium.push({ row: top[2], rank: 3 })

  return (
    <section className='rounded-3xl bg-slate-50 p-4 sm:p-5 shadow-[inset_0_2px_6px_rgba(15,23,42,0.06)]'>
      <header className='flex items-center gap-2.5 mb-4'>
        <div className='h-10 w-10 rounded-2xl bg-[#FCB900] text-[#002EFF] flex items-center justify-center shadow-[0_5px_0_-1px_rgba(180,120,0,0.45)] shrink-0'>
          <Trophy size={19} aria-hidden />
        </div>
        <div className='min-w-0'>
          <h3 className='text-lg font-black text-slate-900 tracking-tight leading-none'>
            {title}
          </h3>
          <p className='text-[11px] font-semibold text-slate-500 mt-1'>
            {subtitle}
          </p>
        </div>
      </header>

      {loading ? (
        <div className='py-10 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' size={20} />
        </div>
      ) : entries.length === 0 ? (
        <div className='py-10 text-center'>
          <p className='text-sm font-black text-slate-600'>
            No scores on the board yet
          </p>
          <p className='text-[11px] font-semibold text-slate-400 mt-1'>
            Be the first to set the pace.
          </p>
        </div>
      ) : (
        <>
          {/* Where this student stands — the part they came to read */}
          {showRanking && (
            <div className='mb-4 rounded-3xl bg-white p-4 shadow-[0_5px_0_-1px_rgba(15,23,42,0.06),0_14px_28px_-18px_rgba(15,23,42,0.3)]'>
              <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                Your ranking
              </p>

              <div className='mt-1 flex items-end justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='text-3xl font-black text-slate-900 tabular-nums leading-none'>
                    {myScore}%
                  </p>
                  <p className={`mt-1 text-[12px] font-black ${band.tone}`}>
                    {band.label}
                  </p>
                </div>
                {myIndex >= 0 && (
                  <div className='text-right shrink-0'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                      Position
                    </p>
                    <p className='text-xl font-black text-[#002EFF] tabular-nums leading-tight'>
                      {myIndex + 1}
                      <span className='text-slate-300'>/{entries.length}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* The score as a bar, so it reads at a glance */}
              <div className='mt-3 h-2 rounded-full bg-slate-100 overflow-hidden'>
                <div
                  className={`h-full rounded-full ${band.bar} transition-[width] duration-700`}
                  style={{ width: `${Math.max(myScore, 2)}%` }}
                />
              </div>

              <p className='mt-2.5 text-[11px] font-semibold text-slate-500 leading-relaxed'>
                {band.note}
              </p>

              <dl className='mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3'>
                {[
                  // Position already headlines this card, so the row carries
                  // the size of the field instead of repeating it.
                  { label: 'Sat this quiz', value: String(entries.length) },
                  { label: 'Best score', value: myBest != null ? `${myBest}%` : '—' },
                  {
                    label: 'Questions',
                    value:
                      me?.questionsTotal != null
                        ? `${me.questionsAttempted ?? 0}/${me.questionsTotal}`
                        : '—',
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className='text-[9px] font-black uppercase tracking-widest text-slate-400'>
                      {s.label}
                    </dt>
                    <dd className='text-[13px] font-black text-slate-800 tabular-nums'>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <p className='mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
            Top performers
          </p>
          {/* Top 3 podium */}
          <div className='grid grid-cols-3 gap-2 sm:gap-3 items-end mb-4'>
            {podium.map(({ row, rank }) => (
              <PodiumCard
                key={`${row.username}-${rank}`}
                row={row}
                rank={rank}
                isMe={isMe(row)}
              />
            ))}
          </div>

          {/* Everyone else, in order */}
          {rest.length > 0 && (
            <ol className='space-y-2'>
              {rest.map((r, i) => {
                const rank = i + 4
                const mine = isMe(r)
                return (
                  <li
                    key={`${r.username}-${rank}`}
                    className={`flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-[0_4px_0_-1px_rgba(15,23,42,0.06),0_8px_18px_-12px_rgba(15,23,42,0.25)] transition-transform duration-200 motion-safe:hover:-translate-y-0.5 ${
                      mine ? 'ring-2 ring-[#002EFF]' : ''
                    }`}
                  >
                    <span className='w-7 shrink-0 text-center text-[12px] font-black text-slate-400 tabular-nums'>
                      {rank}
                    </span>
                    <Avatar name={r.username} src={r.profilePic} />
                    <div className='min-w-0 flex-1'>
                      <p className='text-[13px] font-black text-slate-800 truncate'>
                        {r.username}
                        {mine && (
                          <span className='ml-1.5 align-middle rounded-md bg-[#002EFF] text-white text-[8px] font-black px-1.5 py-0.5'>
                            YOU
                          </span>
                        )}
                      </p>
                      <p className='text-[10px] font-bold text-slate-400 tabular-nums flex items-center gap-1'>
                        {!!r.totalMarks && (
                          <>
                            {r.totalScore ?? 0}/{r.totalMarks}
                            <span aria-hidden>·</span>
                          </>
                        )}
                        <Clock size={10} aria-hidden /> {fmtTime(r.timeTaken)}
                      </p>
                    </div>
                    <span className='shrink-0 text-base font-black text-[#002EFF] tabular-nums'>
                      {pct(r.score)}%
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )}
    </section>
  )
}
