'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-2">
            <span className="p-2 bg-emerald-600 rounded-lg text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            <span className="font-bold text-xl tracking-tight text-white">
              YANE<span className="text-emerald-400">IRRIGATION</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-zinc-200 hover:text-emerald-400 transition-colors">Solutions</Link>
            <Link href="#metrics" className="text-sm font-medium text-zinc-200 hover:text-emerald-400 transition-colors">Modélisation</Link>
            <Link href="#about" className="text-sm font-medium text-zinc-200 hover:text-emerald-400 transition-colors">Technologie</Link>
          </div>

          {/* Dashboard Action Trigger */}
          <div className="hidden md:flex items-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-100 rounded-xl shadow-sm transition-all hover:scale-[1.02] gap-2">
              Tableau de bord
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {/* Correction : Changement de text-zinc-600 à text-white pour être visible sur l'image sombre */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-md text-white hover:text-emerald-400 focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        // Correction : Modification du fond en zinc-900/95 pour rester en harmonie avec le thème sombre du haut
        <div className="md:hidden bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-800 px-4 pt-2 pb-6 space-y-3">
          <Link href="#features" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Solutions</Link>
          <Link href="#metrics" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Modélisation</Link>
          <Link href="#about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Technologie</Link>
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-semibold text-white bg-emerald-600 text-center shadow-md">Accéder au Dashboard</Link>
        </div>
      )}
    </nav>
  );
}