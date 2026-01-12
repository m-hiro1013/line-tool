// src/app/(dashboard)/media/page.tsx
// 媒体管理画面🔥

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Media } from '@/types'

export default function MediaPage() {
    const [mediaList, setMediaList] = useState<Media[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newMediaName, setNewMediaName] = useState('')
    const { toast } = useToast()

    // 媒体一覧取得
    const fetchMedia = async () => {
        try {
            const res = await fetch('/api/media')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setMediaList(data)
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: '媒体一覧の取得に失敗しました',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedia()
    }, [])

    // 新規登録
    const handleCreate = async () => {
        if (!newMediaName.trim()) {
            toast({
                title: 'エラー',
                description: '媒体名を入力してください',
                variant: 'destructive',
            })
            return
        }

        try {
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newMediaName.trim() }),
            })

            if (res.status === 409) {
                toast({
                    title: 'エラー',
                    description: 'この媒体名は既に登録されています',
                    variant: 'destructive',
                })
                return
            }

            if (!res.ok) throw new Error('Failed to create')

            toast({
                title: '成功',
                description: '媒体を登録しました',
            })

            setIsDialogOpen(false)
            setNewMediaName('')
            fetchMedia()
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: '登録に失敗しました',
                variant: 'destructive',
            })
        }
    }

    // 削除処理
    const handleDelete = async (media: Media) => {
        if (!confirm(`「${media.name}」を削除しますか？\n※この媒体に紐づく店舗URLも削除されます`)) return

        try {
            const res = await fetch(`/api/media/${media.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            toast({
                title: '成功',
                description: '媒体を削除しました',
            })

            fetchMedia()
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: '削除に失敗しました',
                variant: 'destructive',
            })
        }
    }

    if (loading) {
        return <div className="text-center py-8">読み込み中...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">媒体管理</h1>
                    <p className="text-slate-600 mt-1">予約媒体（ホットペッパー、食べログ等）を管理します</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setNewMediaName('')}>+ 新規登録</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>媒体登録</DialogTitle>
                            <DialogDescription>
                                新しい媒体名を入力してください
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="media_name">媒体名 *</Label>
                                <Input
                                    id="media_name"
                                    value={newMediaName}
                                    onChange={(e) => setNewMediaName(e.target.value)}
                                    placeholder="ホットペッパー"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreate()
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button onClick={handleCreate}>登録</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>登録済み媒体</CardTitle>
                </CardHeader>
                <CardContent>
                    {mediaList.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500 mb-4">媒体がまだ登録されていません</p>
                            <p className="text-sm text-slate-400">
                                例：ホットペッパー、食べログ、Instagram、Google Map など
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>媒体名</TableHead>
                                    <TableHead>登録日</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mediaList.map((media) => (
                                    <TableRow key={media.id}>
                                        <TableCell className="font-medium">{media.name}</TableCell>
                                        <TableCell>
                                            {new Date(media.created_at).toLocaleDateString('ja-JP')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(media)}
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

            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <h3 className="font-medium text-blue-900 mb-2">💡 媒体とは？</h3>
                    <p className="text-sm text-blue-700">
                        媒体は、予約サイトやSNSなど、店舗ごとに異なるURLを持つサービスのことです。
                        ここで媒体を登録し、「店舗×媒体URL」画面で各店舗のURLを設定します。
                        テンプレートの {'{{media_url}}'} が、配信時に店舗ごとのURLに置き換わります。
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
