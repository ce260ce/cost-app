"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { calculateProductUnitCosts, formatCurrency } from "@/lib/calculations"
import { useAppData } from "@/lib/app-data"
import type {
  Equipment,
  LaborRole,
  Material,
  PackagingItem,
  Product,
} from "@/lib/types"

const currencyOptions = ["JPY", "USD", "EUR"]

export default function Home() {
  const { data, hydrated, actions } = useAppData()

  const [largeCategory, setLargeCategory] = useState({ name: "", description: "" })
  const [mediumCategory, setMediumCategory] = useState({ name: "", description: "", largeId: "" })
  const [smallCategory, setSmallCategory] = useState({ name: "", description: "", mediumId: "" })

  const [materialForm, setMaterialForm] = useState<Omit<Material, "id">>({
    name: "",
    unit: "kg",
    sizeDescription: "",
    currency: "JPY",
    note: "",
  })

  const [packagingForm, setPackagingForm] = useState<Omit<PackagingItem, "id">>({
    name: "",
    unit: "set",
    sizeDescription: "",
    currency: "JPY",
    note: "",
  })

  const [laborForm, setLaborForm] = useState<Omit<LaborRole, "id">>({
    name: "",
    hourlyRate: 1800,
    currency: "JPY",
    note: "",
  })

  const [equipmentForm, setEquipmentForm] = useState<Omit<Equipment, "id">>({
    name: "",
    acquisitionCost: 0,
    currency: "JPY",
    amortizationYears: 5,
    note: "",
  })

  const [productForm, setProductForm] = useState<Omit<Product, "id">>({
    name: "",
    categoryLargeId: "",
    categoryMediumId: "",
    categorySmallId: "",
    sizes: [],
    baseManHours: 0,
    defaultElectricityCost: 0,
    registeredAt: new Date().toISOString().slice(0, 10),
    options: [],
    expectedProduction: {
      periodYears: 1,
      quantity: 1000,
    },
    equipmentIds: [],
  })

  const [materialCostForm, setMaterialCostForm] = useState({
    productId: "",
    materialId: "",
    description: "",
    costPerUnit: 0,
    currency: "JPY",
  })

  const [packagingCostForm, setPackagingCostForm] = useState({
    productId: "",
    packagingItemId: "",
    quantity: 1,
    costPerUnit: 0,
    currency: "JPY",
  })

  const [laborCostForm, setLaborCostForm] = useState({
    productId: "",
    laborRoleId: "",
    hours: 1,
    peopleCount: 1,
    hourlyRateOverride: "",
  })

  const [outsourcingForm, setOutsourcingForm] = useState({
    productId: "",
    costPerUnit: 0,
    currency: "JPY",
    note: "",
  })

  const [developmentForm, setDevelopmentForm] = useState({
    productId: "",
    prototypeLaborCost: 0,
    prototypeMaterialCost: 0,
    toolingCost: 0,
    amortizationYears: 3,
  })

  const [equipmentAllocationForm, setEquipmentAllocationForm] = useState({
    productId: "",
    equipmentId: "",
    allocationRatio: 1,
    annualQuantity: 1000,
  })

  const [logisticsForm, setLogisticsForm] = useState({
    productId: "",
    shippingMethod: "宅配便",
    costPerUnit: 0,
    currency: "JPY",
  })

  const [electricityForm, setElectricityForm] = useState({
    productId: "",
    costPerUnit: 0,
    currency: "JPY",
  })

  const productSummaries = useMemo(() => {
    return data.products.map((product) => ({
      product,
      costs: calculateProductUnitCosts(product.id, data),
    }))
  }, [data])

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-10 text-muted-foreground">
        ローカルストレージからデータを読み込み中です...
      </main>
    )
  }

  const largeOptions = data.categories.large
  const mediumOptions = data.categories.medium.filter((m) => !productForm.categoryLargeId || m.largeId === productForm.categoryLargeId)
  const smallOptions = data.categories.small.filter((s) => !productForm.categoryMediumId || s.mediumId === productForm.categoryMediumId)

  const productOptionsAvailable = data.products.length > 0

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

      <Tabs defaultValue="master">
        <TabsList>
          <TabsTrigger value="master">マスタ登録</TabsTrigger>
          <TabsTrigger value="product">商品登録</TabsTrigger>
          <TabsTrigger value="cost">原価入力・サマリ</TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>カテゴリマスタ</CardTitle>
                <CardDescription>大・中・小カテゴリを事前登録して商品登録で選択できるようにします。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!largeCategory.name.trim()) return
                    actions.addLargeCategory({ ...largeCategory })
                    setLargeCategory({ name: "", description: "" })
                  }}
                >
                  <Label className="text-sm font-semibold">大カテゴリ</Label>
                  <Input
                    placeholder="例: アパレル"
                    value={largeCategory.name}
                    onChange={(event) => setLargeCategory((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <Textarea
                    placeholder="概要 (任意)"
                    value={largeCategory.description}
                    onChange={(event) => setLargeCategory((prev) => ({ ...prev, description: event.target.value }))}
                  />
                  <Button type="submit" size="sm">
                    追加
                  </Button>
                </form>

                <form
                  className="space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!mediumCategory.name.trim() || !mediumCategory.largeId) return
                    actions.addMediumCategory({ ...mediumCategory })
                    setMediumCategory({ name: "", description: "", largeId: "" })
                  }}
                >
                  <Label className="text-sm font-semibold">中カテゴリ</Label>
                  <Select value={mediumCategory.largeId} onValueChange={(value) => setMediumCategory((prev) => ({ ...prev, largeId: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="親カテゴリ" />
                    </SelectTrigger>
                    <SelectContent>
                      {largeOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="例: バッグ"
                    value={mediumCategory.name}
                    onChange={(event) => setMediumCategory((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <Textarea
                    placeholder="概要 (任意)"
                    value={mediumCategory.description}
                    onChange={(event) => setMediumCategory((prev) => ({ ...prev, description: event.target.value }))}
                  />
                  <Button type="submit" size="sm" disabled={!largeOptions.length}>
                    追加
                  </Button>
                  {!largeOptions.length && <p className="text-xs text-muted-foreground">先に大カテゴリを登録してください。</p>}
                </form>

                <form
                  className="space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!smallCategory.name.trim() || !smallCategory.mediumId) return
                    actions.addSmallCategory({ ...smallCategory })
                    setSmallCategory({ name: "", description: "", mediumId: "" })
                  }}
                >
                  <Label className="text-sm font-semibold">小カテゴリ</Label>
                  <Select value={smallCategory.mediumId} onValueChange={(value) => setSmallCategory((prev) => ({ ...prev, mediumId: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="親 (中カテゴリ)" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.categories.medium.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="例: ミニトート"
                    value={smallCategory.name}
                    onChange={(event) => setSmallCategory((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <Textarea
                    placeholder="概要 (任意)"
                    value={smallCategory.description}
                    onChange={(event) => setSmallCategory((prev) => ({ ...prev, description: event.target.value }))}
                  />
                  <Button type="submit" size="sm" disabled={!data.categories.medium.length}>
                    追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 大カテゴリ"
                  items={data.categories.large.map((category) => `${category.name}${category.description ? ` / ${category.description}` : ""}`)}
                />
                <RegisteredList
                  title="登録済み 中カテゴリ"
                  items={data.categories.medium.map((category) => {
                    const parent = data.categories.large.find((c) => c.id === category.largeId)?.name ?? "-"
                    return `${parent} › ${category.name}`
                  })}
                />
                <RegisteredList
                  title="登録済み 小カテゴリ"
                  items={data.categories.small.map((category) => {
                    const parent = data.categories.medium.find((c) => c.id === category.mediumId)?.name ?? "-"
                    return `${parent} › ${category.name}`
                  })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>材料マスタ</CardTitle>
                <CardDescription>名称・単位・サイズ・通貨を登録し、材料コスト入力時の選択肢にします。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                  className="grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!materialForm.name.trim()) return
                    actions.addMaterial({ ...materialForm })
                    setMaterialForm({ name: "", unit: "kg", sizeDescription: "", currency: "JPY", note: "" })
                  }}
                >
                  <Input
                    placeholder="材料名"
                    value={materialForm.name}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="単位"
                      value={materialForm.unit}
                      onChange={(event) => setMaterialForm((prev) => ({ ...prev, unit: event.target.value }))}
                    />
                    <Select value={materialForm.currency} onValueChange={(value) => setMaterialForm((prev) => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="通貨" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="サイズ・容量"
                    value={materialForm.sizeDescription}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, sizeDescription: event.target.value }))}
                  />
                  <Textarea
                    placeholder="備考"
                    value={materialForm.note}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, note: event.target.value }))}
                  />
                  <Button type="submit" size="sm">
                    追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 材料"
                  items={data.materials.map((material) => `${material.name} / ${material.unit} / ${material.sizeDescription}`)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>梱包材マスタ</CardTitle>
                <CardDescription>段ボール / プラケース / フィルムなど登録しておきます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                  className="grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!packagingForm.name.trim()) return
                    actions.addPackagingItem({ ...packagingForm })
                    setPackagingForm({ name: "", unit: "set", sizeDescription: "", currency: "JPY", note: "" })
                  }}
                >
                  <Input
                    placeholder="梱包材名"
                    value={packagingForm.name}
                    onChange={(event) => setPackagingForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="単位"
                      value={packagingForm.unit}
                      onChange={(event) => setPackagingForm((prev) => ({ ...prev, unit: event.target.value }))}
                    />
                    <Select value={packagingForm.currency} onValueChange={(value) => setPackagingForm((prev) => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="通貨" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="サイズ/仕様"
                    value={packagingForm.sizeDescription}
                    onChange={(event) => setPackagingForm((prev) => ({ ...prev, sizeDescription: event.target.value }))}
                  />
                  <Textarea
                    placeholder="備考"
                    value={packagingForm.note}
                    onChange={(event) => setPackagingForm((prev) => ({ ...prev, note: event.target.value }))}
                  />
                  <Button type="submit" size="sm">
                    追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 梱包材"
                  items={data.packagingItems.map((item) => `${item.name} / ${item.unit} / ${item.sizeDescription}`)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>人件費 / 設備マスタ</CardTitle>
                <CardDescription>工数・時給・設備投資のベースを登録します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!laborForm.name.trim()) return
                    actions.addLaborRole({ ...laborForm, hourlyRate: Number(laborForm.hourlyRate) })
                    setLaborForm({ name: "", hourlyRate: 1800, currency: "JPY", note: "" })
                  }}
                >
                  <Label className="text-sm font-semibold">人件費</Label>
                  <Input
                    placeholder="作業カテゴリ"
                    value={laborForm.name}
                    onChange={(event) => setLaborForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="時給"
                      value={laborForm.hourlyRate}
                      onChange={(event) => setLaborForm((prev) => ({ ...prev, hourlyRate: Number(event.target.value) }))}
                    />
                    <Select value={laborForm.currency} onValueChange={(value) => setLaborForm((prev) => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="通貨" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="備考"
                    value={laborForm.note}
                    onChange={(event) => setLaborForm((prev) => ({ ...prev, note: event.target.value }))}
                  />
                  <Button type="submit" size="sm">
                    人件費を追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 人件費"
                  items={data.laborRoles.map((role) => `${role.name} / ${formatCurrency(role.hourlyRate, role.currency)} / ${role.note || "備考なし"}`)}
                />

                <form
                  className="grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!equipmentForm.name.trim()) return
                    actions.addEquipment({
                      ...equipmentForm,
                      acquisitionCost: Number(equipmentForm.acquisitionCost),
                      amortizationYears: Number(equipmentForm.amortizationYears) || 1,
                    })
                    setEquipmentForm({ name: "", acquisitionCost: 0, currency: "JPY", amortizationYears: 5, note: "" })
                  }}
                >
                  <Label className="text-sm font-semibold">設備投資</Label>
                  <Input
                    placeholder="設備名"
                    value={equipmentForm.name}
                    onChange={(event) => setEquipmentForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="取得額"
                      value={equipmentForm.acquisitionCost}
                      onChange={(event) => setEquipmentForm((prev) => ({ ...prev, acquisitionCost: Number(event.target.value) }))}
                    />
                    <Input
                      type="number"
                      placeholder="償却年数"
                      value={equipmentForm.amortizationYears}
                      onChange={(event) => setEquipmentForm((prev) => ({ ...prev, amortizationYears: Number(event.target.value) }))}
                    />
                  </div>
                  <Select value={equipmentForm.currency} onValueChange={(value) => setEquipmentForm((prev) => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="通貨" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="備考"
                    value={equipmentForm.note}
                    onChange={(event) => setEquipmentForm((prev) => ({ ...prev, note: event.target.value }))}
                  />
                  <Button type="submit" size="sm">
                    設備を追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 設備"
                  items={data.equipments.map((equipment) => `${equipment.name} / ${formatCurrency(equipment.acquisitionCost, equipment.currency)} / ${equipment.amortizationYears}年`)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>商品登録フォーム</CardTitle>
              <CardDescription>カテゴリ・想定生産量・制作工数・オプションなどを設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!productForm.name.trim()) return
                  actions.addProduct({
                    ...productForm,
                    baseManHours: Number(productForm.baseManHours) || 0,
                    defaultElectricityCost: Number(productForm.defaultElectricityCost) || 0,
                    expectedProduction: {
                      periodYears: Number(productForm.expectedProduction.periodYears) || 1,
                      quantity: Number(productForm.expectedProduction.quantity) || 1,
                    },
                  })
                  setProductForm({
                    name: "",
                    categoryLargeId: "",
                    categoryMediumId: "",
                    categorySmallId: "",
                    sizes: [],
                    baseManHours: 0,
                    defaultElectricityCost: 0,
                    registeredAt: new Date().toISOString().slice(0, 10),
                    options: [],
                    expectedProduction: { periodYears: 1, quantity: 1000 },
                    equipmentIds: [],
                  })
                }}
              >
                <Input
                  placeholder="商品名"
                  value={productForm.name}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <div className="grid gap-2 md:grid-cols-3">
                  <Select
                    value={productForm.categoryLargeId}
                    onValueChange={(value) =>
                      setProductForm((prev) => ({ ...prev, categoryLargeId: value, categoryMediumId: "", categorySmallId: "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="大カテゴリ" />
                    </SelectTrigger>
                    <SelectContent>
                      {largeOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={productForm.categoryMediumId}
                    onValueChange={(value) =>
                      setProductForm((prev) => ({ ...prev, categoryMediumId: value, categorySmallId: "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="中カテゴリ" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediumOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={productForm.categorySmallId}
                    onValueChange={(value) => setProductForm((prev) => ({ ...prev, categorySmallId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="小カテゴリ" />
                    </SelectTrigger>
                    <SelectContent>
                      {smallOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="サイズ展開 (カンマ区切り)"
                  value={productForm.sizes.join(", ")}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, sizes: event.target.value.split(",").map((size) => size.trim()).filter(Boolean) }))
                  }
                />
                <Textarea
                  placeholder="オプションの種類 (例: 金具変更, 刺繍追加)"
                  value={productForm.options.join(", ")}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, options: event.target.value.split(",").map((option) => option.trim()).filter(Boolean) }))
                  }
                />
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">制作工数 (時間)</Label>
                    <Input
                      type="number"
                      placeholder="例: 1.5"
                      value={productForm.baseManHours}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, baseManHours: Number(event.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">電気代 (1個あたり)</Label>
                    <Input
                      type="number"
                      placeholder="例: 25"
                      value={productForm.defaultElectricityCost}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, defaultElectricityCost: Number(event.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">登録日</Label>
                    <Input
                      type="date"
                      value={productForm.registeredAt}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, registeredAt: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">想定生産期間 (年)</Label>
                    <Input
                      type="number"
                      placeholder="例: 1"
                      value={productForm.expectedProduction.periodYears}
                      onChange={(event) =>
                        setProductForm((prev) => ({
                          ...prev,
                          expectedProduction: {
                            ...prev.expectedProduction,
                            periodYears: Number(event.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">期間内生産予定数</Label>
                    <Input
                      type="number"
                      placeholder="例: 1000"
                      value={productForm.expectedProduction.quantity}
                      onChange={(event) =>
                        setProductForm((prev) => ({
                          ...prev,
                          expectedProduction: {
                            ...prev.expectedProduction,
                            quantity: Number(event.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>使用する設備 (複数選択)</Label>
                  <div className="flex flex-wrap gap-2">
                    {data.equipments.map((equipment) => (
                      <label key={equipment.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={productForm.equipmentIds.includes(equipment.id)}
                          onChange={(event) => {
                            const next = event.target.checked
                              ? [...productForm.equipmentIds, equipment.id]
                              : productForm.equipmentIds.filter((id) => id !== equipment.id)
                            setProductForm((prev) => ({ ...prev, equipmentIds: next }))
                          }}
                        />
                        {equipment.name}
                      </label>
                    ))}
                    {!data.equipments.length && <p className="text-xs text-muted-foreground">設備マスタを登録すると選択できます。</p>}
                  </div>
                </div>
                <Button type="submit" className="w-fit">
                  商品を登録
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>登録済み商品</CardTitle>
              <CardDescription>想定生産量・設備利用状況の一覧。</CardDescription>
            </CardHeader>
            <CardContent>
              {data.products.length === 0 ? (
                <p className="text-sm text-muted-foreground">まだ商品がありません。</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名</TableHead>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead>生産計画</TableHead>
                      <TableHead>設備</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {[product.categoryLargeId, product.categoryMediumId, product.categorySmallId]
                            .map((categoryId) =>
                              data.categories.large.find((c) => c.id === categoryId) ||
                              data.categories.medium.find((c) => c.id === categoryId) ||
                              data.categories.small.find((c) => c.id === categoryId)
                            )
                            .filter(Boolean)
                            .map((category) => (category as { id: string; name: string }).name)
                            .join(" / ") || "-"}
                        </TableCell>
                        <TableCell>
                          {product.expectedProduction.quantity} 個 / {product.expectedProduction.periodYears} 年
                        </TableCell>
                        <TableCell>
                          {product.equipmentIds.length === 0
                            ? "-"
                            : product.equipmentIds
                                .map((id) => data.equipments.find((equipment) => equipment.id === id)?.name ?? "")
                                .filter(Boolean)
                                .join(", ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CostCard
              title="材料費入力"
              description="商品×材料ごとの単価を任意で登録します。"
              disabled={!productOptionsAvailable || data.materials.length === 0}
            >
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!materialCostForm.productId || !materialCostForm.materialId) return
                  actions.addMaterialCostEntry({
                    ...materialCostForm,
                    costPerUnit: Number(materialCostForm.costPerUnit) || 0,
                  })
                  setMaterialCostForm({ productId: "", materialId: "", description: "", costPerUnit: 0, currency: "JPY" })
                }}
              >
                <ProductSelect value={materialCostForm.productId} onChange={(value) => setMaterialCostForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Select value={materialCostForm.materialId} onValueChange={(value) => setMaterialCostForm((prev) => ({ ...prev, materialId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="材料" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="コスト (1個あたり)"
                  value={materialCostForm.costPerUnit}
                  onChange={(event) => setMaterialCostForm((prev) => ({ ...prev, costPerUnit: Number(event.target.value) }))}
                />
                <Textarea
                  placeholder="使用メモ"
                  value={materialCostForm.description}
                  onChange={(event) => setMaterialCostForm((prev) => ({ ...prev, description: event.target.value }))}
                />
                <Button type="submit" size="sm" disabled={!productOptionsAvailable || !data.materials.length}>
                  登録
                </Button>
              </form>
            </CostCard>

            <CostCard title="梱包材費" description="登録済み梱包材と使用数量でコストを積み上げます。" disabled={!productOptionsAvailable || !data.packagingItems.length}>
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!packagingCostForm.productId || !packagingCostForm.packagingItemId) return
                  actions.addPackagingCostEntry({
                    ...packagingCostForm,
                    quantity: Number(packagingCostForm.quantity) || 0,
                    costPerUnit: Number(packagingCostForm.costPerUnit) || 0,
                  })
                  setPackagingCostForm({ productId: "", packagingItemId: "", quantity: 1, costPerUnit: 0, currency: "JPY" })
                }}
              >
                <ProductSelect value={packagingCostForm.productId} onChange={(value) => setPackagingCostForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Select value={packagingCostForm.packagingItemId} onValueChange={(value) => setPackagingCostForm((prev) => ({ ...prev, packagingItemId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="梱包材" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.packagingItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="使用数量"
                    value={packagingCostForm.quantity}
                    onChange={(event) => setPackagingCostForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="単価"
                    value={packagingCostForm.costPerUnit}
                    onChange={(event) => setPackagingCostForm((prev) => ({ ...prev, costPerUnit: Number(event.target.value) }))}
                  />
                </div>
                <Button type="submit" size="sm" disabled={!productOptionsAvailable || !data.packagingItems.length}>
                  登録
                </Button>
              </form>
            </CostCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CostCard title="人件費" description="工数と人数から算出します。" disabled={!productOptionsAvailable || !data.laborRoles.length}>
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!laborCostForm.productId || !laborCostForm.laborRoleId) return
                  actions.addLaborCostEntry({
                    ...laborCostForm,
                    hours: Number(laborCostForm.hours) || 0,
                    peopleCount: Number(laborCostForm.peopleCount) || 0,
                    hourlyRateOverride: laborCostForm.hourlyRateOverride
                      ? Number(laborCostForm.hourlyRateOverride)
                      : undefined,
                  })
                  setLaborCostForm({ productId: "", laborRoleId: "", hours: 1, peopleCount: 1, hourlyRateOverride: "" })
                }}
              >
                <ProductSelect value={laborCostForm.productId} onChange={(value) => setLaborCostForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Select value={laborCostForm.laborRoleId} onValueChange={(value) => setLaborCostForm((prev) => ({ ...prev, laborRoleId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="作業カテゴリ" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.laborRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({formatCurrency(role.hourlyRate, role.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    placeholder="工数"
                    value={laborCostForm.hours}
                    onChange={(event) => setLaborCostForm((prev) => ({ ...prev, hours: Number(event.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="人数"
                    value={laborCostForm.peopleCount}
                    onChange={(event) => setLaborCostForm((prev) => ({ ...prev, peopleCount: Number(event.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="時給(任意)"
                    value={laborCostForm.hourlyRateOverride}
                    onChange={(event) => setLaborCostForm((prev) => ({ ...prev, hourlyRateOverride: event.target.value }))}
                  />
                </div>
                <Button type="submit" size="sm" disabled={!productOptionsAvailable || !data.laborRoles.length}>
                  登録
                </Button>
              </form>
            </CostCard>

            <CostCard title="外注費" description="1個あたりの外注費用を入力"> 
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!outsourcingForm.productId) return
                  actions.addOutsourcingCostEntry({
                    ...outsourcingForm,
                    costPerUnit: Number(outsourcingForm.costPerUnit) || 0,
                  })
                  setOutsourcingForm({ productId: "", costPerUnit: 0, currency: "JPY", note: "" })
                }}
              >
                <ProductSelect value={outsourcingForm.productId} onChange={(value) => setOutsourcingForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Input
                  type="number"
                  placeholder="コスト"
                  value={outsourcingForm.costPerUnit}
                  onChange={(event) => setOutsourcingForm((prev) => ({ ...prev, costPerUnit: Number(event.target.value) }))}
                />
                <Select value={outsourcingForm.currency} onValueChange={(value) => setOutsourcingForm((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="通貨" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="支払い条件など"
                  value={outsourcingForm.note}
                  onChange={(event) => setOutsourcingForm((prev) => ({ ...prev, note: event.target.value }))}
                />
                <Button type="submit" size="sm" disabled={!productOptionsAvailable}>
                  登録
                </Button>
              </form>
            </CostCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CostCard title="開発コスト" description="試作費用を期間と生産数で割り戻します" disabled={!productOptionsAvailable}>
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!developmentForm.productId) return
                  actions.addDevelopmentCostEntry({
                    ...developmentForm,
                    prototypeLaborCost: Number(developmentForm.prototypeLaborCost) || 0,
                    prototypeMaterialCost: Number(developmentForm.prototypeMaterialCost) || 0,
                    toolingCost: Number(developmentForm.toolingCost) || 0,
                    amortizationYears: Number(developmentForm.amortizationYears) || 1,
                  })
                  setDevelopmentForm({ productId: "", prototypeLaborCost: 0, prototypeMaterialCost: 0, toolingCost: 0, amortizationYears: 3 })
                }}
              >
                <ProductSelect value={developmentForm.productId} onChange={(value) => setDevelopmentForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Input
                  type="number"
                  placeholder="試作工数コスト"
                  value={developmentForm.prototypeLaborCost}
                  onChange={(event) => setDevelopmentForm((prev) => ({ ...prev, prototypeLaborCost: Number(event.target.value) }))}
                />
                <Input
                  type="number"
                  placeholder="試作用材料費"
                  value={developmentForm.prototypeMaterialCost}
                  onChange={(event) => setDevelopmentForm((prev) => ({ ...prev, prototypeMaterialCost: Number(event.target.value) }))}
                />
                <Input
                  type="number"
                  placeholder="道具費"
                  value={developmentForm.toolingCost}
                  onChange={(event) => setDevelopmentForm((prev) => ({ ...prev, toolingCost: Number(event.target.value) }))}
                />
                <Input
                  type="number"
                  placeholder="償却年数"
                  value={developmentForm.amortizationYears}
                  onChange={(event) => setDevelopmentForm((prev) => ({ ...prev, amortizationYears: Number(event.target.value) }))}
                />
                <Button type="submit" size="sm" disabled={!productOptionsAvailable}>
                  登録
                </Button>
              </form>
            </CostCard>

            <CostCard title="設備配賦" description="設備マスタを年間数量で配賦" disabled={!productOptionsAvailable || !data.equipments.length}>
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!equipmentAllocationForm.productId || !equipmentAllocationForm.equipmentId) return
                  actions.addEquipmentAllocation({
                    ...equipmentAllocationForm,
                    allocationRatio: Number(equipmentAllocationForm.allocationRatio) || 0,
                    annualQuantity: Number(equipmentAllocationForm.annualQuantity) || 1,
                  })
                  setEquipmentAllocationForm({ productId: "", equipmentId: "", allocationRatio: 1, annualQuantity: 1000 })
                }}
              >
                <ProductSelect value={equipmentAllocationForm.productId} onChange={(value) => setEquipmentAllocationForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Select value={equipmentAllocationForm.equipmentId} onValueChange={(value) => setEquipmentAllocationForm((prev) => ({ ...prev, equipmentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="設備" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.equipments.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        {equipment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="利用割合"
                    value={equipmentAllocationForm.allocationRatio}
                    onChange={(event) => setEquipmentAllocationForm((prev) => ({ ...prev, allocationRatio: Number(event.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="年間数量"
                    value={equipmentAllocationForm.annualQuantity}
                    onChange={(event) => setEquipmentAllocationForm((prev) => ({ ...prev, annualQuantity: Number(event.target.value) }))}
                  />
                </div>
                <Button type="submit" size="sm" disabled={!productOptionsAvailable || !data.equipments.length}>
                  登録
                </Button>
              </form>
            </CostCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CostCard title="物流・配送費" description="配送方法と単価を入力" disabled={!productOptionsAvailable}>
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!logisticsForm.productId) return
                  actions.addLogisticsCostEntry({
                    ...logisticsForm,
                    costPerUnit: Number(logisticsForm.costPerUnit) || 0,
                  })
                  setLogisticsForm({ productId: "", shippingMethod: "宅配便", costPerUnit: 0, currency: "JPY" })
                }}
              >
                <ProductSelect value={logisticsForm.productId} onChange={(value) => setLogisticsForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Input
                  placeholder="配送方法"
                  value={logisticsForm.shippingMethod}
                  onChange={(event) => setLogisticsForm((prev) => ({ ...prev, shippingMethod: event.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="単価"
                  value={logisticsForm.costPerUnit}
                  onChange={(event) => setLogisticsForm((prev) => ({ ...prev, costPerUnit: Number(event.target.value) }))}
                />
                <Select value={logisticsForm.currency} onValueChange={(value) => setLogisticsForm((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="通貨" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" disabled={!productOptionsAvailable}>
                  登録
                </Button>
              </form>
            </CostCard>

            <CostCard title="電気代" description="商品登録時の値と合わせて入力" disabled={!productOptionsAvailable}>
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!electricityForm.productId) return
                  actions.addElectricityCostEntry({
                    ...electricityForm,
                    costPerUnit: Number(electricityForm.costPerUnit) || 0,
                  })
                  setElectricityForm({ productId: "", costPerUnit: 0, currency: "JPY" })
                }}
              >
                <ProductSelect value={electricityForm.productId} onChange={(value) => setElectricityForm((prev) => ({ ...prev, productId: value }))} products={data.products} />
                <Input
                  type="number"
                  placeholder="単価"
                  value={electricityForm.costPerUnit}
                  onChange={(event) => setElectricityForm((prev) => ({ ...prev, costPerUnit: Number(event.target.value) }))}
                />
                <Select value={electricityForm.currency} onValueChange={(value) => setElectricityForm((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="通貨" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" disabled={!productOptionsAvailable}>
                  登録
                </Button>
              </form>
            </CostCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>原価サマリ</CardTitle>
              <CardDescription>カテゴリ別の積み上げと合計を確認できます。</CardDescription>
            </CardHeader>
            <CardContent>
              {productSummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">まだ原価計算対象の商品がありません。</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品</TableHead>
                      <TableHead>材料</TableHead>
                      <TableHead>梱包</TableHead>
                      <TableHead>人件費</TableHead>
                      <TableHead>外注</TableHead>
                      <TableHead>開発</TableHead>
                      <TableHead>設備</TableHead>
                      <TableHead>物流</TableHead>
                      <TableHead>電気</TableHead>
                      <TableHead>合計</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productSummaries.map(({ product, costs }) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatCurrency(costs.material)}</TableCell>
                        <TableCell>{formatCurrency(costs.packaging)}</TableCell>
                        <TableCell>{formatCurrency(costs.labor)}</TableCell>
                        <TableCell>{formatCurrency(costs.outsourcing)}</TableCell>
                        <TableCell>{formatCurrency(costs.development)}</TableCell>
                        <TableCell>{formatCurrency(costs.equipment)}</TableCell>
                        <TableCell>{formatCurrency(costs.logistics)}</TableCell>
                        <TableCell>{formatCurrency(costs.electricity)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(costs.total)}</TableCell>
                      </TableRow>
                    ))}
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

function CostCard({
  title,
  description,
  disabled,
  children,
}: {
  title: string
  description: string
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <Card className={disabled ? "opacity-70" : undefined}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{disabled ? <p className="text-sm text-muted-foreground">前提となるマスタや商品を登録してください。</p> : children}</CardContent>
    </Card>
  )
}

function ProductSelect({
  value,
  onChange,
  products,
}: {
  value: string
  onChange: (value: string) => void
  products: Product[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="商品" />
      </SelectTrigger>
      <SelectContent>
        {products.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function RegisteredList({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">まだ登録がありません。</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
