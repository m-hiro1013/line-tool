// src/app/(dashboard)/page.tsx
// ダッシュボード画面🔥

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickActions = [
    {
        title: '配信作成',
        description: 'Flex Messageを複数店舗に一括配信',
        href: '/broadcast',
        icon: '📤',
        color: 'bg-blue-500',
    },
    {
        title: '店舗管理',
        description: '店舗の追加・編集・LINE連携設定',
        href: '/stores',
        icon: '🏪',
        color: 'bg-green-500',
    },
    {
        title: 'テンプレート',
        description: 'Flex Messageテンプレートの管理',
        href: '/templates',
        icon: '📝',
        color: 'bg-purple-500',
    },
    {
        title: '媒体管理',
        description: '予約媒体（ホットペッパー等）の管理',
        href: '/media',
        icon: '📱',
        color: 'bg-orange-500',
    },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">ダッシュボード</h1>
                <p className="text-slate-600 mt-2">
                    飲食店LINE運用効率化ツールへようこそ！
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action) => (
                    <Card key={action.href} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-2xl mb-2`}>
                                {action.icon}
                            </div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            <CardDescription>{action.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={action.href}>
                                <Button variant="outline" className="w-full">
                                    開く
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>使い方</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-600">
                    <div className="flex gap-4 items-start">
                        <span className="bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-slate-700">1</span>
                        <div>
                            <p className="font-medium text-slate-900">店舗を登録</p>
                            <p className="text-sm">店舗名とLINEチャネルアクセストークンを登録します</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-slate-700">2</span>
                        <div>
                            <p className="font-medium text-slate-900">媒体・URLを設定</p>
                            <p className="text-sm">ホットペッパー等の媒体と、店舗ごとのURLを登録します</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-slate-700">3</span>
                        <div>
                            <p className="font-medium text-slate-900">テンプレートを作成</p>
                            <p className="text-sm">Flex Message SimulatorでJSONを作り、テンプレートとして登録します</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-slate-700">4</span>
                        <div>
                            <p className="font-medium text-slate-900">一括配信！</p>
                            <p className="text-sm">テンプレートを選んで、複数店舗に一括配信します</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
