// 'use client'

// import { ArrowRight, Play } from 'lucide-react'
// import Image from 'next/image'
// import Link from 'next/link'

// import Hero01 from '../../imges/hero-01.jpg'
// import Hero02 from '../../imges/hero-02.jpg'
// import Hero03 from '../../imges/hero-03.jpg'

// const formulas = [
//   { text: 'E = mc²', top: '10%', left: '5%', rotate: -15 },
//   { text: 'H₂O + CO₂', top: '15%', left: '85%', rotate: 10 },
//   { text: 'a² + b² = c²', top: '75%', left: '8%', rotate: 20 },
//   { text: 'F = ma', top: '85%', left: '80%', rotate: -10 },
//   { text: '∫(x) dx', top: '40%', left: '92%', rotate: 15 },
//   { text: 'PV = nRT', top: '50%', left: '4%', rotate: -5 },
//   { text: 'Δy/Δx', top: '25%', left: '45%', rotate: 12 },
//   { text: 'λ = h/p', top: '70%', left: '40%', rotate: -8 },
// ]

// export default function Hero() {
//   return (
//     <section
//       id='home'
//       className='relative w-full pt-32 pb-16 md:pt-40 md:pb-24 bg-[#f8f9ff] overflow-hidden'
//     >
//       {/* --- ACADEMIC FORMULA BACKGROUND --- */}
//       <div className='absolute inset-0 pointer-events-none select-none overflow-hidden'>
//         {formulas.map((formula, index) => (
//           <div
//             key={index}
//             data-aos='fade-in'
//             data-aos-delay={100 * index}
//             className='absolute font-serif italic text-blue-900 text-lg md:text-2xl whitespace-nowrap hidden sm:block opacity-[0.12]'
//             style={{
//               top: formula.top,
//               left: formula.left,
//               transform: `rotate(${formula.rotate}deg)`,
//             }}
//           >
//             {formula.text}
//           </div>
//         ))}
//       </div>

//       <div className='relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6'>
//         {/* LEFT TEXT CONTENT */}
//         <div
//           data-aos='fade-right'
//           data-aos-duration='600'
//           className='text-center md:text-left'
//         >
//           <div className='inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100'>
//             <span className='text-[#002EFF] text-[10px] md:text-xs font-black uppercase tracking-widest'>
//               📍 Based in Ibadan, Nigeria
//             </span>
//           </div>

//           <h1 className='text-3xl md:text-4xl font-black text-gray-900 leading-[1.1] tracking-tight'>
//             Empowering Students to <br />
//             <span className='text-[#002EFF]'>Excel in UTME & WAEC</span>
//           </h1>

//           <p className='text-sm md:text-base text-gray-600 mt-6 max-w-md mx-auto md:mx-0 leading-relaxed font-medium'>
//             Join thousands of scholars learning faster, scoring higher, and
//             building academic confidence with the DSA learning system.
//           </p>

//           <div className='flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-10'>
//             <Link
//               href='https://wa.link/7wim2w'
//               target='_blank'
//               rel='noopener noreferrer'
//               className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#002EFF] text-white rounded-2xl font-bold transition-all hover:bg-blue-700 active:scale-95 text-sm shadow-xl shadow-blue-200 group'
//             >
//               Start Learning
//               <ArrowRight
//                 size={18}
//                 className='group-hover:translate-x-1 transition-transform'
//               />
//             </Link>

//             <Link
//               href='https://wa.link/xtiui2'
//               target='_blank'
//               rel='noopener noreferrer'
//               className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 bg-white rounded-2xl font-bold transition-all hover:border-[#FCB900] hover:text-black active:scale-95 text-sm'
//             >
//               <Play size={16} fill='currentColor' />
//               Join Free Classes
//             </Link>
//           </div>
//         </div>

//         {/* RIGHT IMAGE SECTION */}
//         <div
//           data-aos='zoom-in'
//           data-aos-duration='700'
//           className='relative flex justify-center items-center mt-16 md:mt-0'
//         >
//           {/* Animated Background Ring */}
//           <div className='absolute w-[110%] h-[110%] border-2 border-dashed border-blue-100 rounded-full -z-10 animate-[spin_30s_linear_infinite]' />

