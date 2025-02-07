import * as React from "react"
import { X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Option = {
  label: string
  value: string
}

type MultiSelectProps = {
  options: Option[]
  selected: string[] | string | undefined
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({ options, selected, onChange, placeholder, className, disabled }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Ensure selected is always an array
  const selectedArray = React.useMemo(() => {
    if (Array.isArray(selected)) return selected
    if (typeof selected === "string") return [selected]
    return []
  }, [selected])

  const handleUnselect = (item: string) => {
    onChange(selectedArray.filter((i) => i !== item))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${selectedArray.length > 0 ? "h-full" : "h-10"}`}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {selectedArray.length > 0 ? (
              selectedArray.map((item) => (
                <Badge variant="secondary" key={item} className="mr-1 mb-1">
                  {item}
                  {!disabled && (
                    <Button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(item)
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnselect(item)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-full p-0">
          <Command className={className}>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(
                      selectedArray.includes(option.value)
                        ? selectedArray.filter((item) => item !== option.value)
                        : [...selectedArray, option.value],
                    )
                    setOpen(true)
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedArray.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <svg
                      className={cn("h-4 w-4")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  )
}

