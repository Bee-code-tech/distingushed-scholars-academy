'use client'

import { useState } from 'react'
import {
  MessageSquare,
  ThumbsUp,
  Send,
  Hash,
  MoreHorizontal,
  Award,
  Filter,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function CommunityView() {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = [
    'All',
    'Mathematics',
    'Physics',
    'JAMB Updates',
    'Study Tips',
  ]

  const posts = [
    {
      id: 1,
      user: 'Alex J.',
      rank: 'Elite',
      topic: 'How to solve Quadratic Equations quickly without the formula?',
      category: 'Mathematics',
      replies: 12,
      likes: 45,
      time: '2h ago',
    },
    {
      id: 2,
      user: 'Sarah M.',
      rank: 'DSAite Pro',
      topic: 'Found a leaked 2026 Syllabus draft—check the Biology section!',
      category: 'JAMB Updates',
      replies: 8,
      likes: 21,
      time: '5h ago',
    },
  ]

  return (
    <div className='max-w-4xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500'>
      {/* --- REFINED HEADER --- */}
      <div className='flex flex-col items-center text-center space-y-1 py-2'>
        <div className='bg-blue-50 px-3 py-0.5 rounded-full'>
          <p className='text-[9px] font-bold text-[#002EFF] uppercase tracking-wider'>
            DSAites Discussion
          </p>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight'>
          Intelligence <span className='text-[#002EFF]'>Community</span>
        </h2>
        <p className='text-zinc-500 font-medium text-[11px] max-w-md'>
          Connect with the top candidates nationwide. Share insights, solve
          problems, and grow.
        </p>
      </div>

      {/* --- COMPACT COMPOSER --- */}
      <Card className='p-1.5 rounded-2xl border border-zinc-200 shadow-sm bg-white'>
        <div className='relative flex items-center'>
          <div className='absolute left-3 h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100'>
            <Hash size={14} className='text-zinc-400' />
          </div>
          <Input
            className='h-11 rounded-xl pl-12 pr-28 border-none bg-transparent focus-visible:ring-0 text-sm placeholder:text-zinc-400'
            placeholder='Start a discussion...'
          />
          <Button className='absolute right-1.5 bg-[#002EFF] hover:bg-blue-700 text-white rounded-lg px-4 h-8 text-[11px] font-bold transition-all'>
            Post <Send size={12} className='ml-2' />
          </Button>
        </div>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        {/* --- LEFT SIDEBAR: CHANNELS --- */}
        <div className='lg:col-span-3 space-y-4'>
          <div className='bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm'>
            <p className='text-[10px] font-bold text-zinc-400 uppercase mb-3 px-1 flex items-center gap-2'>
              <Filter size={12} /> Channels
            </p>
            <div className='flex flex-col gap-0.5'>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-blue-50 text-[#002EFF]'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <span className='opacity-50 mr-1.5'>
                    {cat === 'All' ? '•' : '#'}
                  </span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- MAIN FEED --- */}
        <div className='lg:col-span-9 space-y-3'>
          {posts.map((post) => (
            <Card
              key={post.id}
              className='group p-4 rounded-2xl border border-zinc-200 shadow-sm hover:border-blue-200 transition-all bg-white'
            >
              <div className='flex justify-between items-start mb-3'>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <div className='w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 text-[11px] border border-zinc-200'>
                      {post.user.substring(0, 2)}
                    </div>
                    <div className='absolute -bottom-1 -right-1 bg-[#FCB900] rounded-full p-0.5 border border-white'>
                      <Award size={8} className='text-[#002EFF]' />
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='text-[12px] font-bold text-zinc-800'>
                        {post.user}
                      </span>
                      <Badge
                        variant='secondary'
                        className='bg-blue-50 text-[#002EFF] text-[9px] font-bold px-1.5 py-0 h-4'
                      >
                        {post.rank}
                      </Badge>
                    </div>
                    <p className='text-[10px] font-medium text-zinc-400'>
                      {post.time}
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 rounded-lg text-zinc-400'
                >
                  <MoreHorizontal size={16} />
                </Button>
              </div>

              <h4 className='text-sm font-semibold text-zinc-900 mb-2 leading-snug group-hover:text-[#002EFF] transition-colors'>
                {post.topic}
              </h4>

              <div className='flex items-center justify-between mt-4 pt-3 border-t border-zinc-50'>
                <div className='flex gap-3'>
                  <div className='flex items-center gap-1.5 text-zinc-500 cursor-pointer hover:text-blue-600 transition-colors'>
                    <MessageSquare size={14} />
                    <span className='text-[11px] font-medium'>
                      {post.replies}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5 text-zinc-500 cursor-pointer hover:text-red-500 transition-colors'>
                    <ThumbsUp size={14} />
                    <span className='text-[11px] font-medium'>
                      {post.likes}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <span className='text-[10px] font-bold text-zinc-300 uppercase tracking-tighter'>
                    #{post.category}
                  </span>
                  <button className='text-[11px] font-bold text-[#002EFF] hover:underline transition-all'>
                    View Discussion
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
