"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppData } from "@/lib/app-data"
import { MasterTab } from "./_components/master/master-tab"
import { ProductTab } from "./_components/product/product-tab"
import { CostTab } from "./_components/cost/cost-tab"


export default function Home() {
  const { data, hydrated, actions } = useAppData()

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

      <Tabs defaultValue="cost">
        <TabsList>
          <TabsTrigger value="cost">原価サマリ</TabsTrigger>
          <TabsTrigger value="product">商品登録</TabsTrigger>
          <TabsTrigger value="master">マスタ登録</TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="space-y-6">
          <CostTab data={data} />
        </TabsContent>

        <TabsContent value="product" className="space-y-6">
          <ProductTab data={data} actions={actions} />
        </TabsContent>

        <TabsContent value="master" className="space-y-6">
          <MasterTab data={data} actions={actions} />
        </TabsContent>

      </Tabs>
    </main>
  )
}
