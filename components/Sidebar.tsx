'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <div className="text-2xl font-bold mb-6">My App</div>
      <nav className="flex flex-col space-y-2">
        <Link
          href="/dashboard"
          className={clsx(
            'flex items-center space-x-2 p-2 rounded hover:bg-gray-700',
            pathname === '/dashboard' && 'bg-gray-700'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
      </nav>
    </aside>
  )
}
