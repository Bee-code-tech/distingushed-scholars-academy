'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Lock,
  Bell,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Camera,
  Fingerprint,
  Smartphone,
  Sparkles,
  ShieldAlert,
  Check,
  Loader2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('Account Info')
  const [profileImage, setProfileImage] = useState(
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  )
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const avatarSeeds = [
    { name: 'Felix', style: 'avataaars' },
    { name: 'Aneka', style: 'avataaars' },
    { name: 'Max', style: 'avataaars' },
    { name: 'Luna', style: 'avataaars' },
    { name: 'Jack', style: 'avataaars' },
    { name: 'Zoe', style: 'avataaars' },
    { name: 'Oliver', style: 'open-peeps' },
    { name: 'Sophia', style: 'open-peeps' },
    { name: 'Liam', style: 'open-peeps' },
    { name: 'Maya', style: 'open-peeps' },
    { name: 'Noah', style: 'open-peeps' },
    { name: 'Elena', style: 'open-peeps' },
  ]

  // --- PERSISTENCE LOGIC ---
  useEffect(() => {
    const savedImg = localStorage.getItem('user-pfp')
    if (savedImg) setProfileImage(savedImg)
  }, [])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setProfileImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = () => {
    setIsSaving(true)
    // Simulate API Call
    setTimeout(() => {
      localStorage.setItem('user-pfp', profileImage)
      setIsSaving(false)
      setSaveSuccess(true)
      // Reset success state after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 800)
  }

  return (
    <div className='max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500 pb-10 scale-[0.98] origin-top'>
      {/* --- PROFILE HEADER --- */}
      <Card className='bg-white rounded-3xl border-none p-5 shadow-sm relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-[#002EFF]/5 rounded-bl-full pointer-events-none' />
        <div className='flex flex-col md:flex-row items-center gap-5 relative z-10'>
          <div className='relative group'>
            <Avatar className='h-20 w-20 border-2 border-blue-50 shadow-lg transition-transform group-hover:scale-105'>
              <AvatarImage src={profileImage} className='object-cover' />
              <AvatarFallback className='bg-blue-100 text-[#002EFF] font-black text-sm'>
                HS
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className='absolute bottom-0 right-0 p-1.5 bg-[#002EFF] text-white rounded-lg shadow-lg border-2 border-white transition-transform active:scale-90'
            >
              <Camera size={12} />
            </button>
          </div>

          <div className='text-center md:text-left flex-1 space-y-0.5'>
            <div className='flex items-center justify-center md:justify-start gap-2'>
              <h2 className='text-lg font-black text-gray-800 uppercase italic leading-tight'>
                Hilosthone Student
              </h2>
              <Badge className='bg-[#FCB900] text-[#002EFF] border-none font-black text-[8px] h-4'>
                GOLD
              </Badge>
            </div>
            <p className='text-[10px] font-bold text-gray-400'>
              ID: 2026/DSA/042 • Science
            </p>
            <div className='pt-2 max-w-[180px] mx-auto md:mx-0'>
              <div className='flex justify-between items-center mb-1'>
                <span className='text-[8px] font-black text-[#002EFF] uppercase'>
                  Profile Strength
                </span>
                <span className='text-[8px] font-black text-gray-400'>85%</span>
              </div>
              <Progress value={85} className='h-1 bg-blue-50' />
            </div>
          </div>
        </div>

        {/* --- EXPANDED AVATAR PICKER --- */}
        {showAvatarPicker && (
          <div className='mt-4 p-3 bg-blue-50/50 rounded-2xl animate-in zoom-in-95 duration-200 border border-blue-100'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-[9px] font-black text-blue-600 uppercase'>
                Character Gallery
              </p>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className='text-[8px] font-black text-gray-400 hover:text-[#002EFF]'
              >
                CLOSE
              </button>
            </div>
            <div className='grid grid-cols-6 sm:grid-cols-8 gap-2'>
              {avatarSeeds.map((seed) => {
                const url = `https://api.dicebear.com/7.x/${seed.style}/svg?seed=${seed.name}`
                return (
                  <button
                    key={seed.name}
                    onClick={() => setProfileImage(url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-white hover:scale-110 ${profileImage === url ? 'border-[#002EFF]' : 'border-white'}`}
                  >
                    <img src={url} alt={seed.name} className='h-full w-full' />
                  </button>
                )
              })}
              <button
                onClick={() => fileInputRef.current?.click()}
                className='aspect-square border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-100 transition-colors'
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>
        )}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleImageChange}
          className='hidden'
          accept='image/*'
        />
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* --- NAVIGATION --- */}
        <div className='space-y-1.5'>
          {[
            'Account Info',
            'Security & Password',
            'Notifications',
            'Subscription',
            'Privacy Settings',
          ].map((label) => (
            <SettingNavButton
              key={label}
              icon={
                label === 'Account Info'
                  ? User
                  : label === 'Security & Password'
                    ? Lock
                    : label === 'Notifications'
                      ? Bell
                      : label === 'Subscription'
                        ? CreditCard
                        : ShieldCheck
              }
              label={label}
              active={activeTab === label}
              onClick={() => setActiveTab(label)}
            />
          ))}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className='lg:col-span-2'>
          {activeTab === 'Account Info' ? (
            <div className='space-y-4'>
              <Card className='bg-white rounded-3xl border-none p-5 shadow-sm'>
                <h3 className='text-[11px] font-black text-[#002EFF] uppercase mb-4 flex items-center gap-2'>
                  <Fingerprint size={14} /> Personal Details
                </h3>
                <div className='space-y-3'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <label className='text-[9px] font-black text-gray-400 uppercase ml-1'>
                        Full Name
                      </label>
                      <Input
                        className='h-8 rounded-lg border-gray-100 bg-gray-50/50 text-[11px] font-bold focus:bg-white'
                        defaultValue='Hilosthone Student'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[9px] font-black text-gray-400 uppercase ml-1'>
                        Email Address
                      </label>
                      <Input
                        className='h-8 rounded-lg border-gray-100 bg-gray-50/50 text-[11px] font-bold focus:bg-white'
                        defaultValue='hilo@dsa-portal.com'
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label className='text-[9px] font-black text-gray-400 uppercase ml-1'>
                      Target Institution
                    </label>
                    <Input
                      className='h-8 rounded-lg border-gray-100 bg-gray-50/50 text-[11px] font-bold focus:bg-white'
                      defaultValue='University of Lagos (UNILAG)'
                    />
                  </div>

                  {/* --- DYNAMIC ACTION BUTTON --- */}
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className={`transition-all duration-300 font-black text-[9px] rounded-lg px-8 h-8 shadow-md mt-2 w-full md:w-auto ${
                      saveSuccess
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-[#002EFF] hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 size={14} className='animate-spin' />
                    ) : saveSuccess ? (
                      <span className='flex items-center gap-2'>
                        <Check size={14} strokeWidth={3} /> SAVED SUCCESSFULLY
                      </span>
                    ) : (
                      'SAVE CHANGES'
                    )}
                  </Button>
                </div>
              </Card>

              <div className='grid grid-cols-2 gap-3'>
                <Card className='p-3 rounded-2xl border-none bg-white shadow-sm flex items-center gap-3'>
                  <div className='h-8 w-8 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0'>
                    <ShieldAlert size={14} />
                  </div>
                  <p className='text-[9px] font-black text-gray-800 leading-tight uppercase'>
                    2FA <br />
                    <span className='text-gray-400 font-bold lowercase'>
                      Disabled
                    </span>
                  </p>
                </Card>
                <Card className='p-3 rounded-2xl border-none bg-white shadow-sm flex items-center gap-3'>
                  <div className='h-8 w-8 bg-blue-50 text-[#002EFF] rounded-lg flex items-center justify-center shrink-0'>
                    <Smartphone size={14} />
                  </div>
                  <p className='text-[9px] font-black text-gray-800 leading-tight uppercase'>
                    Devices <br />
                    <span className='text-gray-400 font-bold lowercase'>
                      2 active
                    </span>
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            <Card className='bg-white rounded-3xl border-none p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]'>
              <div className='h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-[#002EFF] animate-pulse'>
                <Sparkles size={24} />
              </div>
              <h3 className='text-sm font-black text-gray-800 uppercase italic'>
                {activeTab}
              </h3>
              <p className='text-[10px] font-bold text-gray-400 max-w-[200px]'>
                We're currently building this section. Stay tuned!
              </p>
              <Badge className='bg-blue-50 text-[#002EFF] border-none font-black text-[8px]'>
                COMING SOON
              </Badge>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingNavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${active ? 'bg-[#002EFF] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-blue-50'}`}
    >
      <div className='flex items-center gap-2.5'>
        <Icon
          size={14}
          className={
            active
              ? 'text-[#FCB900]'
              : 'text-gray-400 group-hover:text-[#002EFF]'
          }
        />
        <span className='text-[10px] font-black uppercase italic tracking-tight'>
          {label}
        </span>
      </div>
      <ChevronRight
        size={12}
        className={active ? 'text-white/50' : 'text-gray-300'}
      />
    </button>
  )
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <line x1='12' y1='5' x2='12' y2='19'></line>
      <line x1='5' y1='12' x2='19' y2='12'></line>
    </svg>
  )
}