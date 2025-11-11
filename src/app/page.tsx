"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppData } from "@/lib/app-data"
import { MasterTab } from "./_components/master/master-tab"
import { ProductTab } from "./_components/product/product-tab"
import { CostTab } from "./_components/cost/cost-tab"


export default function Home() {
  const { data, hydrated, actions } = useAppData()
  const [activeTab, setActiveTab] = useState("cost")
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-10 text-muted-foreground">
        ローカルストレージからデータを読み込み中です...
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Cost App ローカルプロトタイプ</h1>
        <p className="text-muted-foreground">
          ローカルストレージに保存しながら、マスタ登録→商品登録→原価入力→サマリ確認まで体験できる Next.js + shadcn UI の試作です。
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">マスタ {data.materials.length + data.packagingItems.length + data.laborRoles.length + data.equipments.length} 件</Badge>
          <Badge variant="outline">商品 {data.products.length} 件</Badge>
          <Badge variant="outline">コスト明細 {Object.values(data.costEntries).reduce((sum, list) => sum + list.length, 0)} 件</Badge>
          <Button variant="outline" size="sm" onClick={actions.seedSample}>
            デモデータ投入
          </Button>
          <Button variant="ghost" size="sm" onClick={actions.resetAll}>
            ローカル保存をクリア
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cost">原価サマリ</TabsTrigger>
          <TabsTrigger value="product">商品登録</TabsTrigger>
          <TabsTrigger value="master">マスタ登録</TabsTrigger>
          <TabsTrigger value="list">商品一覧</TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="space-y-6">
          <CostTab data={data} />
        </TabsContent>

        <TabsContent value="product" className="space-y-6">
          <ProductTab
            data={data}
            actions={actions}
            editingProductId={editingProductId}
            onRequestEditClear={() => setEditingProductId(null)}
          />
        </TabsContent>

        <TabsContent value="master" className="space-y-6">
          <MasterTab data={data} actions={actions} />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>商品一覧</CardTitle>
              <CardDescription>登録済み商品のカテゴリ・サイズを確認</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.products.length === 0 ? (
                <p className="text-sm text-muted-foreground">まだ商品がありません。</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品</TableHead>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead>サイズ/個数</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((product) => {
                      const categoryPath = [
                        data.categories.large.find((c) => c.id === product.categoryLargeId)?.name,
                        data.categories.medium.find((c) => c.id === product.categoryMediumId)?.name,
                        data.categories.small.find((c) => c.id === product.categorySmallId)?.name,
                      ]
                        .filter(Boolean)
                        .join(" / ") || "-"

                      const sizeText = (product.sizeVariants ?? [])
                        .filter((variant) => variant.label?.trim())
                        .map((variant) => `${variant.label}: ${variant.quantity}個`)
                        .join(" / ") || "-"

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{categoryPath}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{sizeText}</TableCell>
                          <TableCell className="w-20 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingProductId(product.id)
                                setActiveTab("product")
                              }}
                            >
                              編集
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
