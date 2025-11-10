"use client"

import { startTransition, useCallback, useEffect, useState } from "react"

import {
  AppData,
  CategoryLarge,
  CategoryMedium,
  CategorySmall,
  defaultAppData,
  DevelopmentCostEntry,
  ElectricityCostEntry,
  Equipment,
  EquipmentAllocationEntry,
  LaborRole,
  LaborCostEntry,
  LogisticsCostEntry,
  Material,
  MaterialCostEntry,
  OutsourcingCostEntry,
  PackagingCostEntry,
  PackagingItem,
  Product,
  emptyAppData,
  sampleAppData,
} from "./types"

const STORAGE_KEY = "cost-app-data-v1"

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11)

type Updater<T> = (state: T) => T

const apply = <T,>(set: React.Dispatch<React.SetStateAction<T>>, updater: Updater<T>) => {
  set(updater)
}

export function useAppData() {
  const [data, setData] = useState<AppData>(defaultAppData)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AppData
        startTransition(() => {
          setData(parsed)
        })
      } catch (error) {
        console.warn("Failed to parse stored data", error)
      }
    }
    startTransition(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data, hydrated])

  const update = useCallback(
    (updater: Updater<AppData>) => {
      apply(setData, updater)
    },
    [setData]
  )

  const addLargeCategory = useCallback((input: Omit<CategoryLarge, "id">) => {
    update((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        large: [...prev.categories.large, { id: createId(), ...input }],
      },
    }))
  }, [update])

  const addMediumCategory = useCallback(
    (input: Omit<CategoryMedium, "id">) => {
      update((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          medium: [...prev.categories.medium, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addSmallCategory = useCallback(
    (input: Omit<CategorySmall, "id">) => {
      update((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          small: [...prev.categories.small, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addMaterial = useCallback(
    (input: Omit<Material, "id">) => {
      update((prev) => ({ ...prev, materials: [...prev.materials, { id: createId(), ...input }] }))
    },
    [update]
  )

  const addPackagingItem = useCallback(
    (input: Omit<PackagingItem, "id">) => {
      update((prev) => ({
        ...prev,
        packagingItems: [...prev.packagingItems, { id: createId(), ...input }],
      }))
    },
    [update]
  )

  const addLaborRole = useCallback(
    (input: Omit<LaborRole, "id">) => {
      update((prev) => ({ ...prev, laborRoles: [...prev.laborRoles, { id: createId(), ...input }] }))
    },
    [update]
  )

  const addEquipment = useCallback(
    (input: Omit<Equipment, "id">) => {
      update((prev) => ({ ...prev, equipments: [...prev.equipments, { id: createId(), ...input }] }))
    },
    [update]
  )

  const addProduct = useCallback(
    (input: Omit<Product, "id">) => {
      update((prev) => ({ ...prev, products: [...prev.products, { id: createId(), ...input }] }))
    },
    [update]
  )

  const addMaterialCostEntry = useCallback(
    (input: Omit<MaterialCostEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          materials: [...prev.costEntries.materials, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addPackagingCostEntry = useCallback(
    (input: Omit<PackagingCostEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          packaging: [...prev.costEntries.packaging, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addLaborCostEntry = useCallback(
    (input: Omit<LaborCostEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          labor: [...prev.costEntries.labor, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addOutsourcingCostEntry = useCallback(
    (input: Omit<OutsourcingCostEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          outsourcing: [...prev.costEntries.outsourcing, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addDevelopmentCostEntry = useCallback(
    (input: Omit<DevelopmentCostEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          development: [...prev.costEntries.development, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addEquipmentAllocation = useCallback(
    (input: Omit<EquipmentAllocationEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          equipmentAllocations: [
            ...prev.costEntries.equipmentAllocations,
            { id: createId(), ...input },
          ],
        },
      }))
    },
    [update]
  )

  const addLogisticsCostEntry = useCallback(
    (input: Omit<LogisticsCostEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          logistics: [...prev.costEntries.logistics, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const addElectricityCostEntry = useCallback(
    (input: Omit<ElectricityCostEntry, "id">) => {
      update((prev) => ({
        ...prev,
        costEntries: {
          ...prev.costEntries,
          electricity: [...prev.costEntries.electricity, { id: createId(), ...input }],
        },
      }))
    },
    [update]
  )

  const resetAll = useCallback(() => {
    update(() => emptyAppData)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [update])

  const seedSample = useCallback(() => {
    update(() => sampleAppData)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleAppData))
    }
  }, [update])

  return {
    data,
    hydrated,
    actions: {
      addLargeCategory,
      addMediumCategory,
      addSmallCategory,
      addMaterial,
      addPackagingItem,
      addLaborRole,
      addEquipment,
      addProduct,
      addMaterialCostEntry,
      addPackagingCostEntry,
      addLaborCostEntry,
      addOutsourcingCostEntry,
      addDevelopmentCostEntry,
      addEquipmentAllocation,
      addLogisticsCostEntry,
      addElectricityCostEntry,
      resetAll,
      seedSample,
    },
  }
}
