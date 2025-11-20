'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Github, Twitter, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"

export default function Header() {
  const { isSignedIn, isLoaded } = useUser()
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <header className="container flex items-center justify-between py-6 px-4 md:px-0">
      <Link href="/">
        <div className="flex items-baseline gap-2">
          <span className="text-[#9AE65C] font-regular text-xl">ReactAI</span>
          <span className="text-[10px] px-1.5 py-0 rounded bg-black/10 dark:bg-white/10">BETA</span>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        {isLoaded && (
          isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button variant="default" className="bg-[#9AE65C] hover:bg-[#8ad34f] text-black">
                Sign In
              </Button>
            </SignInButton>
          )
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </Button>
        <a href="https://twitter.com/akshaynceo" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon">
            <Twitter className="h-6 w-6" />
            <span className="sr-only">Twitter</span>
          </Button>
        </a>
        <a href="https://github.com/akshaynstack/reactai" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon">
            <Github className="h-6 w-6" />
            <span className="sr-only">GitHub</span>
          </Button>
        </a>
      </div>
    </header>
  );
}
