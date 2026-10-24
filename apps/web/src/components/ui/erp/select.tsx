"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  Fragment,
  isValidElement,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: ReactNode; disabled?: boolean };
export function selectOptions(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap((child): Option[] => {
    if (
      !isValidElement<{
        value?: string | number;
        children?: ReactNode;
        disabled?: boolean;
      }>(child)
    )
      return [];
    if (child.type === Fragment || child.type === "optgroup")
      return selectOptions(child.props.children);
    if (child.type !== "option") return [];
    return [
      {
        value: String(child.props.value ?? child.props.children ?? ""),
        label: child.props.children,
        disabled: child.props.disabled,
      },
    ];
  });
}

/** Shared select retaining existing native onChange callers during the ERP migration. */
export function ErpSelect({
  children,
  className,
  value,
  defaultValue,
  disabled,
  required,
  name,
  form,
  id,
  autoComplete,
  onChange,
  ...props
}: Omit<ComponentProps<"select">, "multiple" | "size">) {
  const nativeRef = useRef<HTMLSelectElement>(null);
  const options = selectOptions(children);
  const selected = value === undefined ? undefined : String(value);
  const initial =
    defaultValue === undefined ? options[0]?.value : String(defaultValue);
  return (
    <Select.Root
      value={selected}
      defaultValue={initial}
      disabled={disabled}
      required={required}
      name={name}
      form={form}
      autoComplete={autoComplete}
      items={options}
      onValueChange={(next) => {
        const native = nativeRef.current;
        if (!native || next === null) return;
        native.value = String(next);
        native.dispatchEvent(new Event("change", { bubbles: true }));
      }}
    >
      <Select.Trigger
        id={id}
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        aria-invalid={props["aria-invalid"]}
        title={props.title}
        className={cn(
          "inline-flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <Select.Value className="min-w-0 truncate" />
        <Select.Icon>
          <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <select
        ref={nativeRef}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        hidden
      >
        {children}
      </select>
      <Select.Portal>
        <Select.Positioner
          align="start"
          sideOffset={4}
          alignItemWithTrigger={false}
          className="isolate z-[10000]"
        >
          <Select.Popup className="max-h-[var(--available-height)] min-w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] origin-[var(--transform-origin)] overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[opacity,transform] duration-100 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-3 pl-8 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <Select.ItemIndicator className="absolute left-2">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