//           {/* Main Profile Image */}
//           <div className='relative w-64 h-64 md:w-80 md:h-80 bg-[#FCB900] rounded-3xl rotate-3 flex items-center justify-center shadow-2xl'>
//             <div className='w-full h-full -rotate-3 overflow-hidden rounded-3xl border-4 border-white'>
//               <Image
//                 src={Hero01}
//                 fill
//                 className='object-cover'
//                 alt='Main Students'
//                 priority
//               />
//             </div>

//             {/* Floating Accents */}
//             <div className='absolute -top-4 -right-4 w-12 h-12 bg-[#002EFF] rounded-2xl flex items-center justify-center shadow-lg -rotate-12 animate-bounce'>
//               <GraduationCap className='text-white' size={24} />
//             </div>
//           </div>

//           {/* Secondary Floating Images */}
//           <div
//             data-aos='fade-up'
//             data-aos-delay='500'
//             className='absolute -left-4 top-0 md:-left-12'
//           >
//             <div className='relative w-20 h-20 md:w-28 md:h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden rotate-[-10deg]'>
//               <Image
//                 src={Hero02}
//                 fill
//                 className='object-cover'
//                 alt='Student 1'
//               />
//             </div>
//           </div>

//           <div
//             data-aos='fade-down'
//             data-aos-delay='700'
//             className='absolute -right-4 bottom-0 md:-right-8'
//           >
//             <div className='relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden rotate-10'>
//               <Image
//                 src={Hero03}
//                 fill
//                 className='object-cover'
//                 alt='Student 2'
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// // Small helper for the icon in the accent
// function GraduationCap({
//   className,
//   size,
// }: {
//   className?: string
//   size?: number
// }) {
//   return (
//     <svg
//       xmlns='http://www.w3.org/2000/svg'
//       width={size}
//       height={size}
//       viewBox='0 0 24 24'
//       fill='none'
//       stroke='currentColor'
//       strokeWidth='2'
//       strokeLinecap='round'
//       strokeLinejoin='round'
//       className={className}
//     >
//       <path d='M22 10v6M2 10l10-5 10 5-10 5z' />
//       <path d='M6 12v5c3 3 9 3 12 0v-5' />
//     </svg>
//   )
// }

'use client'

