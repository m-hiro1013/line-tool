// src/app/(dashboard)/broadcast/page.tsx
// 配信作成画面🔥

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Store, Template, Media, StoreMediaUrlWithRelations, BroadcastResult } from '@/types'

export default function BroadcastPage() {
    const [stores, setStores] = useState<Store[]>([])
    const [templates, setTemplates] = useState<Template[]>([])
    const [mediaList, setMediaList] = useState<Media[]>([])
    const [storeMediaUrls, setStoreMediaUrls] = useState<StoreMediaUrlWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const { toast } = useToast()

    // 選択状態
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
    const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
    const [mediaSelections, setMediaSelections] = useState<Record<string, string>>({})

    // 日時指定
    const [scheduledDate, setScheduledDate] = useState<string>('')
    const [scheduledTime, setScheduledTime] = useState<string>('')

    // テスト配信用
    const [testUserId, setTestUserId] = useState<string>(
        process.env.NEXT_PUBLIC_LINE_TEST_USER_ID || ''
    )
    const [testStoreId, setTestStoreId] = useState<string>('')

    // 配信結果
    const [result, setResult] = useState<BroadcastResult | null>(null)
    const [scheduleResult, setScheduleResult] = useState<{ message: string } | null>(null)

    // データ取得
    const fetchData = async () => {
        try {
            const [storesRes, templatesRes, mediaRes, urlsRes] = await Promise.all([
                fetch('/api/stores'),
                fetch('/api/templates'),
                fetch('/api/media'),
                fetch('/api/store-media-urls'),
            ])

            if (!storesRes.ok || !templatesRes.ok || !mediaRes.ok || !urlsRes.ok) {
                throw new Error('Failed to fetch')
            }

            const [storesData, templatesData, mediaData, urlsData] = await Promise.all([
                storesRes.json(),
                templatesRes.json(),
                mediaRes.json(),
                urlsRes.json(),
            ])

            setStores(storesData)
            setTemplates(templatesData)
            setMediaList(mediaData)
            setStoreMediaUrls(urlsData)
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: 'データの取得に失敗しました',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // 店舗の選択切り替え
    const toggleStoreSelection = (storeId: string) => {
        setSelectedStoreIds((prev) => {
            if (prev.includes(storeId)) {
                const newMediaSelections = { ...mediaSelections }
                delete newMediaSelections[storeId]
                setMediaSelections(newMediaSelections)
                return prev.filter((id) => id !== storeId)
            } else {
                return [...prev, storeId]
            }
        })
    }

    // 全店舗選択/解除
    const toggleAllStores = () => {
        if (selectedStoreIds.length === stores.length) {
            setSelectedStoreIds([])
            setMediaSelections({})
        } else {
            setSelectedStoreIds(stores.map((s) => s.id))
        }
    }

    // 店舗に対して利用可能な媒体を取得
    const getAvailableMediaForStore = (storeId: string) => {
        return storeMediaUrls
            .filter((url) => url.store_id === storeId)
            .map((url) => ({
                media: mediaList.find((m) => m.id === url.media_id),
                url: url.url,
            }))
            .filter((item) => item.media !== undefined)
    }

    // 媒体選択の更新
    const updateMediaSelection = (storeId: string, mediaId: string) => {
        setMediaSelections((prev) => ({
            ...prev,
            [storeId]: mediaId,
        }))
    }

    // テスト配信
    const handleTestBroadcast = async () => {
        if (!selectedTemplateId) {
            toast({ title: 'エラー', description: 'テンプレートを選択してください', variant: 'destructive' })
            return
        }
        if (!testStoreId) {
            toast({ title: 'エラー', description: 'テスト配信する店舗を選択してください', variant: 'destructive' })
            return
        }
        if (!testUserId) {
            toast({ title: 'エラー', description: 'テスト配信先のユーザーIDを入力してください', variant: 'destructive' })
            return
        }

        const testMediaId = mediaSelections[testStoreId]
        if (!testMediaId) {
            toast({ title: 'エラー', description: 'テスト店舗の媒体を選択してください', variant: 'destructive' })
            return
        }

        setSending(true)
        try {
            const res = await fetch('/api/broadcast/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: selectedTemplateId,
                    store_id: testStoreId,
                    media_id: testMediaId,
                    test_user_id: testUserId,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                toast({ title: 'テスト配信完了！', description: 'LINEを確認してください' })
            } else {
                toast({ title: 'エラー', description: data.error || 'テスト配信に失敗しました', variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error:', error)
            toast({ title: 'エラー', description: 'テスト配信に失敗しました', variant: 'destructive' })
        } finally {
            setSending(false)
        }
    }

    // 日時指定配信
    const handleScheduleBroadcast = async () => {
        if (!selectedTemplateId) {
            toast({ title: 'エラー', description: 'テンプレートを選択してください', variant: 'destructive' })
            return
        }
        if (selectedStoreIds.length === 0) {
            toast({ title: 'エラー', description: '配信先の店舗を選択してください', variant: 'destructive' })
            return
        }

        const missingMedia = selectedStoreIds.filter((id) => !mediaSelections[id])
        if (missingMedia.length > 0) {
            const storeNames = missingMedia.map((id) => stores.find((s) => s.id === id)?.name).join(', ')
            toast({ title: 'エラー', description: `以下の店舗で媒体が選択されていません: ${storeNames}`, variant: 'destructive' })
            return
        }

        if (!scheduledDate || !scheduledTime) {
            toast({ title: 'エラー', description: '配信日時を指定してください', variant: 'destructive' })
            return
        }

        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`)
        if (scheduledAt <= new Date()) {
            toast({ title: 'エラー', description: '配信日時は現在より後の日時を指定してください', variant: 'destructive' })
            return
        }

        if (!confirm(`${selectedStoreIds.length}店舗に ${scheduledAt.toLocaleString('ja-JP')} 配信予約します。よろしいですか？`)) {
            return
        }

        setSending(true)
        setResult(null)
        setScheduleResult(null)

        try {
            const res = await fetch('/api/broadcast/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: selectedTemplateId,
                    store_ids: selectedStoreIds,
                    media_selections: mediaSelections,
                    scheduled_at: scheduledAt.toISOString(),
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setScheduleResult({ message: data.message })
                toast({ title: '予約完了！', description: data.message })
            } else {
                toast({ title: 'エラー', description: data.error || '予約に失敗しました', variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error:', error)
            toast({ title: 'エラー', description: '予約に失敗しました', variant: 'destructive' })
        } finally {
            setSending(false)
        }
    }

    // リセット
    const handleReset = () => {
        setSelectedTemplateId('')
        setSelectedStoreIds([])
        setMediaSelections({})
        setScheduledDate('')
        setScheduledTime('')
        setTestUserId('')
        setTestStoreId('')
        setResult(null)
        setScheduleResult(null)
    }

    if (loading) {
        return <div className="text-center py-8">読み込み中...</div>
    }

    const hasStores = stores.length > 0
    const hasTemplates = templates.length > 0
    const hasMedia = mediaList.length > 0

    if (!hasStores || !hasTemplates || !hasMedia) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">配信作成</h1>
                    <p className="text-slate-600 mt-1">Flex Messageを複数店舗に一括配信します</p>
                </div>
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="text-orange-800">事前準備が必要です</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-orange-700">
                        {!hasStores && <p>・店舗を登録してください</p>}
                        {!hasTemplates && <p>・テンプレートを登録してください</p>}
                        {!hasMedia && <p>・媒体を登録してください</p>}
                        <p className="text-sm mt-4">
                            サイドバーから各管理画面に移動して、データを登録してください。
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">配信作成</h1>
                    <p className="text-slate-600 mt-1">Flex Messageを複数店舗に一括配信します</p>
                </div>
                <Button variant="outline" onClick={handleReset}>
                    リセット
                </Button>
            </div>

            {/* Step 1: テンプレート選択 */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: テンプレート選択</CardTitle>
                    <CardDescription>配信するFlex Messageを選択してください</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="テンプレートを選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Step 2: 店舗選択 */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 2: 配信先店舗を選択</CardTitle>
                    <CardDescription>
                        配信する店舗を選択してください（{selectedStoreIds.length}/{stores.length}店舗選択中）
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Button variant="outline" size="sm" onClick={toggleAllStores}>
                            {selectedStoreIds.length === stores.length ? 'すべて解除' : 'すべて選択'}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stores.map((store) => {
                            const isSelected = selectedStoreIds.includes(store.id)
                            const availableMedia = getAvailableMediaForStore(store.id)

                            return (
                                <div
                                    key={store.id}
                                    className={`p-4 rounded-lg border-2 transition-colors ${isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleStoreSelection(store.id)}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="font-medium">{store.name}</span>
                                    </div>

                                    {isSelected && (
                                        <div className="ml-8">
                                            {availableMedia.length === 0 ? (
                                                <p className="text-sm text-orange-600">
                                                    ⚠️ この店舗にはURLが登録されていません
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label className="text-sm">媒体を選択:</Label>
                                                    <Select
                                                        value={mediaSelections[store.id] || ''}
                                                        onValueChange={(value) => updateMediaSelection(store.id, value)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="媒体を選択" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableMedia.map((item) => (
                                                                <SelectItem key={item.media!.id} value={item.media!.id}>
                                                                    {item.media!.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Step 3: テスト配信 */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="text-blue-800">Step 3: テスト配信（推奨）</CardTitle>
                    <CardDescription className="text-blue-600">
                        本番配信前に、自分のLINEで内容を確認できます
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>テストする店舗</Label>
                            <Select value={testStoreId} onValueChange={setTestStoreId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="店舗を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedStoreIds.map((storeId) => {
                                        const store = stores.find((s) => s.id === storeId)
                                        return (
                                            <SelectItem key={storeId} value={storeId}>
                                                {store?.name}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>あなたのLINEユーザーID</Label>
                            <Input
                                value={testUserId}
                                onChange={(e) => setTestUserId(e.target.value)}
                                placeholder="U1234567890abcdef..."
                            />
                            <p className="text-xs text-blue-600">
                                💡 LINE Developersの「チャネル基本設定」→「あなたのユーザーID」で確認できます
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleTestBroadcast}
                        disabled={sending || !selectedTemplateId || !testStoreId || !testUserId}
                        variant="outline"
                        className="border-blue-500 text-blue-700 hover:bg-blue-100"
                    >
                        {sending ? '送信中...' : 'テスト配信する'}
                    </Button>
                </CardContent>
            </Card>

            {/* Step 4: 本番配信（日時指定） */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 4: 本番配信（日時指定）</CardTitle>
                    <CardDescription>指定した日時に全友だちへ配信されます</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-100 p-4 rounded-lg">
                        <p><strong>テンプレート:</strong> {templates.find((t) => t.id === selectedTemplateId)?.name || '未選択'}</p>
                        <p><strong>配信先:</strong> {selectedStoreIds.length}店舗</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>配信日</Label>
                            <Input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>配信時刻</Label>
                            <Input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleScheduleBroadcast}
                        disabled={sending || !selectedTemplateId || selectedStoreIds.length === 0 || !scheduledDate || !scheduledTime}
                        className="w-full"
                        size="lg"
                    >
                        {sending ? '予約中...' : `${selectedStoreIds.length}店舗に配信予約する`}
                    </Button>
                </CardContent>
            </Card>

            {/* 予約結果 */}
            {scheduleResult && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-green-800">予約完了</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-700">{scheduleResult.message}</p>
                    </CardContent>
                </Card>
            )}

            {/* 配信結果（即時配信用・将来の拡張用） */}
            {result && (
                <Card className={result.failed_count === 0 ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
                    <CardHeader>
                        <CardTitle className={result.failed_count === 0 ? 'text-green-800' : 'text-orange-800'}>
                            配信結果
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p>成功: {result.sent_count}件 / 失敗: {result.failed_count}件</p>
                            <div className="space-y-1">
                                {result.results.map((r) => (
                                    <div
                                        key={r.store_id}
                                        className={`text-sm ${r.success ? 'text-green-700' : 'text-red-700'}`}
                                    >
                                        {r.success ? '✅' : '❌'} {r.store_name}
                                        {r.error && ` - ${r.error}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
