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

const createTempId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11)

type MaterialCostDraft = {
  id: string
  materialId: string
  usageRatio: number
  costPerUnit: number
  currency: string
  description: string
}

type PackagingCostDraft = {
  id: string
  packagingItemId: string
  quantity: number
  costPerUnit: number
  currency: string
}

type LaborCostDraft = {
  id: string
  laborRoleId: string
  hours: number
  peopleCount: number
  hourlyRateOverride?: number
}

type OutsourcingCostDraft = {
  id: string
  note: string
  costPerUnit: number
  currency: string
}

type DevelopmentCostDraft = {
  id: string
  prototypeLaborCost: number
  prototypeMaterialCost: number
  toolingCost: number
  amortizationYears: number
}

type EquipmentAllocationDraft = {
  id: string
  equipmentId: string
  allocationRatio: number
  annualQuantity: number
}

type LogisticsCostDraft = {
  id: string
  shippingMethod: string
  costPerUnit: number
  currency: string
}

type ElectricityCostDraft = {
  id: string
  costPerUnit: number
  currency: string
}

export default function Home() {
  const { data, hydrated, actions } = useAppData()

  const createMaterialDraft = (): MaterialCostDraft => ({
    id: createTempId(),
    materialId: data.materials[0]?.id ?? "",
    usageRatio: 100,
    costPerUnit: 0,
    currency: data.materials[0]?.currency ?? "JPY",
    description: "",
  })

  const createPackagingDraft = (): PackagingCostDraft => ({
    id: createTempId(),
    packagingItemId: data.packagingItems[0]?.id ?? "",
    quantity: 1,
    costPerUnit: 0,
    currency: data.packagingItems[0]?.currency ?? "JPY",
  })

  const createLaborDraft = (): LaborCostDraft => ({
    id: createTempId(),
    laborRoleId: data.laborRoles[0]?.id ?? "",
    hours: 1,
    peopleCount: 1,
  })

  const createOutsourcingDraft = (): OutsourcingCostDraft => ({
    id: createTempId(),
    note: "",
    costPerUnit: 0,
    currency: "JPY",
  })

  const createDevelopmentDraft = (): DevelopmentCostDraft => ({
    id: createTempId(),
    prototypeLaborCost: 0,
    prototypeMaterialCost: 0,
    toolingCost: 0,
    amortizationYears: 3,
  })

  const createLogisticsDraft = (): LogisticsCostDraft => ({
    id: createTempId(),
    shippingMethod: "",
    costPerUnit: 0,
    currency: "JPY",
  })

  const createElectricityDraft = (): ElectricityCostDraft => ({
    id: createTempId(),
    costPerUnit: 0,
    currency: "JPY",
  })

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

  const [materialDrafts, setMaterialDrafts] = useState<MaterialCostDraft[]>(() => [createMaterialDraft()])

  const [packagingDrafts, setPackagingDrafts] = useState<PackagingCostDraft[]>(() => [createPackagingDraft()])

  const [laborDrafts, setLaborDrafts] = useState<LaborCostDraft[]>(() => [createLaborDraft()])

  const [outsourcingDrafts, setOutsourcingDrafts] = useState<OutsourcingCostDraft[]>(() => [createOutsourcingDraft()])

  const [developmentDrafts, setDevelopmentDrafts] = useState<DevelopmentCostDraft[]>(() => [createDevelopmentDraft()])

  const [equipmentAllocDrafts, setEquipmentAllocDrafts] = useState<EquipmentAllocationDraft[]>([])

  const [logisticsDrafts, setLogisticsDrafts] = useState<LogisticsCostDraft[]>(() => [createLogisticsDraft()])

  const [electricityDrafts, setElectricityDrafts] = useState<ElectricityCostDraft[]>(() => [createElectricityDraft()])

  const addDraft = <T extends { id: string }>(setState: React.Dispatch<React.SetStateAction<T[]>>, draft: T) => {
    setState((prev) => [...prev, draft])
  }

  const updateDraft = <T extends { id: string }>(setState: React.Dispatch<React.SetStateAction<T[]>>, id: string, patch: Partial<T>) => {
    setState((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeDraft = <T extends { id: string }>(setState: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    setState((prev) => prev.filter((item) => item.id !== id))
  }

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

  const handleToggleEquipment = (equipmentId: string, checked: boolean) => {
    setProductForm((prev) => {
      const nextIds = checked
        ? [...prev.equipmentIds, equipmentId]
        : prev.equipmentIds.filter((id) => id !== equipmentId)
      const uniqueIds = checked ? Array.from(new Set(nextIds)) : nextIds
      return { ...prev, equipmentIds: uniqueIds }
    })

    setEquipmentAllocDrafts((prev) => {
      if (checked) {
        if (prev.some((draft) => draft.equipmentId === equipmentId)) {
          return prev
        }
        return [
          ...prev,
          {
            id: createTempId(),
            equipmentId,
            allocationRatio: 0.5,
            annualQuantity: productForm.expectedProduction.quantity || 1,
          },
        ]
      }
      return prev.filter((draft) => draft.equipmentId !== equipmentId)
    })
  }


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
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!productForm.name.trim()) return
                  const newProductId = createTempId()
                  const electricityUnitCost =
                    electricityDrafts.find((draft) => Number(draft.costPerUnit) > 0)?.costPerUnit ?? 0
                  const normalizedProduct = {
                    ...productForm,
                    baseManHours: Number(productForm.baseManHours) || 0,
                    expectedProduction: {
                      periodYears: Number(productForm.expectedProduction.periodYears) || 1,
                      quantity: Number(productForm.expectedProduction.quantity) || 1,
                    },
                    defaultElectricityCost: Number(electricityUnitCost) || 0,
                  }
                  actions.addProduct({ id: newProductId, ...normalizedProduct })

                  materialDrafts
                    .filter((draft) => draft.materialId)
                    .forEach((draft) =>
                      actions.addMaterialCostEntry({
                        productId: newProductId,
                        materialId: draft.materialId,
                        description: draft.description,
                        usageRatio: Number(draft.usageRatio) || 0,
                        costPerUnit: Number(draft.costPerUnit) || 0,
                        currency: draft.currency,
                      })
                    )

                  packagingDrafts
                    .filter((draft) => draft.packagingItemId)
                    .forEach((draft) =>
                      actions.addPackagingCostEntry({
                        productId: newProductId,
                        packagingItemId: draft.packagingItemId,
                        quantity: Number(draft.quantity) || 0,
                        costPerUnit: Number(draft.costPerUnit) || 0,
                        currency: draft.currency,
                      })
                    )

                  laborDrafts
                    .filter((draft) => draft.laborRoleId)
                    .forEach((draft) =>
                      actions.addLaborCostEntry({
                        productId: newProductId,
                        laborRoleId: draft.laborRoleId,
                        hours: Number(draft.hours) || 0,
                        peopleCount: Number(draft.peopleCount) || 0,
                        hourlyRateOverride: draft.hourlyRateOverride,
                      })
                    )

                  outsourcingDrafts
                    .filter((draft) => draft.note.trim() || Number(draft.costPerUnit) > 0)
                    .forEach((draft) =>
                      actions.addOutsourcingCostEntry({
                        productId: newProductId,
                        costPerUnit: Number(draft.costPerUnit) || 0,
                        currency: draft.currency,
                        note: draft.note,
                      })
                    )

                  developmentDrafts
                    .filter(
                      (draft) =>
                        Number(draft.prototypeLaborCost) > 0 ||
                        Number(draft.prototypeMaterialCost) > 0 ||
                        Number(draft.toolingCost) > 0
                    )
                    .forEach((draft) =>
                      actions.addDevelopmentCostEntry({
                        productId: newProductId,
                        prototypeLaborCost: Number(draft.prototypeLaborCost) || 0,
                        prototypeMaterialCost: Number(draft.prototypeMaterialCost) || 0,
                        toolingCost: Number(draft.toolingCost) || 0,
                        amortizationYears: Number(draft.amortizationYears) || 1,
                      })
                    )

                  equipmentAllocDrafts
                    .filter((draft) => draft.equipmentId)
                    .forEach((draft) =>
                      actions.addEquipmentAllocation({
                        productId: newProductId,
                        equipmentId: draft.equipmentId,
                        allocationRatio: Number(draft.allocationRatio) || 0,
                        annualQuantity: Number(draft.annualQuantity) || normalizedProduct.expectedProduction.quantity,
                      })
                    )

                  logisticsDrafts
                    .filter((draft) => draft.shippingMethod.trim() || Number(draft.costPerUnit) > 0)
                    .forEach((draft) =>
                      actions.addLogisticsCostEntry({
                        productId: newProductId,
                        shippingMethod: draft.shippingMethod,
                        costPerUnit: Number(draft.costPerUnit) || 0,
                        currency: draft.currency,
                      })
                    )

                  electricityDrafts
                    .filter((draft) => Number(draft.costPerUnit) > 0)
                    .forEach((draft) =>
                      actions.addElectricityCostEntry({
                        productId: newProductId,
                        costPerUnit: Number(draft.costPerUnit) || 0,
                        currency: draft.currency,
                      })
                    )

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
                  setMaterialDrafts([createMaterialDraft()])
                  setPackagingDrafts([createPackagingDraft()])
                  setLaborDrafts([createLaborDraft()])
                  setOutsourcingDrafts([createOutsourcingDraft()])
                  setDevelopmentDrafts([createDevelopmentDraft()])
                  setEquipmentAllocDrafts([])
                  setLogisticsDrafts([createLogisticsDraft()])
                  setElectricityDrafts([createElectricityDraft()])
                }}
              >
                <div className="grid gap-4">
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
                      setProductForm((prev) => ({
                        ...prev,
                        sizes: event.target.value
                          .split(",")
                          .map((size) => size.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                  <Textarea
                    placeholder="オプションの種類 (例: 金具変更, 刺繍追加)"
                    value={productForm.options.join(", ")}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        options: event.target.value
                          .split(",")
                          .map((option) => option.trim())
                          .filter(Boolean),
                      }))
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
                      <Label className="text-xs text-muted-foreground">登録日</Label>
                      <Input
                        type="date"
                        value={productForm.registeredAt}
                        onChange={(event) => setProductForm((prev) => ({ ...prev, registeredAt: event.target.value }))}
                      />
                    </div>
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
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
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
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">使用する設備 (複数選択)</Label>
                      <div className="flex flex-wrap gap-2 rounded-md border p-2">
                    {data.equipments.map((equipment) => (
                      <label key={equipment.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={productForm.equipmentIds.includes(equipment.id)}
                          onChange={(event) => handleToggleEquipment(equipment.id, event.target.checked)}
                        />
                        {equipment.name}
                      </label>
                    ))}
                        {!data.equipments.length && (
                          <p className="text-xs text-muted-foreground">設備マスタを登録すると選択できます。</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold">原価入力 (商品登録内)</p>
                    <p className="text-sm text-muted-foreground">
                      材料・梱包・人件費などをここで入力すると、原価確認タブには参照専用で反映されます。
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="材料費"
                      description="材料マスタから選択し、使用率や単価を設定"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setMaterialDrafts, createMaterialDraft())}
                      actionDisabled={data.materials.length === 0}
                    />
                    <HintList
                      items={[
                        "材料マスタ: 事前登録した素材を選択",
                        "使用率(%): 仕入れたロットのうち1個あたりで使う割合",
                        "単価: ロット/単位あたりの購入価格",
                        "用途: 本体用・持ち手用などのメモ",
                      ]}
                    />
                    {data.materials.length === 0 ? (
                      <p className="text-sm text-muted-foreground">材料マスタを登録すると入力できます。</p>
                    ) : materialDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      materialDrafts.map((draft) => (
                        <DraftCard key={draft.id} onRemove={() => removeDraft(setMaterialDrafts, draft.id)}>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">材料</Label>
                              <Select
                                value={draft.materialId}
                                onValueChange={(value) => updateDraft(setMaterialDrafts, draft.id, { materialId: value })}
                              >
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
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">使用率 (%)</Label>
                              <Input
                                type="number"
                                placeholder="例: 75"
                                value={draft.usageRatio}
                                onChange={(event) =>
                                  updateDraft(setMaterialDrafts, draft.id, { usageRatio: Number(event.target.value) })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">単価</Label>
                              <Input
                                type="number"
                                placeholder="例: 320"
                                value={draft.costPerUnit}
                                onChange={(event) =>
                                  updateDraft(setMaterialDrafts, draft.id, { costPerUnit: Number(event.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">通貨</Label>
                              <Select
                                value={draft.currency}
                                onValueChange={(value) => updateDraft(setMaterialDrafts, draft.id, { currency: value })}
                              >
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
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">用途 (任意)</Label>
                              <Input
                                placeholder="例: 本体用"
                                value={draft.description}
                                onChange={(event) =>
                                  updateDraft(setMaterialDrafts, draft.id, { description: event.target.value })
                                }
                              />
                            </div>
                          </div>
                        </DraftCard>
                      ))
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="梱包材費"
                      description="梱包材マスタを選択し、使用数量を設定"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setPackagingDrafts, createPackagingDraft())}
                      actionDisabled={data.packagingItems.length === 0}
                    />
                    <HintList
                      items={[
                        "梱包材マスタ: 箱・袋などの品目",
                        "数量: 1商品あたりに使う点数や長さ",
                        "単価: 1点あたりの調達価格",
                      ]}
                    />
                    {data.packagingItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">梱包材マスタを登録すると入力できます。</p>
                    ) : packagingDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      packagingDrafts.map((draft) => (
                        <DraftCard key={draft.id} onRemove={() => removeDraft(setPackagingDrafts, draft.id)}>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">梱包材</Label>
                              <Select
                                value={draft.packagingItemId}
                                onValueChange={(value) => updateDraft(setPackagingDrafts, draft.id, { packagingItemId: value })}
                              >
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
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">数量</Label>
                              <Input
                                type="number"
                                placeholder="例: 1"
                                value={draft.quantity}
                                onChange={(event) =>
                                  updateDraft(setPackagingDrafts, draft.id, { quantity: Number(event.target.value) })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">単価</Label>
                              <Input
                                type="number"
                                placeholder="例: 80"
                                value={draft.costPerUnit}
                                onChange={(event) =>
                                  updateDraft(setPackagingDrafts, draft.id, { costPerUnit: Number(event.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">通貨</Label>
                              <Select
                                value={draft.currency}
                                onValueChange={(value) => updateDraft(setPackagingDrafts, draft.id, { currency: value })}
                              >
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
                          </div>
                        </DraftCard>
                      ))
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="人件費"
                      description="作業カテゴリごとに工数と人数を設定"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setLaborDrafts, createLaborDraft())}
                      actionDisabled={data.laborRoles.length === 0}
                    />
                    <HintList
                      items={[
                        "作業カテゴリ: 裁断・縫製などの役割",
                        "工数: 1商品あたりにかかる時間 (時間)",
                        "人数: 同時に作業する人数",
                        "時給(任意): マスタの時給を上書きしたい場合に入力",
                      ]}
                    />
                    {data.laborRoles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">人件費マスタを登録すると入力できます。</p>
                    ) : laborDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      laborDrafts.map((draft) => {
                        const selectedRole = data.laborRoles.find((role) => role.id === draft.laborRoleId)
                        return (
                          <DraftCard key={draft.id} onRemove={() => removeDraft(setLaborDrafts, draft.id)}>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">作業カテゴリ</Label>
                              <Select
                                value={draft.laborRoleId}
                                onValueChange={(value) => updateDraft(setLaborDrafts, draft.id, { laborRoleId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="作業カテゴリ" />
                                </SelectTrigger>
                                <SelectContent>
                                  {data.laborRoles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedRole && (
                                <p className="text-xs text-muted-foreground">
                                  標準時給: {formatCurrency(selectedRole.hourlyRate, selectedRole.currency)}
                                </p>
                              )}
                            </div>
                            <div className="grid gap-2 md:grid-cols-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">工数 (時間)</Label>
                                <Input
                                  type="number"
                                  placeholder="例: 0.5"
                                  value={draft.hours}
                                  onChange={(event) => updateDraft(setLaborDrafts, draft.id, { hours: Number(event.target.value) })}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">人数</Label>
                                <Input
                                  type="number"
                                  placeholder="例: 1"
                                  value={draft.peopleCount}
                                  onChange={(event) =>
                                    updateDraft(setLaborDrafts, draft.id, { peopleCount: Number(event.target.value) })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">時給 (任意)</Label>
                                <Input
                                  type="number"
                                  placeholder="例: 2000"
                                  value={draft.hourlyRateOverride ?? ""}
                                  onChange={(event) =>
                                    updateDraft(setLaborDrafts, draft.id, {
                                      hourlyRateOverride:
                                        event.target.value === "" ? undefined : Number(event.target.value),
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </DraftCard>
                        )
                      })
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="外注費"
                      description="商品1つあたりの外注コスト"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setOutsourcingDrafts, createOutsourcingDraft())}
                    />
                    <HintList
                      items={[
                        "外注内容: 作業内容や委託範囲をメモ",
                        "単価: 1商品あたりに支払う費用",
                        "通貨: 支払い通貨 (JPY/USD など)",
                      ]}
                    />
                    {outsourcingDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      outsourcingDrafts.map((draft) => (
                        <DraftCard key={draft.id} onRemove={() => removeDraft(setOutsourcingDrafts, draft.id)}>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">外注内容</Label>
                            <Textarea
                              placeholder="例: 仕上げ縫製を協力工場へ委託"
                              value={draft.note}
                              onChange={(event) => updateDraft(setOutsourcingDrafts, draft.id, { note: event.target.value })}
                            />
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">単価</Label>
                              <Input
                                type="number"
                                placeholder="例: 120"
                                value={draft.costPerUnit}
                                onChange={(event) =>
                                  updateDraft(setOutsourcingDrafts, draft.id, { costPerUnit: Number(event.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">通貨</Label>
                              <Select
                                value={draft.currency}
                                onValueChange={(value) => updateDraft(setOutsourcingDrafts, draft.id, { currency: value })}
                              >
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
                          </div>
                        </DraftCard>
                      ))
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="開発コスト"
                      description="試作工数・材料費・道具費を入力"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setDevelopmentDrafts, createDevelopmentDraft())}
                    />
                    <HintList
                      items={[
                        "試作工数コスト: 試作にかかった人件費トータル",
                        "試作用材料費: 試作で使った素材費",
                        "道具費: 型や治具など一度だけ買うもの",
                        "償却年数: 何年で割って原価化するか",
                      ]}
                    />
                    {developmentDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      developmentDrafts.map((draft) => (
                        <DraftCard key={draft.id} onRemove={() => removeDraft(setDevelopmentDrafts, draft.id)}>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">試作工数コスト</Label>
                              <Input
                                type="number"
                                placeholder="例: 150000"
                                value={draft.prototypeLaborCost}
                                onChange={(event) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { prototypeLaborCost: Number(event.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">試作用材料費</Label>
                              <Input
                                type="number"
                                placeholder="例: 60000"
                                value={draft.prototypeMaterialCost}
                                onChange={(event) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { prototypeMaterialCost: Number(event.target.value) })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">道具費</Label>
                              <Input
                                type="number"
                                placeholder="例: 40000"
                                value={draft.toolingCost}
                                onChange={(event) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { toolingCost: Number(event.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">償却年数</Label>
                              <Input
                                type="number"
                                placeholder="例: 2"
                                value={draft.amortizationYears}
                                onChange={(event) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { amortizationYears: Number(event.target.value) })
                                }
                              />
                            </div>
                          </div>
                        </DraftCard>
                      ))
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="設備配賦"
                      description="商品で利用する設備の配賦設定"
                    />
                    <HintList
                      items={[
                        "利用率: 設備稼働のうち当該商品の占める割合 (0〜1)",
                        "年間生産数: 設備をこの商品に使う年間数量",
                      ]}
                    />
                    {productForm.equipmentIds.length === 0 ? (
                      <p className="text-sm text-muted-foreground">設備を選択すると配賦割合を入力できます。</p>
                    ) : (
                      equipmentAllocDrafts.map((draft) => {
                        const equipment = data.equipments.find((item) => item.id === draft.equipmentId)
                        if (!equipment) return null
                        return (
                          <DraftCard key={draft.id} hideRemove>
                            <p className="text-sm font-medium">{equipment.name}</p>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">利用率 (0-1)</Label>
                                <Input
                                  type="number"
                                  placeholder="例: 0.5"
                                  value={draft.allocationRatio}
                                  onChange={(event) =>
                                    updateDraft(setEquipmentAllocDrafts, draft.id, {
                                      allocationRatio: Number(event.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">年間生産数</Label>
                                <Input
                                  type="number"
                                  placeholder="例: 3000"
                                  value={draft.annualQuantity}
                                  onChange={(event) =>
                                    updateDraft(setEquipmentAllocDrafts, draft.id, {
                                      annualQuantity: Number(event.target.value),
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </DraftCard>
                        )
                      })
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="物流・配送費"
                      description="配送方法と単価"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setLogisticsDrafts, createLogisticsDraft())}
                    />
                    <HintList
                      items={[
                        "配送方法: 宅配便・定形外などの区分",
                        "単価: 1商品あたりの発送コスト",
                        "通貨: 支払い通貨",
                      ]}
                    />
                    {logisticsDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      logisticsDrafts.map((draft) => (
                        <DraftCard key={draft.id} onRemove={() => removeDraft(setLogisticsDrafts, draft.id)}>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">配送方法</Label>
                            <Input
                              placeholder="例: 宅配便"
                              value={draft.shippingMethod}
                              onChange={(event) => updateDraft(setLogisticsDrafts, draft.id, { shippingMethod: event.target.value })}
                            />
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">単価</Label>
                              <Input
                                type="number"
                                placeholder="例: 180"
                                value={draft.costPerUnit}
                                onChange={(event) =>
                                  updateDraft(setLogisticsDrafts, draft.id, { costPerUnit: Number(event.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">通貨</Label>
                              <Select
                                value={draft.currency}
                                onValueChange={(value) => updateDraft(setLogisticsDrafts, draft.id, { currency: value })}
                              >
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
                          </div>
                        </DraftCard>
                      ))
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="電気代"
                      description="1個あたりの電力コスト"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setElectricityDrafts, createElectricityDraft())}
                    />
                    <HintList
                      items={[
                        "単価: 1商品を作る際にかかる電気料金",
                        "通貨: 支払い通貨",
                      ]}
                    />
                    {electricityDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      electricityDrafts.map((draft) => (
                        <DraftCard key={draft.id} onRemove={() => removeDraft(setElectricityDrafts, draft.id)}>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">単価</Label>
                              <Input
                                type="number"
                                placeholder="例: 25"
                                value={draft.costPerUnit}
                                onChange={(event) =>
                                  updateDraft(setElectricityDrafts, draft.id, { costPerUnit: Number(event.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">通貨</Label>
                              <Select
                                value={draft.currency}
                                onValueChange={(value) => updateDraft(setElectricityDrafts, draft.id, { currency: value })}
                              >
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
                          </div>
                        </DraftCard>
                      ))
                    )}
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
          <Card>
            <CardHeader>
              <CardTitle>原価確認タブ</CardTitle>
              <CardDescription>商品登録フォームで入力したコスト明細の参照専用ビュー</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                追加入力や修正は商品タブで行い、このタブではカテゴリ別の合計値のみを確認します。
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <CostDisplay
              title="材料費"
              description="商品に紐づく材料単価"
              rows={data.costEntries.materials.map((entry) => {
                const productName = data.products.find((product) => product.id === entry.productId)?.name ?? "未設定"
                const materialName = data.materials.find((material) => material.id === entry.materialId)?.name ?? "-"
                return {
                  product: productName,
                  detail: `${materialName} ${entry.description ? `(${entry.description})` : ""}`,
                  amount: formatCurrency(entry.costPerUnit, entry.currency),
                }
              })}
            />
            <CostDisplay
              title="梱包材費"
              description="梱包材の使用数量"
              rows={data.costEntries.packaging.map((entry) => {
                const productName = data.products.find((product) => product.id === entry.productId)?.name ?? "未設定"
                const itemName = data.packagingItems.find((item) => item.id === entry.packagingItemId)?.name ?? "-"
                return {
                  product: productName,
                  detail: `${itemName} × ${entry.quantity}`,
                  amount: formatCurrency(entry.quantity * entry.costPerUnit, entry.currency),
                }
              })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CostDisplay
              title="人件費"
              description="作業カテゴリごとの工数"
              rows={data.costEntries.labor.map((entry) => {
                const productName = data.products.find((product) => product.id === entry.productId)?.name ?? "未設定"
                const role = data.laborRoles.find((labor) => labor.id === entry.laborRoleId)
                const hourlyRate = entry.hourlyRateOverride ?? role?.hourlyRate ?? 0
                const currency = role?.currency ?? "JPY"
                return {
                  product: productName,
                  detail: `${role?.name ?? "-"} / ${entry.hours}h × ${entry.peopleCount}人`,
                  amount: formatCurrency(hourlyRate * entry.hours * entry.peopleCount, currency),
                }
              })}
            />
            <CostDisplay
              title="外注費"
              description="委託費用"
              rows={data.costEntries.outsourcing.map((entry) => {
                const productName = data.products.find((product) => product.id === entry.productId)?.name ?? "未設定"
                return {
                  product: productName,
                  detail: entry.note || "-",
                  amount: formatCurrency(entry.costPerUnit, entry.currency),
                }
              })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CostDisplay
              title="開発コスト"
              description="試作/道具費の償却"
              rows={data.costEntries.development.map((entry) => {
                const product = data.products.find((item) => item.id === entry.productId)
                const quantity = product?.expectedProduction.quantity || 1
                const total = entry.prototypeLaborCost + entry.prototypeMaterialCost + entry.toolingCost
                const amortized = total / Math.max(entry.amortizationYears || 1, 1)
                return {
                  product: product?.name ?? "未設定",
                  detail: `${entry.amortizationYears}年 / ${quantity}個`,
                  amount: formatCurrency(amortized / Math.max(quantity, 1)),
                }
              })}
            />
            <CostDisplay
              title="設備配賦"
              description="設備利用割合"
              rows={data.costEntries.equipmentAllocations.map((entry) => {
                const product = data.products.find((item) => item.id === entry.productId)
                const equipment = data.equipments.find((item) => item.id === entry.equipmentId)
                if (!equipment) {
                  return { product: product?.name ?? "未設定", detail: "-", amount: formatCurrency(0) }
                }
                const annualCost = equipment.acquisitionCost / Math.max(equipment.amortizationYears || 1, 1)
                const unitCost = (annualCost * entry.allocationRatio) / Math.max(entry.annualQuantity || 1, 1)
                return {
                  product: product?.name ?? "未設定",
                  detail: `${equipment.name} / 利用率 ${Math.round(entry.allocationRatio * 100)}%`,
                  amount: formatCurrency(unitCost, equipment.currency),
                }
              })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CostDisplay
              title="物流・配送費"
              description="配送方法"
              rows={data.costEntries.logistics.map((entry) => {
                const productName = data.products.find((product) => product.id === entry.productId)?.name ?? "未設定"
                return {
                  product: productName,
                  detail: entry.shippingMethod,
                  amount: formatCurrency(entry.costPerUnit, entry.currency),
                }
              })}
            />
            <CostDisplay
              title="電気代"
              description="1ユニットあたり"
              rows={data.costEntries.electricity.map((entry) => {
                const productName = data.products.find((product) => product.id === entry.productId)?.name ?? "未設定"
                return {
                  product: productName,
                  detail: "基準値",
                  amount: formatCurrency(entry.costPerUnit, entry.currency),
                }
              })}
            />
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

function HintList({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <li key={`hint-${index}`}>{item}</li>
      ))}
    </ul>
  )
}

function SectionHeader({
  title,
  description,
  actionLabel,
  actionDisabled,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  actionDisabled?: boolean
  onAction?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button type="button" variant="outline" size="sm" onClick={onAction} disabled={actionDisabled}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

function DraftCard({
  children,
  onRemove,
  hideRemove,
}: {
  children: ReactNode
  onRemove?: () => void
  hideRemove?: boolean
}) {
  return (
    <div className="space-y-3 rounded-md border border-dashed p-3">
      <div className="space-y-3">{children}</div>
      {!hideRemove && onRemove && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            行を削除
          </Button>
        </div>
      )}
    </div>
  )
}

function CostDisplay({
  title,
  description,
  rows,
}: {
  title: string
  description: string
  rows: { product: string; detail: string; amount: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだデータがありません。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`${title}-${index}`}>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.detail}</TableCell>
                  <TableCell className="text-right font-medium">{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
