"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/ui/number-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { AppActions } from "@/lib/app-data"
import { formatCurrency } from "@/lib/calculations"
import { currencyOptions } from "@/lib/constants"
import type {
  AppData,
  CategoryLarge,
  CategoryMedium,
  CategorySmall,
  Equipment,
  LaborRole,
  Material,
  PackagingItem,
  ShippingMethod,
} from "@/lib/types"
import { RegisteredList } from "../shared/ui"

interface MasterTabProps {
  data: AppData
  actions: AppActions
}

export function MasterTab({ data, actions }: MasterTabProps) {
  const [largeCategory, setLargeCategory] = useState<Omit<CategoryLarge, "id">>({ name: "", description: "" })
  const [mediumCategory, setMediumCategory] = useState<Omit<CategoryMedium, "id">>({
    name: "",
    description: "",
    largeId: "",
  })
  const [smallCategory, setSmallCategory] = useState<Omit<CategorySmall, "id">>({
    name: "",
    description: "",
    mediumId: "",
  })

  const [materialForm, setMaterialForm] = useState<Omit<Material, "id">>({
    name: "",
    unit: "kg",
    sizeDescription: "",
    currency: "JPY",
    unitCost: 0,
    supplier: "",
    note: "",
  })

  const [packagingForm, setPackagingForm] = useState<Omit<PackagingItem, "id">>({
    name: "",
    unit: "set",
    sizeDescription: "",
    currency: "JPY",
    unitCost: 0,
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

  const [shippingMethodForm, setShippingMethodForm] = useState<Omit<ShippingMethod, "id">>({
    name: "",
    description: "",
    unitCost: 0,
    currency: "JPY",
    note: "",
  })

  const {
    addLargeCategory,
    addMediumCategory,
    addSmallCategory,
    addMaterial,
    addPackagingItem,
    addLaborRole,
    addEquipment,
    addShippingMethod,
  } = actions

  const largeOptions = data.categories.large

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>カテゴリマスタ</CardTitle>
            <CardDescription>大・中・小カテゴリを事前登録し、商品登録時に選択できるようにします。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!largeCategory.name.trim()) return
                addLargeCategory({ ...largeCategory })
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
                addMediumCategory({ ...mediumCategory })
                setMediumCategory({ name: "", description: "", largeId: "" })
              }}
            >
              <Label className="text-sm font-semibold">中カテゴリ</Label>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">親カテゴリ</Label>
                <Select
                  value={mediumCategory.largeId}
                  onValueChange={(value) => setMediumCategory((prev) => ({ ...prev, largeId: value }))}
                >
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
                  placeholder="例: トート"
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
              <Button type="submit" size="sm" disabled={!data.categories.large.length}>
                追加
              </Button>
            </form>

            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!smallCategory.name.trim() || !smallCategory.mediumId) return
                addSmallCategory({ ...smallCategory })
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
            <CardDescription>名称・単位・サイズ・仕入先まで登録し、材料コスト入力時に再利用します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!materialForm.name.trim()) return
                addMaterial({ ...materialForm })
                setMaterialForm({
                  name: "",
                  unit: "kg",
                  sizeDescription: "",
                  currency: "JPY",
                  unitCost: 0,
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
                  onValueChange={(next) => setMaterialForm((prev) => ({ ...prev, unitCost: next === "" ? 0 : next }))}
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
                  placeholder="為替やメモ"
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
            <CardDescription>段ボールやフィルムなどを登録し、商品登録時に選べるようにします。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!packagingForm.name.trim()) return
                addPackagingItem({ ...packagingForm })
                setPackagingForm({
                  name: "",
                  unit: "set",
                  sizeDescription: "",
                  currency: "JPY",
                  unitCost: 0,
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
                  onValueChange={(next) => setPackagingForm((prev) => ({ ...prev, unitCost: next === "" ? 0 : next }))}
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
                addShippingMethod({ ...shippingMethodForm })
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
                  placeholder="例: 100サイズ / 佐川"
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
                    onValueChange={(next) => setShippingMethodForm((prev) => ({ ...prev, unitCost: next === "" ? 0 : next }))}
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
              items={(data.shippingMethods ?? []).map((method) => {
                const unitCostText = formatCurrency(method.unitCost, method.currency)
                return `${method.name} / ${unitCostText}${method.description ? ` / ${method.description}` : ""}`
              })}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>人件費 / 設備マスタ</CardTitle>
          <CardDescription>工数と時給、設備投資のベースをまとめて管理します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!laborForm.name.trim()) return
              addLaborRole({ ...laborForm })
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
                  onValueChange={(next) => setLaborForm((prev) => ({ ...prev, hourlyRate: next === "" ? 0 : next }))}
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

            <RegisteredList
              title="登録済み 人件費"
              items={data.laborRoles.map((role) => `${role.name} / ${formatCurrency(role.hourlyRate, role.currency)} / ${role.note || "備考なし"}`)}
            />
          </form>

          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!equipmentForm.name.trim()) return
              addEquipment({ ...equipmentForm })
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
                  onValueChange={(next) => setEquipmentForm((prev) => ({ ...prev, acquisitionCost: next === "" ? 0 : next }))}
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
                placeholder="例: リース"
                value={equipmentForm.note}
                onChange={(event) => setEquipmentForm((prev) => ({ ...prev, note: event.target.value }))}
              />
            </div>
            <Button type="submit" size="sm">
              設備を追加
            </Button>

            <RegisteredList
              title="登録済み 設備"
              items={data.equipments.map((equipment) => `${equipment.name} / ${formatCurrency(equipment.acquisitionCost, equipment.currency)} / ${equipment.amortizationYears}年`)}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
