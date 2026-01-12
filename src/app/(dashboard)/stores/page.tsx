// src/app/(dashboard)/stores/page.tsx
// 店舗管理画面🔥

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
import { Store } from '@/types'

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingStore, setEditingStore] = useState<Store | null>(null)
    const { toast } = useToast()

    // フォーム状態
    const [formData, setFormData] = useState({
        name: '',
        line_channel_id: '',
        line_channel_secret: '',
        line_channel_access_token: '',
        webhook_url: '',
    })

    // 店舗一覧取得
    const fetchStores = async () => {
        try {
            const res = await fetch('/api/stores')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setStores(data)
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: '店舗一覧の取得に失敗しました',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    // フォームリセット
    const resetForm = () => {
        setFormData({
            name: '',
            line_channel_id: '',
            line_channel_secret: '',
            line_channel_access_token: '',
            webhook_url: '',
        })
        setEditingStore(null)
    }

    // ダイアログを開く（新規作成）
    const openCreateDialog = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    // ダイアログを開く（編集）
    const openEditDialog = (store: Store) => {
        setEditingStore(store)
        setFormData({
            name: store.name,
            line_channel_id: store.line_channel_id || '',
            line_channel_secret: store.line_channel_secret || '',
            line_channel_access_token: store.line_channel_access_token,
            webhook_url: store.webhook_url || '',
        })
        setIsDialogOpen(true)
    }

    // 保存処理
    const handleSave = async () => {
        if (!formData.name || !formData.line_channel_access_token) {
            toast({
                title: 'エラー',
                description: '店舗名とチャネルアクセストークンは必須です',
                variant: 'destructive',
            })
            return
        }

        try {
            const url = editingStore ? `/api/stores/${editingStore.id}` : '/api/stores'
            const method = editingStore ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error('Failed to save')

            toast({
                title: '成功',
                description: editingStore ? '店舗を更新しました' : '店舗を登録しました',
            })

            setIsDialogOpen(false)
            resetForm()
            fetchStores()
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
    const handleDelete = async (store: Store) => {
        if (!confirm(`「${store.name}」を削除しますか？`)) return

        try {
            const res = await fetch(`/api/stores/${store.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            toast({
                title: '成功',
                description: '店舗を削除しました',
            })

            fetchStores()
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
                    <h1 className="text-3xl font-bold text-slate-900">店舗管理</h1>
                    <p className="text-slate-600 mt-1">店舗情報とLINE連携設定を管理します</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>+ 新規登録</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingStore ? '店舗編集' : '店舗登録'}</DialogTitle>
                            <DialogDescription>
                                店舗情報とLINE認証情報を入力してください
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">店舗名 *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="渋谷店"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="line_channel_access_token">チャネルアクセストークン *</Label>
                                <Input
                                    id="line_channel_access_token"
                                    value={formData.line_channel_access_token}
                                    onChange={(e) => setFormData({ ...formData, line_channel_access_token: e.target.value })}
                                    placeholder="長期チャネルアクセストークン"
                                    type="password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="line_channel_id">チャネルID（任意）</Label>
                                <Input
                                    id="line_channel_id"
                                    value={formData.line_channel_id}
                                    onChange={(e) => setFormData({ ...formData, line_channel_id: e.target.value })}
                                    placeholder="1234567890"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="line_channel_secret">チャネルシークレット（任意）</Label>
                                <Input
                                    id="line_channel_secret"
                                    value={formData.line_channel_secret}
                                    onChange={(e) => setFormData({ ...formData, line_channel_secret: e.target.value })}
                                    placeholder="Webhook検証用"
                                    type="password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="webhook_url">Webhook URL（任意）</Label>
                                <Input
                                    id="webhook_url"
                                    value={formData.webhook_url}
                                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button onClick={handleSave}>
                                {editingStore ? '更新' : '登録'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>登録済み店舗</CardTitle>
                </CardHeader>
                <CardContent>
                    {stores.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">
                            店舗がまだ登録されていません
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>店舗名</TableHead>
                                    <TableHead>チャネルID</TableHead>
                                    <TableHead>登録日</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stores.map((store) => (
                                    <TableRow key={store.id}>
                                        <TableCell className="font-medium">{store.name}</TableCell>
                                        <TableCell>{store.line_channel_id || '-'}</TableCell>
                                        <TableCell>
                                            {new Date(store.created_at).toLocaleDateString('ja-JP')}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(store)}
                                            >
                                                編集
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(store)}
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
