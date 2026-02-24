'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100 px-4 md:px-12">
      {/* 'max-w-[1440px]' ensures the content doesn't get too wide on massive monitors, 
        'justify-between' pushes the logo to the far left and the buttons to the far right.
      */}
      <div className="max-w-[1440px] mx-auto py-3 md:py-5 flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/PulaPathLogo-removebg-preview.png" 
            alt="PulaPath Logo" 
            width={35} 
            height={35} 
            className="rounded-lg md:w-[45px] md:h-[45px]"
          />
          <span className="text-lg md:text-2xl font-bold text-blue-950">
            Pula<span className="text-blue-600">Path</span>
          </span>
        </Link>

        {/* CENTER: Desktop Links (Hidden on Phone) */}
        <div className="hidden md:flex items-center space-x-10 font-bold text-slate-600">
          <Link href="/discover" className="hover:text-blue-600 hover:translate-y-[-2px] transition-all duration-200">
            Discover
          </Link>
          <Link href="#" className="hover:text-blue-600 hover:translate-y-[-2px] transition-all duration-200">
            How it Works
          </Link>
        </div>

        {/* FAR RIGHT: Auth Actions & Mobile Toggle */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link 
            href="/login" 
            className="hidden sm:block text-slate-700 font-bold hover:text-blue-600 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="bg-blue-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm font-black hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:scale-95 transition-all"
          >
            Join
          </Link>
          
          {/* Mobile Menu Toggle (Only visible on Android) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {isOpen ? <span className="text-xl">✕</span> : <span className="text-xl text-bold">☰</span>}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN (Accessed via Toggle) */}
      {isOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-b border-blue-100 px-6 py-6 flex flex-col space-y-5 font-bold text-slate-600 shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <Link 
            href="/discover" 
            onClick={() => setIsOpen(false)}
            className="py-2 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            Discover
          </Link>
          <Link 
            href="#" 
            onClick={() => setIsOpen(false)}
            className="py-2 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            How it Works
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
             <Link href="/login" className="px-4 py-2 text-blue-600">Sign In</Link>
          </div>
        </div>
      )}
    </nav>
  );
}