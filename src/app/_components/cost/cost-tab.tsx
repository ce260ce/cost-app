"use client"

import { useMemo } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AppData, Equipment, Material } from "@/lib/types"
import { calculateProductUnitCosts, formatCurrency } from "@/lib/calculations"
import { CostDisplay } from "../shared/ui"

interface CostTabProps {
  data: AppData
}

export function CostTab({ data }: CostTabProps) {
  const shippingMethods = data.shippingMethods ?? []

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

  return (
    <div className="space-y-6">
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
                            const hoursText = entry.usageHours !== undefined ? `${entry.usageHours.toFixed(2)}h` : "-"
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

    </div>
  )
}
