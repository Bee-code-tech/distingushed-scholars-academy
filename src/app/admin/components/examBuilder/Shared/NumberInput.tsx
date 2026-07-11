interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const NumberInput = ({ label, ...props }: Props) => (
  <div className='flex flex-col gap-1'>
    {label && (
      <span className='text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest'>
        {label}
      </span>
    )}
    <input
      {...props}
      type='number'
      className='p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
    />
  </div>
)
