// 'use client'

// import { useState, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   X,
//   GripHorizontal,
//   Delete,
//   ChevronRight,
//   ChevronLeft,
// } from 'lucide-react'

// export const ScientificCalculator = ({ onClose }: { onClose: () => void }) => {
//   const [display, setDisplay] = useState('0')
//   const [isExpanded, setIsExpanded] = useState(false)
//   const constraintsRef = useRef(null)

//   const calculate = (expression: string) => {
//     try {
//       // Replace scientific notation with JS Math functions
//       let formatted = expression
//         .replace(/sin\(/g, 'Math.sin(')
//         .replace(/cos\(/g, 'Math.cos(')
//         .replace(/tan\(/g, 'Math.tan(')
//         .replace(/asin\(/g, 'Math.asin(')
//         .replace(/acos\(/g, 'Math.acos(')
//         .replace(/atan\(/g, 'Math.atan(')
//         .replace(/log\(/g, 'Math.log10(')
//         .replace(/ln\(/g, 'Math.log(')
//         .replace(/sqrt\(/g, 'Math.sqrt(')
//         .replace(/π/g, 'Math.PI')
//         .replace(/e/g, 'Math.E')
//         .replace(/\^/g, '**')

//       // Use a safer evaluation
//       const result = new Function(`return ${formatted}`)()
//       return Number.isFinite(result)
//         ? parseFloat(result.toFixed(8)).toString()
//         : 'Error'
//     } catch {
//       return 'Error'
//     }
//   }

//   const handleBtn = (val: string) => {
//     if (val === 'C') setDisplay('0')
//     else if (val === 'DEL') {
//       setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))
//     } else if (val === '=') {
//       setDisplay(calculate(display))
//     } else {
//       setDisplay((prev) =>
//         prev === '0' || prev === 'Error' ? val : prev + val,
//       )
//     }
//   }

//   const scientificButtons = [
//     { label: 'sin', val: 'sin(' },
//     { label: 'cos', val: 'cos(' },
//     { label: 'tan', val: 'tan(' },
//     { label: 'asin', val: 'asin(' },
//     { label: 'acos', val: 'acos(' },
//     { label: 'atan', val: 'atan(' },
//     { label: 'log', val: 'log(' },
//     { label: 'ln', val: 'ln(' },
//     { label: 'sqrt', val: 'sqrt(' },
//     { label: 'π', val: 'π' },
//     { label: 'e', val: 'e' },
//     { label: '^', val: '^' },
//     { label: '(', val: '(' },
//     { label: ')', val: ')' },
//   ]

//   return (
//     <>
//       <div
//         ref={constraintsRef}
//         className='fixed inset-0 pointer-events-none z-299'
//       />

//       <motion.div
//         drag
//         dragMomentum={false}
//         dragConstraints={constraintsRef}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0, width: isExpanded ? 500 : 280 }}
//         className='fixed top-24 left-1/2 -translate-x-1/2 z-300 bg-zinc-950 p-4 rounded-4xl text-white shadow-2xl border border-white/10 cursor-default touch-none pointer-events-auto overflow-hidden'
//       >
//         {/* Header */}
//         <div className='flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing group'>
//           <div className='flex items-center gap-2 text-zinc-500'>
//             <GripHorizontal size={16} />
//             <span className='text-[9px] font-black uppercase tracking-widest'>
//               Engine Calc
//             </span>
//           </div>
//           <div className='flex gap-1'>
//             <button
//               onClick={() => setIsExpanded(!isExpanded)}
//               className='p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-blue-400 transition-colors'
//             >
//               {isExpanded ? (
//                 <ChevronLeft size={16} />
//               ) : (
//                 <ChevronRight size={16} />
//               )}
//             </button>
//             <button
//               onClick={onClose}
//               className='p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-500 transition-colors'
//             >
//               <X size={16} />
//             </button>
//           </div>
//         </div>

//         {/* Screen */}
//         <div className='text-right mb-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5'>
//           <div className='text-[10px] text-blue-500 font-bold uppercase mb-1 h-3 tracking-tighter'>
//             {isExpanded ? 'Scientific Mode' : 'Standard'}
//           </div>
//           <div className='text-2xl font-mono truncate tracking-tighter'>
//             {display}
//           </div>
//         </div>

//         <div className='flex gap-4'>
//           {/* Scientific Panel (Conditional) */}
//           <AnimatePresence>
//             {isExpanded && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 className='grid grid-cols-3 gap-2 w-[200px] shrink-0 border-r border-white/5 pr-4'
//               >
//                 {scientificButtons.map((b) => (
//                   <button
//                     key={b.label}
//                     onClick={() => handleBtn(b.val)}
//                     className='h-10 rounded-xl bg-blue-500/5 text-blue-400 text-[11px] font-bold hover:bg-blue-500/20 transition-all active:scale-90'
//                   >
//                     {b.label}
//                   </button>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Basic Panel */}
//           <div className='grid grid-cols-4 gap-2 w-full'>
//             {[
//               'C',
//               'DEL',
//               '/',
//               '*',
//               '7',
//               '8',
//               '9',
//               '-',
//               '4',
//               '5',
//               '6',
//               '+',
//               '1',
//               '2',
//               '3',
//               '.',
//               '0',
//               '=',
//             ].map((k) => (
//               <button
//                 key={k}
//                 onClick={() => handleBtn(k)}
//                 className={`
//                   h-11 rounded-xl text-sm font-bold transition-all active:scale-90 flex items-center justify-center
//                   ${
//                     k === '='
//                       ? 'col-span-2 bg-blue-600 text-white'
//                       : ['/', '*', '-', '+'].includes(k)
//                         ? 'bg-white/5 text-blue-500'
//                         : k === 'C' || k === 'DEL'
//                           ? 'bg-red-500/10 text-red-500'
//                           : 'bg-white/5 text-zinc-300'
//                   }
//                   ${k === '0' && !isExpanded ? 'col-span-1' : ''}
//                 `}
//               >
//                 {k === 'DEL' ? <Delete size={16} /> : k}
//               </button>
//             ))}
//           </div>
//         </div>
//       </motion.div>
//     </>
//   )
// }

