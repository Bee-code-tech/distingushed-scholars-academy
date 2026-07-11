import { X, ImageIcon } from 'lucide-react'

export const ImagePreview = ({
  src,
  onClear,
}: {
  src: string | null
  onClear: () => void
}) => {
  if (!src) return null
  return (
    <div className='relative mt-2 group animate-in zoom-in-95 duration-300'>
      <img
        src={src}
        alt='Upload preview'
        className='w-full h-40 object-contain bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner'
      />
      <button
        onClick={onClear}
        className='absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform'
      >
        <X size={16} />
      </button>
    </div>
  )
}
