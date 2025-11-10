import type { AppData } from "./types"

export function formatCurrency(value: number, currency = "JPY") {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(isFinite(value) ? value : 0)
}

export function calculateProductUnitCosts(productId: string, data: AppData) {
  const product = data.products.find((p) => p.id === productId)
  const quantity = product?.expectedProduction.quantity || 1

  const material = data.costEntries.materials
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => sum + entry.costPerUnit, 0)

  const packaging = data.costEntries.packaging
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => sum + entry.quantity * entry.costPerUnit, 0)

  const labor = data.costEntries.labor
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => {
      const role = data.laborRoles.find((r) => r.id === entry.laborRoleId)
      const hourlyRate = entry.hourlyRateOverride ?? role?.hourlyRate ?? 0
      return sum + hourlyRate * entry.hours * entry.peopleCount
    }, 0)

  const outsourcing = data.costEntries.outsourcing
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => sum + entry.costPerUnit, 0)

  const development = data.costEntries.development
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => {
      const total = entry.prototypeLaborCost + entry.prototypeMaterialCost + entry.toolingCost
      const amortized = total / Math.max(entry.amortizationYears || 1, 1)
      return sum + amortized / Math.max(quantity, 1)
    }, 0)

  const equipment = data.costEntries.equipmentAllocations
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => {
      const equipment = data.equipments.find((eq) => eq.id === entry.equipmentId)
      if (!equipment) return sum
      const annualCost = equipment.acquisitionCost / Math.max(equipment.amortizationYears || 1, 1)
      return sum + (annualCost * entry.allocationRatio) / Math.max(entry.annualQuantity || quantity, 1)
    }, 0)

  const logistics = data.costEntries.logistics
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => sum + entry.costPerUnit, 0)

  const electricity = data.costEntries.electricity
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => sum + entry.costPerUnit, 0)

  const total =
    material +
    packaging +
    labor +
    outsourcing +
    development +
    equipment +
    logistics +
    electricity

  return {
    material,
    packaging,
    labor,
    outsourcing,
    development,
    equipment,
    logistics,
    electricity,
    total,
  }
}
