"use client"

import { Dispatch, SetStateAction } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/ui/number-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { AppData, Product } from "@/lib/types"

interface ProductBasicsSectionProps {
  data: AppData
  productForm: Omit<Product, "id">
  setProductForm: Dispatch<SetStateAction<Omit<Product, "id">>>
  handleToggleEquipment: (equipmentId: string, checked: boolean) => void
}

export function ProductBasicsSection({ data, productForm, setProductForm, handleToggleEquipment }: ProductBasicsSectionProps) {
  const largeOptions = data.categories.large
  const mediumOptions = data.categories.medium.filter((m) => !productForm.categoryLargeId || m.largeId === productForm.categoryLargeId)
  const smallOptions = data.categories.small.filter((s) => !productForm.categoryMediumId || s.mediumId === productForm.categoryMediumId)

  return (
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
  )
}
