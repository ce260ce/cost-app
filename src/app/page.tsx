"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/ui/number-input"
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
  ShippingMethod,
} from "@/lib/types"

const currencyOptions = ["JPY", "USD", "EUR"]

const createTempId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11)

type NumericValue = number | ""

type MaterialCostDraft = {
  id: string
  materialId: string
  usageRatio: number
  description: string
}

type PackagingCostDraft = {
  id: string
  packagingItemId: string
  quantity: number
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
  costPerUnit: NumericValue
  currency: string
}

type DevelopmentCostDraft = {
  id: string
  title: string
  prototypeLaborCost: NumericValue
  prototypeMaterialCost: NumericValue
  toolingCost: NumericValue
  amortizationYears: number
}

type EquipmentAllocationDraft = {
  id: string
  equipmentId: string
  allocationRatio: number
  annualQuantity: number
  usageHours: number
}

type LogisticsCostDraft = {
  id: string
  shippingMethodId: string
}

type ElectricityCostDraft = {
  id: string
  costPerUnit: NumericValue
  currency: string
}

export default function Home() {
  const { data, hydrated, actions } = useAppData()
  const shippingMethods = data.shippingMethods ?? []

  const createMaterialDraft = (): MaterialCostDraft => ({
    id: createTempId(),
    materialId: data.materials[0]?.id ?? "",
    usageRatio: 100,
    description: "",
  })

  const createPackagingDraft = (): PackagingCostDraft => ({
    id: createTempId(),
    packagingItemId: data.packagingItems[0]?.id ?? "",
    quantity: 1,
  })

const createLaborDraft = (initialHours = 1): LaborCostDraft => ({
  id: createTempId(),
  laborRoleId: data.laborRoles[0]?.id ?? "",
  hours: initialHours,
  peopleCount: 1,
})

  const createOutsourcingDraft = (): OutsourcingCostDraft => ({
    id: createTempId(),
    note: "",
    costPerUnit: "",
    currency: "JPY",
  })

  const createDevelopmentDraft = (): DevelopmentCostDraft => ({
    id: createTempId(),
    title: "",
    prototypeLaborCost: "",
    prototypeMaterialCost: "",
    toolingCost: "",
    amortizationYears: 3,
  })

  const createLogisticsDraft = (): LogisticsCostDraft => ({
    id: createTempId(),
    shippingMethodId: shippingMethods[0]?.id ?? "",
  })

  const createElectricityDraft = (): ElectricityCostDraft => ({
    id: createTempId(),
    costPerUnit: "",
    currency: "JPY",
  })

  const [largeCategory, setLargeCategory] = useState({ name: "", description: "" })
  const [mediumCategory, setMediumCategory] = useState({ name: "", description: "", largeId: "" })
  const [smallCategory, setSmallCategory] = useState({ name: "", description: "", mediumId: "" })

  const [materialForm, setMaterialForm] = useState<Omit<Material, "id">>({
    name: "",
    unit: "kg",
    unitCost: 0,
    sizeDescription: "",
    currency: "JPY",
    supplier: "",
    note: "",
  })

  const [packagingForm, setPackagingForm] = useState<Omit<PackagingItem, "id">>({
    name: "",
    unit: "set",
    sizeDescription: "",
    unitCost: 0,
    currency: "JPY",
    note: "",
  })

  const [shippingMethodForm, setShippingMethodForm] = useState<Omit<ShippingMethod, "id">>({
    name: "",
    description: "",
    unitCost: 0,
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
    productionLotSize: 1,
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
        const nextHours = productForm.baseManHours && productForm.equipmentIds.length + 1 > 0
          ? productForm.baseManHours / (productForm.equipmentIds.length + 1)
          : 1
        return [
          ...prev,
          {
            id: createTempId(),
            equipmentId,
            allocationRatio: 0.5,
            annualQuantity: productForm.expectedProduction.quantity || 1,
            usageHours: nextHours,
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

  const materialUsageGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        materialId: string
        materialName: string
        unit?: string
        currency?: string
        baseUnitCost?: number
        totalUsageRatio?: number
        supplier?: string
        entries: {
          productName: string
          usageRatio?: number
          costShare?: number
          lotSize?: number
        }[]
      }
    >()

    const ensureGroup = (material: Material) => {
      if (!groups.has(material.id)) {
        groups.set(material.id, {
          materialId: material.id,
          materialName: material.name,
          unit: material.unit,
          currency: material.currency,
          baseUnitCost: material.unitCost,
          totalUsageRatio: undefined,
          supplier: material.supplier,
          entries: [],
        })
      }
      return groups.get(material.id)!
    }

    data.costEntries.materials.forEach((entry) => {
      const material = data.materials.find((item) => item.id === entry.materialId)
      if (!material) return
      const product = data.products.find((item) => item.id === entry.productId)
      const productName = product?.name ?? "未設定"

      const group = ensureGroup(material)
      group.currency = entry.currency ?? group.currency
      if (entry.usageRatio !== undefined) {
        group.totalUsageRatio = (group.totalUsageRatio ?? 0) + entry.usageRatio
      }
      group.entries.push({
        productName,
        usageRatio: entry.usageRatio,
        costShare: entry.costPerUnit,
        lotSize: product?.productionLotSize,
      })
    })

    return Array.from(groups.values()).filter((group) => group.entries.length > 0)
  }, [data])

  const equipmentUsageGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        equipment: Equipment
        totalUsageHours?: number
        entries: {
          productName: string
          allocationRatio: number
          annualQuantity: number
          unitCost: number
          usageHours?: number
        }[]
      }
    >()

    data.costEntries.equipmentAllocations.forEach((entry) => {
      const equipment = data.equipments.find((item) => item.id === entry.equipmentId)
      if (!equipment) return
      const product = data.products.find((item) => item.id === entry.productId)
      const productName = product?.name ?? "未設定"
      const annualCost = equipment.acquisitionCost / Math.max(equipment.amortizationYears || 1, 1)
      const unitCost = (annualCost * entry.allocationRatio) / Math.max(entry.annualQuantity || 1, 1)

      if (!groups.has(equipment.id)) {
        groups.set(equipment.id, { equipment, totalUsageHours: undefined, entries: [] })
      }

      const group = groups.get(equipment.id)!
      if (entry.usageHours !== undefined) {
        group.totalUsageHours = (group.totalUsageHours ?? 0) + entry.usageHours
      }

      group.entries.push({
        productName,
        allocationRatio: entry.allocationRatio,
        annualQuantity: entry.annualQuantity,
        unitCost,
        usageHours: entry.usageHours,
      })
    })

    return Array.from(groups.values())
  }, [data.costEntries.equipmentAllocations, data.equipments, data.products])

  const autoLaborHoursRef = useRef<number>(productForm.baseManHours || 0)

  useEffect(() => {
    const nextHours = Number(productForm.baseManHours) || 0
    if (autoLaborHoursRef.current === nextHours) return
    setLaborDrafts((drafts) =>
      drafts.map((draft) => {
        if (draft.hours === autoLaborHoursRef.current || draft.hours === 0) {
          return { ...draft, hours: nextHours }
        }
        return draft
      })
    )
    autoLaborHoursRef.current = nextHours
  }, [productForm.baseManHours])

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
  const totalEquipmentHours = equipmentAllocDrafts.reduce((sum, draft) => sum + (draft.usageHours || 0), 0)

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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">名称</Label>
                    <Input
                      placeholder="例: アパレル"
                      value={largeCategory.name}
                      onChange={(event) => setLargeCategory((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">概要 (任意)</Label>
                    <Textarea
                      placeholder="概要"
                      value={largeCategory.description}
                      onChange={(event) => setLargeCategory((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </div>
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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">親カテゴリ</Label>
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">名称</Label>
                    <Input
                      placeholder="例: バッグ"
                      value={mediumCategory.name}
                      onChange={(event) => setMediumCategory((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">概要 (任意)</Label>
                    <Textarea
                      placeholder="概要"
                      value={mediumCategory.description}
                      onChange={(event) => setMediumCategory((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </div>
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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">親 (中カテゴリ)</Label>
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">名称</Label>
                    <Input
                      placeholder="例: ミニトート"
                      value={smallCategory.name}
                      onChange={(event) => setSmallCategory((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">概要 (任意)</Label>
                    <Textarea
                      placeholder="概要"
                      value={smallCategory.description}
                      onChange={(event) => setSmallCategory((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </div>
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
                    actions.addMaterial({
                      ...materialForm,
                      unitCost: Number(materialForm.unitCost) || 0,
                    })
                    setMaterialForm({
                      name: "",
                      unit: "kg",
                      unitCost: 0,
                      sizeDescription: "",
                      currency: "JPY",
                      supplier: "",
                      note: "",
                    })
                  }}
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">材料名</Label>
                    <Input
                      placeholder="例: キャンバス生地"
                      value={materialForm.name}
                      onChange={(event) => setMaterialForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">単位</Label>
                      <Input
                        placeholder="例: m"
                        value={materialForm.unit}
                        onChange={(event) => setMaterialForm((prev) => ({ ...prev, unit: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">通貨</Label>
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">基準単価</Label>
                    <NumberInput
                      placeholder="例: 320"
                      value={materialForm.unitCost}
                      onValueChange={(next) =>
                        setMaterialForm((prev) => ({ ...prev, unitCost: next === "" ? 0 : next }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">サイズ・容量</Label>
                    <Input
                      placeholder="例: 50mロール"
                      value={materialForm.sizeDescription}
                      onChange={(event) => setMaterialForm((prev) => ({ ...prev, sizeDescription: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">仕入先</Label>
                    <Input
                      placeholder="例: FabricMart"
                      value={materialForm.supplier}
                      onChange={(event) => setMaterialForm((prev) => ({ ...prev, supplier: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">備考</Label>
                    <Textarea
                      placeholder="為替や特記事項"
                      value={materialForm.note}
                      onChange={(event) => setMaterialForm((prev) => ({ ...prev, note: event.target.value }))}
                    />
                  </div>
                  <Button type="submit" size="sm">
                    追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 材料"
                  items={data.materials.map((material) => {
                    const supplier = material.supplier ? ` / ${material.supplier}` : ""
                    const unitCostText = formatCurrency(material.unitCost, material.currency)
                    return `${material.name} / ${unitCostText} / ${material.unit} / ${material.sizeDescription}${supplier}`
                  })}
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
                    actions.addPackagingItem({
                      ...packagingForm,
                      unitCost: Number(packagingForm.unitCost) || 0,
                    })
                    setPackagingForm({
                      name: "",
                      unit: "set",
                      sizeDescription: "",
                      unitCost: 0,
                      currency: "JPY",
                      note: "",
                    })
                  }}
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">梱包材名</Label>
                    <Input
                      placeholder="例: 段ボールS"
                      value={packagingForm.name}
                      onChange={(event) => setPackagingForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">単位</Label>
                      <Input
                        placeholder="例: 枚"
                        value={packagingForm.unit}
                        onChange={(event) => setPackagingForm((prev) => ({ ...prev, unit: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">通貨</Label>
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">サイズ/仕様</Label>
                    <Input
                      placeholder="例: 320x250x120"
                      value={packagingForm.sizeDescription}
                      onChange={(event) => setPackagingForm((prev) => ({ ...prev, sizeDescription: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">基準単価</Label>
                    <NumberInput
                      placeholder="例: 80"
                      value={packagingForm.unitCost}
                      onValueChange={(next) =>
                        setPackagingForm((prev) => ({ ...prev, unitCost: next === "" ? 0 : next }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">備考</Label>
                    <Textarea
                      placeholder="仕入先や材質"
                      value={packagingForm.note}
                      onChange={(event) => setPackagingForm((prev) => ({ ...prev, note: event.target.value }))}
                    />
                  </div>
                  <Button type="submit" size="sm">
                    追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 梱包材"
                  items={data.packagingItems.map((item) => {
                    const unitCostText = formatCurrency(item.unitCost, item.currency)
                    return `${item.name} / ${unitCostText} / ${item.unit} / ${item.sizeDescription}`
                  })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>配送方法マスタ</CardTitle>
                <CardDescription>宅配便・メール便などの配送手段と送料を登録します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                  className="grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!shippingMethodForm.name.trim()) return
                    actions.addShippingMethod({
                      ...shippingMethodForm,
                      unitCost: Number(shippingMethodForm.unitCost) || 0,
                    })
                    setShippingMethodForm({
                      name: "",
                      description: "",
                      unitCost: 0,
                      currency: "JPY",
                      note: "",
                    })
                  }}
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">配送方法名</Label>
                    <Input
                      placeholder="例: 宅配便"
                      value={shippingMethodForm.name}
                      onChange={(event) => setShippingMethodForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">説明 (任意)</Label>
                    <Input
                      placeholder="例: 箱発送 / 佐川・ヤマト"
                      value={shippingMethodForm.description}
                      onChange={(event) => setShippingMethodForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">基準単価</Label>
                      <NumberInput
                        placeholder="例: 180"
                        value={shippingMethodForm.unitCost}
                        onValueChange={(next) =>
                          setShippingMethodForm((prev) => ({ ...prev, unitCost: next === "" ? 0 : next }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">通貨</Label>
                      <Select
                        value={shippingMethodForm.currency}
                        onValueChange={(value) => setShippingMethodForm((prev) => ({ ...prev, currency: value }))}
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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">備考</Label>
                    <Textarea
                      placeholder="例: 100サイズまで"
                      value={shippingMethodForm.note}
                      onChange={(event) => setShippingMethodForm((prev) => ({ ...prev, note: event.target.value }))}
                    />
                  </div>
                  <Button type="submit" size="sm">
                    追加
                  </Button>
                </form>

                <RegisteredList
                  title="登録済み 配送方法"
                  items={shippingMethods.map((method) => {
                    const unitCostText = formatCurrency(method.unitCost, method.currency)
                    return `${method.name} / ${unitCostText}${method.description ? ` / ${method.description}` : ""}`
                  })}
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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">作業カテゴリ</Label>
                    <Input
                      placeholder="例: 裁断"
                      value={laborForm.name}
                      onChange={(event) => setLaborForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">時給</Label>
                      <NumberInput
                        placeholder="例: 1800"
                        value={laborForm.hourlyRate}
                        onValueChange={(next) =>
                          setLaborForm((prev) => ({ ...prev, hourlyRate: next === "" ? 0 : next }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">通貨</Label>
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">備考</Label>
                    <Textarea
                      placeholder="例: 外部スタッフ"
                      value={laborForm.note}
                      onChange={(event) => setLaborForm((prev) => ({ ...prev, note: event.target.value }))}
                    />
                  </div>
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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">設備名</Label>
                    <Input
                      placeholder="例: 工業用ミシン"
                      value={equipmentForm.name}
                      onChange={(event) => setEquipmentForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">取得額</Label>
                      <NumberInput
                        placeholder="例: 400000"
                        value={equipmentForm.acquisitionCost}
                        onValueChange={(next) =>
                          setEquipmentForm((prev) => ({ ...prev, acquisitionCost: next === "" ? 0 : next }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">償却年数</Label>
                      <NumberInput
                        placeholder="例: 5"
                        value={equipmentForm.amortizationYears}
                        onValueChange={(next) =>
                          setEquipmentForm((prev) => ({ ...prev, amortizationYears: next === "" ? 0 : next }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">通貨</Label>
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">備考</Label>
                    <Textarea
                      placeholder="例: リース品"
                      value={equipmentForm.note}
                      onChange={(event) => setEquipmentForm((prev) => ({ ...prev, note: event.target.value }))}
                    />
                  </div>
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
                    productionLotSize: Number(productForm.productionLotSize) || 1,
                    expectedProduction: {
                      periodYears: Number(productForm.expectedProduction.periodYears) || 1,
                      quantity: Number(productForm.expectedProduction.quantity) || 1,
                    },
                    defaultElectricityCost: Number(electricityUnitCost) || 0,
                  }
                  actions.addProduct({ id: newProductId, ...normalizedProduct })

                  materialDrafts
                    .filter((draft) => draft.materialId)
                    .forEach((draft) => {
                      const material = data.materials.find((item) => item.id === draft.materialId)
                      if (!material) return
                      const usageRatio = Math.max(Number(draft.usageRatio) || 0, 0)
                      const costPerUnit = (material.unitCost || 0) * (usageRatio / 100)
                      actions.addMaterialCostEntry({
                        productId: newProductId,
                        materialId: draft.materialId,
                        description: draft.description,
                        usageRatio,
                        costPerUnit,
                        currency: material.currency,
                      })
                    })

                  packagingDrafts
                    .filter((draft) => draft.packagingItemId)
                    .forEach((draft) => {
                      const packagingItem = data.packagingItems.find((item) => item.id === draft.packagingItemId)
                      if (!packagingItem) return
                      actions.addPackagingCostEntry({
                        productId: newProductId,
                        packagingItemId: draft.packagingItemId,
                        quantity: Number(draft.quantity) || 0,
                        costPerUnit: packagingItem.unitCost || 0,
                        currency: packagingItem.currency,
                      })
                    })

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
                        title: draft.title.trim() || "開発コスト",
                        prototypeLaborCost: Number(draft.prototypeLaborCost) || 0,
                        prototypeMaterialCost: Number(draft.prototypeMaterialCost) || 0,
                        toolingCost: Number(draft.toolingCost) || 0,
                        amortizationYears: Number(draft.amortizationYears) || 1,
                      })
                    )

                  const totalEquipmentHoursForSubmit = equipmentAllocDrafts.reduce(
                    (sum, draft) => sum + (draft.usageHours || 0),
                    0
                  )

                  equipmentAllocDrafts
                    .filter((draft) => draft.equipmentId)
                    .forEach((draft) => {
                      const usageHours = draft.usageHours || 0
                      const ratio =
                        totalEquipmentHoursForSubmit > 0
                          ? usageHours / totalEquipmentHoursForSubmit
                          : Number(draft.allocationRatio) || 0
                      actions.addEquipmentAllocation({
                        productId: newProductId,
                        equipmentId: draft.equipmentId,
                        allocationRatio: ratio,
                        annualQuantity:
                          Number(draft.annualQuantity) || normalizedProduct.expectedProduction.quantity,
                        usageHours,
                      })
                    })

                  logisticsDrafts
                    .filter((draft) => draft.shippingMethodId)
                    .forEach((draft) => {
                      const method = shippingMethods.find((item) => item.id === draft.shippingMethodId)
                      if (!method) return
                      actions.addLogisticsCostEntry({
                        productId: newProductId,
                        shippingMethodId: draft.shippingMethodId,
                        costPerUnit: method.unitCost || 0,
                        currency: method.currency,
                      })
                    })

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
                    productionLotSize: 1,
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
                    placeholder="サイズ展開 (1行につき1パターンを入力)"
                    value={productForm.sizes.join("\n")}
                    rows={3}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        sizes: event.target.value
                          .split(/\r?\n/)
                          .map((size) => size.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    複数サイズは改行で区切ってください。例) 4号、5号 ↵ 3~20号
                  </p>
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
                      <NumberInput
                        placeholder="例: 1.5"
                        value={productForm.baseManHours}
                        onValueChange={(next) =>
                          setProductForm((prev) => ({ ...prev, baseManHours: next === "" ? 0 : next }))
                        }
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
                      <NumberInput
                        placeholder="例: 1"
                        value={productForm.expectedProduction.periodYears}
                        onValueChange={(next) =>
                          setProductForm((prev) => ({
                            ...prev,
                            expectedProduction: {
                              ...prev.expectedProduction,
                              periodYears: next === "" ? 0 : next,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">期間内生産予定数</Label>
                      <NumberInput
                        placeholder="例: 1000"
                        value={productForm.expectedProduction.quantity}
                        onValueChange={(next) =>
                          setProductForm((prev) => ({
                            ...prev,
                            expectedProduction: {
                              ...prev.expectedProduction,
                              quantity: next === "" ? 0 : next,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">制作個数 (今回ロット)</Label>
                      <NumberInput
                        placeholder="例: 20"
                        value={productForm.productionLotSize}
                        onValueChange={(next) =>
                          setProductForm((prev) => ({
                            ...prev,
                            productionLotSize: next === "" ? 0 : next,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">材料使用量サマリで参照するロット単位</p>
                    </div>
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
                      description="材料マスタから選択し、使用率だけ入力すれば単価を自動参照"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setMaterialDrafts, createMaterialDraft())}
                      actionDisabled={data.materials.length === 0}
                    />
                    <HintList
                      items={[
                        "材料マスタ: 事前登録した素材を選択（単価・通貨はマスタ値を使用）",
                        "使用率(%): 仕入れたロットのうち1個あたりで使う割合",
                        "用途: 本体用・持ち手用などのメモ",
                      ]}
                    />
                    {data.materials.length === 0 ? (
                      <p className="text-sm text-muted-foreground">材料マスタを登録すると入力できます。</p>
                    ) : materialDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      materialDrafts.map((draft) => {
                        const selectedMaterial = data.materials.find((material) => material.id === draft.materialId)
                        const unitCostLabel = selectedMaterial
                          ? `${formatCurrency(selectedMaterial.unitCost, selectedMaterial.currency)} / ${selectedMaterial.unit ?? "任意単位"}`
                          : "材料マスタで単価を登録すると自動計算されます。"
                        return (
                          <DraftCard key={draft.id} onRemove={() => removeDraft(setMaterialDrafts, draft.id)}>
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">材料</Label>
                                <Select
                                  value={draft.materialId}
                                  onValueChange={(value) =>
                                    updateDraft(setMaterialDrafts, draft.id, {
                                      materialId: value,
                                    })
                                  }
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
                                {selectedMaterial?.supplier && (
                                  <p className="text-xs text-muted-foreground">仕入先: {selectedMaterial.supplier}</p>
                                )}
                              </div>
                              <div className="grid gap-2 md:grid-cols-2">
                                <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">使用率 (%)</Label>
                                <NumberInput
                                  placeholder="例: 75"
                                  value={draft.usageRatio}
                                  onValueChange={(next) =>
                                    updateDraft(setMaterialDrafts, draft.id, {
                                      usageRatio: next === "" ? 0 : next,
                                    })
                                  }
                                />
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
                              <p className="text-xs text-muted-foreground">材料単価: {unitCostLabel}</p>
                            </div>
                          </DraftCard>
                        )
                      })
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="梱包材費"
                      description="梱包材マスタを選択し、数量だけ入力すれば単価は自動参照"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setPackagingDrafts, createPackagingDraft())}
                      actionDisabled={data.packagingItems.length === 0}
                    />
                    <HintList
                      items={[
                        "梱包材マスタ: 箱・袋などを事前登録（単価/通貨含む）",
                        "数量: 1商品あたりに使う点数や長さ",
                        "単価はマスタ値を自動適用",
                      ]}
                    />
                    {data.packagingItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">梱包材マスタを登録すると入力できます。</p>
                    ) : packagingDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      packagingDrafts.map((draft) => {
                        const selectedItem = data.packagingItems.find((item) => item.id === draft.packagingItemId)
                        const unitCostLabel = selectedItem
                          ? `${formatCurrency(selectedItem.unitCost, selectedItem.currency)} / ${selectedItem.unit}`
                          : "梱包材マスタで単価を登録してください"
                        return (
                          <DraftCard key={draft.id} onRemove={() => removeDraft(setPackagingDrafts, draft.id)}>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">梱包材</Label>
                                <Select
                                  value={draft.packagingItemId}
                                  onValueChange={(value) =>
                                    updateDraft(setPackagingDrafts, draft.id, { packagingItemId: value })
                                  }
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
                                <NumberInput
                                  placeholder="例: 1"
                                  value={draft.quantity}
                                  onValueChange={(next) =>
                                    updateDraft(setPackagingDrafts, draft.id, {
                                      quantity: next === "" ? 0 : next,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">梱包材単価: {unitCostLabel}</p>
                          </DraftCard>
                        )
                      })
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <SectionHeader
                      title="人件費"
                      description="作業カテゴリごとに工数と人数を設定"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setLaborDrafts, createLaborDraft(Number(productForm.baseManHours) || 0))}
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
                                <NumberInput
                                  placeholder="例: 0.5"
                                  value={draft.hours}
                                  onValueChange={(next) =>
                                    updateDraft(setLaborDrafts, draft.id, { hours: next === "" ? 0 : next })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">人数</Label>
                                <NumberInput
                                  placeholder="例: 1"
                                  value={draft.peopleCount}
                                  onValueChange={(next) =>
                                    updateDraft(setLaborDrafts, draft.id, { peopleCount: next === "" ? 0 : next })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">時給 (任意)</Label>
                                <NumberInput
                                  placeholder="例: 2000"
                                  value={draft.hourlyRateOverride ?? ""}
                                  onValueChange={(next) =>
                                    updateDraft(setLaborDrafts, draft.id, {
                                      hourlyRateOverride: next === "" ? undefined : next,
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
                              <NumberInput
                                placeholder="例: 120"
                                value={draft.costPerUnit}
                                onValueChange={(next) =>
                                  updateDraft(setOutsourcingDrafts, draft.id, { costPerUnit: next })
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
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">タイトル</Label>
                            <Input
                              placeholder="例: 写真撮影コスト"
                              value={draft.title}
                              onChange={(event) =>
                                updateDraft(setDevelopmentDrafts, draft.id, { title: event.target.value })
                              }
                            />
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">試作工数コスト</Label>
                              <NumberInput
                                placeholder="例: 150000"
                                value={draft.prototypeLaborCost}
                                onValueChange={(next) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { prototypeLaborCost: next })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">試作用材料費</Label>
                              <NumberInput
                                placeholder="例: 60000"
                                value={draft.prototypeMaterialCost}
                                onValueChange={(next) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { prototypeMaterialCost: next })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">道具費</Label>
                              <NumberInput
                                placeholder="例: 40000"
                                value={draft.toolingCost}
                                onValueChange={(next) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { toolingCost: next })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">償却年数</Label>
                              <NumberInput
                                placeholder="例: 2"
                                value={draft.amortizationYears}
                                onValueChange={(next) =>
                                  updateDraft(setDevelopmentDrafts, draft.id, { amortizationYears: next === "" ? 0 : next })
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
                        const ratio =
                          totalEquipmentHours > 0 && draft.usageHours
                            ? Math.round((draft.usageHours / totalEquipmentHours) * 100)
                            : Math.round(draft.allocationRatio * 100)
                        return (
                          <DraftCard key={draft.id} hideRemove>
                            <p className="text-sm font-medium">{equipment.name}</p>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">使用時間 (h)</Label>
                                <NumberInput
                                  placeholder="例: 0.5"
                                  value={draft.usageHours ?? ""}
                                  onValueChange={(next) =>
                                    updateDraft(setEquipmentAllocDrafts, draft.id, {
                                      usageHours: next === "" ? undefined : next,
                                    })
                                  }
                                />
                                <p className="text-xs text-muted-foreground">
                                  {totalEquipmentHours > 0
                                    ? `利用率 約${ratio}%`
                                    : "利用率は使用時間から自動計算されます"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">年間生産数</Label>
                                <NumberInput
                                  placeholder="例: 3000"
                                  value={draft.annualQuantity}
                                  onValueChange={(next) =>
                                    updateDraft(setEquipmentAllocDrafts, draft.id, {
                                      annualQuantity: next === "" ? 0 : next,
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
                      description="配送方法マスタから選択し、単価は自動適用"
                      actionLabel="行を追加"
                      onAction={() => addDraft(setLogisticsDrafts, createLogisticsDraft())}
                      actionDisabled={shippingMethods.length === 0}
                    />
                    <HintList
                      items={[
                        "配送方法マスタ: 事前登録した配送パターンを選択",
                        "単価はマスタの基準単価を自動参照",
                        "送料の通貨もマスタ定義を利用",
                      ]}
                    />
                    {shippingMethods.length === 0 ? (
                      <p className="text-sm text-muted-foreground">先に配送方法マスタを登録してください。</p>
                    ) : logisticsDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">明細を追加してください。</p>
                    ) : (
                      logisticsDrafts.map((draft) => {
                        const shippingMethod = shippingMethods.find((method) => method.id === draft.shippingMethodId)
                        const unitCostText = shippingMethod
                          ? `${formatCurrency(shippingMethod.unitCost, shippingMethod.currency)}`
                          : "配送方法を選択してください"
                        return (
                          <DraftCard key={draft.id} onRemove={() => removeDraft(setLogisticsDrafts, draft.id)}>
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">配送方法</Label>
                                <Select
                                  value={draft.shippingMethodId}
                                  onValueChange={(value) =>
                                    updateDraft(setLogisticsDrafts, draft.id, { shippingMethodId: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="配送方法" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {shippingMethods.map((method) => (
                                      <SelectItem key={method.id} value={method.id}>
                                        {method.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                単価: {unitCostText}
                                {shippingMethod?.description ? ` / ${shippingMethod.description}` : ""}
                              </p>
                            </div>
                          </DraftCard>
                        )
                      })
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
                              <NumberInput
                                placeholder="例: 25"
                                value={draft.costPerUnit}
                                onValueChange={(next) =>
                                  updateDraft(setElectricityDrafts, draft.id, { costPerUnit: next })
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
            <Card>
              <CardHeader>
                <CardTitle>材料サマリ</CardTitle>
                <CardDescription>材料ごとの使用状況と単価を確認</CardDescription>
              </CardHeader>
              <CardContent>
                {materialUsageGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">まだ材料明細がありません。</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>材料</TableHead>
                        <TableHead>仕入先</TableHead>
                        <TableHead>登録使用率合計</TableHead>
                        <TableHead>材料単価</TableHead>
                        <TableHead>原価内訳</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materialUsageGroups.map((group) => (
                        <TableRow key={`summary-${group.materialId}`}>
                          <TableCell>{group.materialName}</TableCell>
                          <TableCell>{group.supplier ?? "-"}</TableCell>
                          <TableCell>
                            {group.totalUsageRatio !== undefined ? `${group.totalUsageRatio}%` : "-"}
                          </TableCell>
                          <TableCell>
                            {group.baseUnitCost !== undefined
                              ? formatCurrency(group.baseUnitCost, group.currency ?? "JPY")
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {group.entries.length === 0
                              ? "-"
                              : group.entries
                                  .map((entry) => {
                                    const ratioText = entry.usageRatio !== undefined ? `${entry.usageRatio}%` : "-"
                                    const costText =
                                      entry.costShare !== undefined
                                        ? formatCurrency(entry.costShare, group.currency ?? "JPY")
                                        : "-"
                                    const lotText = entry.lotSize ? `${entry.lotSize}個` : "-"
                                    return `${entry.productName}: ${ratioText} / ${costText} / ${lotText}`
                                  })
                                  .join(" / ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

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
                  detail: `${entry.title ?? "開発コスト"} / ${entry.amortizationYears}年 / ${quantity}個`,
                  amount: formatCurrency(amortized / Math.max(quantity, 1)),
                }
              })}
            />
            <Card>
              <CardHeader>
                <CardTitle>設備配賦</CardTitle>
                <CardDescription>設備単位での配賦状況</CardDescription>
              </CardHeader>
              <CardContent>
                {equipmentUsageGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">まだ設備配賦が登録されていません。</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>設備</TableHead>
                        <TableHead>取得額 / 償却年数</TableHead>
                        <TableHead>配賦内訳</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipmentUsageGroups.map((group) => (
                        <TableRow key={`equipment-group-${group.equipment.id}`}>
                          <TableCell>{group.equipment.name}</TableCell>
                          <TableCell>
                            {formatCurrency(group.equipment.acquisitionCost, group.equipment.currency)} /
                            {group.equipment.amortizationYears}年
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {group.entries
                              .map((entry) => {
                                const ratio =
                                  group.totalUsageHours && entry.usageHours !== undefined && group.totalUsageHours > 0
                                    ? Math.round((entry.usageHours / group.totalUsageHours) * 100)
                                    : Math.round(entry.allocationRatio * 100)
                                const hoursText =
                                  entry.usageHours !== undefined
                                    ? `${entry.usageHours.toFixed(2)}h`
                                    : "-"
                                return `${entry.productName}: ${ratio}% / ${entry.annualQuantity}個 / ${hoursText} / ${formatCurrency(entry.unitCost, group.equipment.currency)}`
                              })
                              .join(" / ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CostDisplay
              title="物流・配送費"
              description="配送方法"
              rows={data.costEntries.logistics.map((entry) => {
                const productName = data.products.find((product) => product.id === entry.productId)?.name ?? "未設定"
                const methodName = shippingMethods.find((method) => method.id === entry.shippingMethodId)?.name ?? "未設定"
                return {
                  product: productName,
                  detail: methodName,
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