'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  GripHorizontal,
  Delete,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from 'lucide-react'

export const ScientificCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState('0')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeg, setIsDeg] = useState(true) // Degree vs Radian mode
  const constraintsRef = useRef(null)

  const handleBtn = (val: string) => {
    if (val === 'C') setDisplay('0')
    else if (val === 'DEL') {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))
    } else if (val === '=') {
      try {
        let expression = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/\^/g, '**')

        // Handle Trig with Deg/Rad conversion
        const factor = isDeg ? '(Math.PI/180)' : ''
        expression = expression
          .replace(
            /sin\(([^)]+)\)/g,
            `Math.sin(($1)${factor ? '*' + factor : ''})`,
          )
          .replace(
            /cos\(([^)]+)\)/g,
            `Math.cos(($1)${factor ? '*' + factor : ''})`,
          )
          .replace(
            /tan\(([^)]+)\)/g,
            `Math.tan(($1)${factor ? '*' + factor : ''})`,
          )
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/sqrt\(/g, 'Math.sqrt(')

        const result = new Function(`return ${expression}`)()
        setDisplay(
          Number.isFinite(result)
            ? parseFloat(result.toFixed(6)).toString()
            : 'Error',
        )
      } catch {
        setDisplay('Error')
      }
    } else {
      setDisplay((prev) =>
        prev === '0' || prev === 'Error' ? val : prev + val,
      )
    }
  }

  const sciFuncs = [
    'sin(',
    'cos(',
    'tan(',
    'log(',
    'ln(',
    'sqrt(',
    'π',
    'e',
    '^',
    '(',
    ')',
    'inv',
  ]

  return (
    <>
      <div
        ref={constraintsRef}
        className='fixed inset-0 pointer-events-none z-299'
      />
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        animate={{ width: isExpanded ? 420 : 260 }}
        className='fixed top-20 left-1/2 -translate-x-1/2 z-300 bg-zinc-950 border border-white/10 rounded-[2.5rem] p-3 shadow-2xl touch-none pointer-events-auto overflow-hidden'
      >
        {/* Header Section */}
        <div className='flex justify-between items-center px-3 py-2 cursor-grab active:cursor-grabbing group'>
          <div className='flex items-center gap-2'>
            <GripHorizontal
              size={14}
              className='text-zinc-600 group-hover:text-zinc-400'
            />
            <button
              onClick={() => setIsDeg(!isDeg)}
              className='text-[9px] font-black bg-zinc-900 px-2 py-0.5 rounded-full text-blue-500 border border-white/5'
            >
              {isDeg ? 'DEG' : 'RAD'}
            </button>
          </div>
          <div className='flex gap-1'>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-1.5 hover:bg-white/5 rounded-lg text-zinc-500'
            >
              {isExpanded ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
            <button
              onClick={onClose}
              className='p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Display */}
        <div className='bg-zinc-900/50 mx-1 mb-3 rounded-2xl p-4 text-right border border-white/5'>
          <div className='text-2xl font-mono truncate text-white tracking-tighter'>
            {display}
          </div>
        </div>

        <div className='flex gap-2'>
          {/* Scientific Panel */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className='grid grid-cols-3 gap-1.5 w-40 shrink-0 border-r border-white/5 pr-2'
              >
                {sciFuncs.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleBtn(f)}
                    className='h-9 rounded-xl bg-blue-600/5 text-blue-400 text-[10px] font-bold hover:bg-blue-600/15 transition-all'
                  >
                    {f.replace('(', '')}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Pad */}
          <div className='grid grid-cols-4 gap-1.5 w-full'>
            {[
              'C',
              'DEL',
              '/',
              '*',
              '7',
              '8',
              '9',
              '-',
              '4',
              '5',
              '6',
              '+',
              '1',
              '2',
              '3',
              '.',
              '0',
              '=',
            ].map((k) => (
              <button
                key={k}
                onClick={() => handleBtn(k)}
                className={`h-10 rounded-xl text-xs font-bold transition-all active:scale-90 flex items-center justify-center
                  ${
                    k === '='
                      ? 'col-span-2 bg-[#002EFF] text-white'
                      : ['/', '*', '-', '+'].includes(k)
                        ? 'bg-zinc-900 text-blue-500'
                        : k === 'C' || k === 'DEL'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-white/5 text-zinc-300'
                  }
                `}
              >
                {k === 'DEL' ? <Delete size={14} /> : k}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}