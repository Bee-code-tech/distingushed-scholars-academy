'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar } from 'lucide-react'
import Blog1 from '../../imges/jamb.jpeg'
import Blog2 from '../../imges/waec.jpeg'
import Blog3 from '../../imges/Habits.png'

const blogs = [
  {
    title: 'JAMB 2026: New Updates You Must Know',
    category: 'Exam News',
    date: 'Dec 15, 2025',
    img: Blog1,
    link: '/blog/jamb-2026-updates',
  },
  {
    title: '10 Study Habits of High-Scoring Students',
    category: 'Tips & Tricks',
    date: 'Dec 10, 2025',
    img: Blog2,
    link: '/blog/study-habits',
  },
  {
    title: 'WAEC Biology: Diagrams You Must Master',
    category: 'Academic',
    date: 'Dec 05, 2025',
    img: Blog3,
    link: '/blog/waec-biology-diagrams',
  },
]

export default function BlogPosts() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id='blog' className='w-full py-24 bg-[#f8faff]'>
      <div className='max-w-7xl mx-auto px-10 md:px-20'>
        {/* TITLE SECTION */}
        <div className='text-center mb-16'>
          <h2
            data-aos='fade-up'
            data-aos-duration='600'
            className='text-3xl md:text-4xl font-extrabold text-black uppercase'
          >
            Latest <span className='text-[#002EFF]'>Blog Posts</span>
          </h2>
          <div
            data-aos='zoom-in'
            data-aos-delay='200'
            className='w-16 h-1 bg-[#FCB900] mx-auto mt-4 rounded-full'
          ></div>
        </div>

        {/* GRID */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {blogs.map((blog, index) => (
            <div
              key={`blog-post-${index}`}
              data-aos='fade-up'
              data-aos-delay={index * 100}
              data-aos-duration='500'
              className='group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300'
            >
              {/* Image Container */}
              <div className='relative aspect-16/10 w-full overflow-hidden'>
                <Image
                  src={blog.img}
                  alt={blog.title}
                  fill
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  className='object-cover transition-transform duration-500 group-hover:scale-110'
                />
                <div className='absolute top-4 left-4 bg-[#002EFF] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider'>
                  {blog.category}
                </div>
              </div>

              {/* Content */}
              <div className='p-6'>
                <div className='flex items-center gap-2 text-gray-400 text-xs mb-3'>
                  <Calendar size={14} />
                  <span>{blog.date}</span>
                </div>

                <h3 className='text-lg font-bold text-black group-hover:text-[#002EFF] transition-colors leading-snug min-h-14'>
                  {blog.title}
                </h3>

                <Link
                  href={blog.link}
                  className='mt-4 inline-flex items-center gap-1 text-[#FCB900] font-bold text-sm hover:gap-2 transition-all'
                >
                  Read More <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA BUTTON */}
        <div
          data-aos='fade-up'
          data-aos-delay='400'
          data-aos-duration='700'
          className='mt-16 text-center'
        >
          <Link
            href='/blog'
            className='inline-flex items-center gap-2 px-10 py-4 bg-[#002EFF] text-white font-bold rounded-xl shadow-lg hover:bg-[#FCB900] hover:text-black transition-all duration-300 active:scale-95'
          >
            View All Blog Posts
          </Link>
        </div>
      </div>
    </section>
  )
}
