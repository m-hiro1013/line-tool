// src/app/(dashboard)/store-media-urls/page.tsx
// 店舗×媒体URL管理画面🔥

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Store, Media, StoreMediaUrlWithRelations } from '@/types'

export default function StoreMediaUrlsPage() {
    const [storeMediaUrls, setStoreMediaUrls] = useState<StoreMediaUrlWithRelations[]>([])
    const [stores, setStores] = useState<Store[]>([])
    const [mediaList, setMediaList] = useState<Media[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { toast } = useToast()

    // フォーム状態
    const [formData, setFormData] = useState({
        store_id: '',
        media_id: '',
        url: '',
    })

    // フィルター状態
    const [filterStoreId, setFilterStoreId] = useState<string>('all')

    // データ取得
    const fetchData = async () => {
        try {
            const [urlsRes, storesRes, mediaRes] = await Promise.all([
                fetch('/api/store-media-urls'),
                fetch('/api/stores'),
                fetch('/api/media'),
            ])

            if (!urlsRes.ok || !storesRes.ok || !mediaRes.ok) {
                throw new Error('Failed to fetch')
            }

            const [urlsData, storesData, mediaData] = await Promise.all([
                urlsRes.json(),
                storesRes.json(),
                mediaRes.json(),
            ])

            setStoreMediaUrls(urlsData)
            setStores(storesData)
            setMediaList(mediaData)
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

    // フォームリセット
    const resetForm = () => {
        setFormData({
            store_id: '',
            media_id: '',
            url: '',
        })
    }

    // 保存処理（UPSERT）
    const handleSave = async () => {
        if (!formData.store_id || !formData.media_id || !formData.url) {
            toast({
                title: 'エラー',
                description: '全ての項目を入力してください',
                variant: 'destructive',
            })
            return
        }

        try {
            const res = await fetch('/api/store-media-urls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error('Failed to save')

            toast({
                title: '成功',
                description: 'URLを登録しました',
            })

            setIsDialogOpen(false)
            resetForm()
            fetchData()
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: '保存に失敗しました',
                variant: 'destructive',
            })
        }
    }

    // 削除処理
    const handleDelete = async (item: StoreMediaUrlWithRelations) => {
        const storeName = item.store?.name || '不明'
        const mediaName = item.media?.name || '不明'

        if (!confirm(`「${storeName} × ${mediaName}」のURLを削除しますか？`)) return

        try {
            const res = await fetch(`/api/store-media-urls/${item.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            toast({
                title: '成功',
                description: 'URLを削除しました',
            })

            fetchData()
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: '削除に失敗しました',
                variant: 'destructive',
            })
        }
    }

    // フィルター適用
    const filteredUrls = filterStoreId === 'all'
        ? storeMediaUrls
        : storeMediaUrls.filter((item) => item.store_id === filterStoreId)

    if (loading) {
        return <div className="text-center py-8">読み込み中...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">店舗×媒体URL</h1>
                    <p className="text-slate-600 mt-1">店舗ごとの各媒体URLを管理します</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>+ 新規登録</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>店舗×媒体URL登録</DialogTitle>
                            <DialogDescription>
                                店舗と媒体を選択し、URLを入力してください
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>店舗 *</Label>
                                <Select
                                    value={formData.store_id}
                                    onValueChange={(value) => setFormData({ ...formData, store_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="店舗を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stores.map((store) => (
                                            <SelectItem key={store.id} value={store.id}>
                                                {store.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>媒体 *</Label>
                                <Select
                                    value={formData.media_id}
                                    onValueChange={(value) => setFormData({ ...formData, media_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="媒体を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mediaList.map((media) => (
                                            <SelectItem key={media.id} value={media.id}>
                                                {media.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="url">URL *</Label>
                                <Input
                                    id="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://www.hotpepper.jp/strXXXXXX/"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button onClick={handleSave}>登録</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* フィルター */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Label>店舗で絞り込み：</Label>
                        <Select value={filterStoreId} onValueChange={setFilterStoreId}>
                            <SelectTrigger className="w-64">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">すべての店舗</SelectItem>
                                {stores.map((store) => (
                                    <SelectItem key={store.id} value={store.id}>
                                        {store.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>登録済みURL（{filteredUrls.length}件）</CardTitle>
                </CardHeader>
                <CardContent>
                    {stores.length === 0 || mediaList.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500 mb-2">
                                {stores.length === 0 && '店舗が登録されていません。'}
                                {mediaList.length === 0 && '媒体が登録されていません。'}
                            </p>
                            <p className="text-sm text-slate-400">
                                先に店舗と媒体を登録してください
                            </p>
                        </div>
                    ) : filteredUrls.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">
                            URLがまだ登録されていません
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>店舗</TableHead>
                                    <TableHead>媒体</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUrls.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.store?.name || '-'}
                                        </TableCell>
                                        <TableCell>{item.media?.name || '-'}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {item.url}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(item)}
                                            >
                                                削除
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
