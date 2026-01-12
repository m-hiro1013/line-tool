// src/app/(dashboard)/templates/page.tsx
// テンプレート管理画面🔥

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Template } from '@/types'

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
    const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null)
    const { toast } = useToast()

    // フォーム状態
    const [formData, setFormData] = useState({
        name: '',
        json_content: '',
        thumbnail_url: '',
    })

    // テンプレート一覧取得
    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setTemplates(data)
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'エラー',
                description: 'テンプレート一覧の取得に失敗しました',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    // フォームリセット
    const resetForm = () => {
        setFormData({
            name: '',
            json_content: '',
            thumbnail_url: '',
        })
        setEditingTemplate(null)
    }

    // ダイアログを開く（新規作成）
    const openCreateDialog = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    // ダイアログを開く（編集）
    const openEditDialog = (template: Template) => {
        setEditingTemplate(template)
        setFormData({
            name: template.name,
            json_content: JSON.stringify(template.json_content, null, 2),
            thumbnail_url: template.thumbnail_url || '',
        })
        setIsDialogOpen(true)
    }

    // JSONプレビューを開く
    const openViewDialog = (template: Template) => {
        setViewingTemplate(template)
        setIsViewDialogOpen(true)
    }

    // 保存処理
    const handleSave = async () => {
        if (!formData.name || !formData.json_content) {
            toast({
                title: 'エラー',
                description: 'テンプレート名とJSON内容は必須です',
                variant: 'destructive',
            })
            return
        }

        // JSONパース確認
        let parsedJson
        try {
            parsedJson = JSON.parse(formData.json_content)
        } catch {
            toast({
                title: 'エラー',
                description: 'JSONの形式が正しくありません',
                variant: 'destructive',
            })
            return
        }

        try {
            const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates'
            const method = editingTemplate ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    json_content: parsedJson,
                    thumbnail_url: formData.thumbnail_url || null,
                }),
            })

            if (!res.ok) throw new Error('Failed to save')

            toast({
                title: '成功',
                description: editingTemplate ? 'テンプレートを更新しました' : 'テンプレートを登録しました',
            })

            setIsDialogOpen(false)
            resetForm()
            fetchTemplates()
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
    const handleDelete = async (template: Template) => {
        if (!confirm(`「${template.name}」を削除しますか？`)) return

        try {
            const res = await fetch(`/api/templates/${template.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            toast({
                title: '成功',
                description: 'テンプレートを削除しました',
            })

            fetchTemplates()
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
                    <h1 className="text-3xl font-bold text-slate-900">テンプレート管理</h1>
                    <p className="text-slate-600 mt-1">Flex Messageのテンプレートを管理します</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>+ 新規登録</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTemplate ? 'テンプレート編集' : 'テンプレート登録'}</DialogTitle>
                            <DialogDescription>
                                Flex Message SimulatorのJSONを貼り付けてください
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">テンプレート名 *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="新メニュー告知"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="json_content">JSON内容 *</Label>
                                <Textarea
                                    id="json_content"
                                    value={formData.json_content}
                                    onChange={(e) => setFormData({ ...formData, json_content: e.target.value })}
                                    placeholder='{"type": "bubble", ...}'
                                    rows={15}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500">
                                    💡 URLを動的に変えたい箇所は {'{{media_url}}'} と記載してください
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="thumbnail_url">サムネイルURL（任意）</Label>
                                <Input
                                    id="thumbnail_url"
                                    value={formData.thumbnail_url}
                                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button onClick={handleSave}>
                                {editingTemplate ? '更新' : '登録'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>登録済みテンプレート</CardTitle>
                </CardHeader>
                <CardContent>
                    {templates.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500 mb-4">テンプレートがまだ登録されていません</p>
                            <a
                                href="https://developers.line.biz/flex-message-simulator/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Flex Message Simulatorでデザインを作成する →
                            </a>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>テンプレート名</TableHead>
                                    <TableHead>登録日</TableHead>
                                    <TableHead>更新日</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>
                                            {new Date(template.created_at).toLocaleDateString('ja-JP')}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(template.updated_at).toLocaleDateString('ja-JP')}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openViewDialog(template)}
                                            >
                                                JSON確認
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(template)}
                                            >
                                                編集
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(template)}
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

            {/* JSONプレビューダイアログ */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{viewingTemplate?.name}</DialogTitle>
                        <DialogDescription>JSON内容</DialogDescription>
                    </DialogHeader>
                    <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                        {viewingTemplate && JSON.stringify(viewingTemplate.json_content, null, 2)}
                    </pre>
                </DialogContent>
            </Dialog>
        </div>
    )
}
