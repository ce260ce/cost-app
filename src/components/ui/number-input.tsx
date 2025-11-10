import * as React from "react"

import { Input } from "./input"

export type NumberInputValue = number | ""

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "value" | "defaultValue" | "onChange"> & {
  value: NumberInputValue
  onValueChange: (value: NumberInputValue) => void
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onValueChange, ...props },
  ref
) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value
      if (raw === "") {
        onValueChange("")
        return
      }
      const parsed = Number(raw)
      if (Number.isNaN(parsed)) return
      onValueChange(parsed)
    },
    [onValueChange]
  )

  return (
    <Input
      {...props}
      ref={ref}
      type="number"
      inputMode="decimal"
      value={value === "" ? "" : value}
      onChange={handleChange}
    />
  )
})

export { NumberInput }
