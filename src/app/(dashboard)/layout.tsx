// src/app/(dashboard)/layout.tsx
// ダッシュボード共通レイアウト🔥

import { Sidebar } from '@/components/layout/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
            <Toaster />
        </div>
    )
}