import { ArrowRight, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Assuming folder name is corrected to 'images'
import Hero01 from '../../imges/hero-01.jpg'
import Hero02 from '../../imges/hero-02.jpg'
import Hero03 from '../../imges/hero-03.jpg'

const formulas = [
  { text: 'E = mc²', top: '10%', left: '5%', rotate: -15 },
  { text: 'H₂O + CO₂', top: '15%', left: '85%', rotate: 10 },
  { text: 'a² + b² = c²', top: '75%', left: '8%', rotate: 20 },
  { text: 'F = ma', top: '85%', left: '80%', rotate: -10 },
  { text: '∫(x) dx', top: '40%', left: '92%', rotate: 15 },
  { text: 'PV = nRT', top: '50%', left: '4%', rotate: -5 },
  { text: 'Δy/Δx', top: '25%', left: '45%', rotate: 12 },
  { text: 'λ = h/p', top: '70%', left: '40%', rotate: -8 },
]

export default function Hero() {
  return (
    <section
      id='home'
      className='relative w-full pt-32 pb-16 md:pt-40 md:pb-24 bg-[#f8f9ff] overflow-hidden'
    >
      {/* --- ACADEMIC FORMULA BACKGROUND --- */}
      <div className='absolute inset-0 pointer-events-none select-none overflow-hidden'>
        {formulas.map((formula, index) => (
          <div
            key={index}
            data-aos='fade-in'
            data-aos-delay={100 * index}
            className='absolute font-serif italic text-blue-900 text-lg md:text-2xl whitespace-nowrap hidden sm:block opacity-[0.12]'
            style={{
              top: formula.top,
              left: formula.left,
              transform: `rotate(${formula.rotate}deg)`,
            }}
          >
            {formula.text}
          </div>
        ))}
      </div>

      <div className='relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6'>
        {/* LEFT TEXT CONTENT */}
        <div
          data-aos='fade-right'
          data-aos-duration='600'
          className='text-center md:text-left'
        >
          <div className='inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100'>
            <span className='text-[#002EFF] text-[10px] md:text-xs font-black uppercase tracking-widest'>
              📍 Based in Ibadan, Nigeria
            </span>
          </div>

          <h1 className='text-3xl md:text-4xl font-black text-gray-900 leading-[1.1] tracking-tight'>
            Empowering Students to <br />
            <span className='text-[#002EFF]'>Excel in UTME & WAEC</span>
          </h1>

          <p className='text-sm md:text-base text-gray-600 mt-6 max-w-md mx-auto md:mx-0 leading-relaxed font-medium'>
            Join thousands of scholars learning faster, scoring higher, and
            building academic confidence with the DSA learning system.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-10'>
            <Link
              href='https://wa.link/7wim2w'
              target='_blank'
              rel='noopener noreferrer'
              className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#002EFF] text-white rounded-2xl font-bold transition-all hover:bg-blue-700 active:scale-95 text-sm shadow-xl shadow-blue-200 group'
            >
              Start Learning
              <ArrowRight
                size={18}
                className='group-hover:translate-x-1 transition-transform'
              />
            </Link>

            <Link
              href='https://wa.link/xtiui2'
              target='_blank'
              rel='noopener noreferrer'
              className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 bg-white rounded-2xl font-bold transition-all hover:border-[#FCB900] hover:text-black active:scale-95 text-sm'
            >
              <Play size={16} fill='currentColor' />
              Join Free Classes
            </Link>
          </div>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div
          data-aos='zoom-in'
          data-aos-duration='700'
          className='relative flex justify-center items-center mt-16 md:mt-0'
        >
          {/* Animated Background Ring */}
          <div className='absolute w-[110%] h-[110%] border-2 border-dashed border-blue-100 rounded-full -z-10 animate-[spin_30s_linear_infinite]' />

          {/* Main Profile Image */}
          {/* FIXED: Added 'relative' to ensure Image fill works */}
          <div className='relative w-64 h-64 md:w-80 md:h-80 bg-[#FCB900] rounded-3xl rotate-3 flex items-center justify-center shadow-2xl'>
            <div className='relative w-full h-full -rotate-3 overflow-hidden rounded-3xl border-4 border-white'>
              <Image
                src={Hero01}
                fill
                className='object-cover'
                alt='Main Students'
                priority
                sizes='(max-width: 768px) 256px, 320px'
              />
            </div>

            {/* Floating Accents */}
            <div className='absolute -top-4 -right-4 w-12 h-12 bg-[#002EFF] rounded-2xl flex items-center justify-center shadow-lg -rotate-12 animate-bounce'>
              <GraduationCap className='text-white' size={24} />
            </div>
          </div>

          {/* Secondary Floating Images */}
          <div
            data-aos='fade-up'
            data-aos-delay='500'
            className='absolute -left-4 top-0 md:-left-12'
          >
            {/* FIXED: Added 'relative' */}
            <div className='relative w-20 h-20 md:w-28 md:h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden rotate-[-10deg]'>
              <Image
                src={Hero02}
                fill
                className='object-cover'
                alt='Student 1'
                sizes='(max-width: 768px) 80px, 112px'
              />
            </div>
          </div>

          <div
            data-aos='fade-down'
            data-aos-delay='700'
            className='absolute -right-4 bottom-0 md:-right-8'
          >
            {/* FIXED: Added 'relative' */}
            <div className='relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden rotate-10'>
              <Image
                src={Hero03}
                fill
                className='object-cover'
                alt='Student 2'
                sizes='(max-width: 768px) 96px, 128px'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function GraduationCap({
  className,
  size,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M22 10v6M2 10l10-5 10 5-10 5z' />
      <path d='M6 12v5c3 3 9 3 12 0v-5' />
    </svg>
  )
}