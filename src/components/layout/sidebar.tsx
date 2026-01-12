// src/components/layout/sidebar.tsx
// サイドバーナビゲーション🔥

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/', label: 'ダッシュボード', icon: '📊' },
    { href: '/stores', label: '店舗管理', icon: '🏪' },
    { href: '/templates', label: 'テンプレート', icon: '📝' },
    { href: '/media', label: '媒体管理', icon: '📱' },
    { href: '/store-media-urls', label: '店舗×媒体URL', icon: '🔗' },
    { href: '/broadcast', label: '配信作成', icon: '📤' },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 min-h-screen bg-slate-900 text-white p-4">
            <div className="mb-8">
                <h1 className="text-xl font-bold">LINE運用ツール</h1>
                <p className="text-sm text-slate-400">飲食店向け</p>
            </div>

            <nav className="space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
