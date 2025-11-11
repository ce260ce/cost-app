"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function HintList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <li key={`hint-${index}`}>{item}</li>
      ))}
    </ul>
  )
}

export function SectionHeader({
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

export function DraftCard({ children, onRemove, hideRemove }: { children: ReactNode; onRemove?: () => void; hideRemove?: boolean }) {
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

export function RegisteredList({ title, items }: { title: string; items: string[] }) {
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

export function CostDisplay({
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
