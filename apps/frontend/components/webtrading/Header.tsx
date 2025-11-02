import React from 'react'
import Image from 'next/image'
import { TradingInstrument } from '@/lib/types'
import { PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  assets : TradingInstrument[]
}
export const Header = ({ assets} : HeaderProps) => {
    const router = useRouter();
    
  return (
    <div className='bg-[#141d22] w-full h-full flex justify-between text-neutral-400 '>
        <div>
            <Image 
            src="/logo_yellow.svg"
            alt="Logo"
            width={120}
            height={40}
            className='ml-2'
            />
        </div>


        <div className='flex space-x-16 justify-start items-center'>
        {assets?.map((asset) => (
          <div
            key={asset.symbol}
            className={`flex flex-col items-center cursor-pointer hover:opacity-100 transition `}
          >
            <Image
              src={asset.img_url}
              alt={asset.symbol}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
  
          </div>
        ))}
        </div>
        
        <button
          onClick={() => router.push("/deposit")}
          className="flex items-center gap-2 text-sm bg-neutral-800  text-neutral-300 px-12 py-1.5 rounded-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          Deposit
        </button>
        
        

    </div>
  )
}
