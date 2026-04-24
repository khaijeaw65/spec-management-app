"use client";

import { ComboBox, Input, Label, ListBox } from "@heroui/react";
import type { Key } from "react-aria-components";

import type { SpecFilterOption } from "@/types/spec-filters.types";

export type FilterComboBoxProps = {
  label: string;
  options: readonly SpecFilterOption[];
  placeholder: string;
  selectedKey: string;
  onSelect: (id: string) => void;
};

export function FilterComboBox({
  label,
  options,
  placeholder,
  selectedKey,
  onSelect,
}: Readonly<FilterComboBoxProps>) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <ComboBox.Root
        allowsCustomValue={false}
        fullWidth
        menuTrigger="input"
        selectedKey={selectedKey}
        variant="primary"
        onSelectionChange={(key: Key | null) => {
          if (key !== null) onSelect(String(key));
        }}
      >
        <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </Label>
        <ComboBox.InputGroup className="w-full min-w-0">
          <Input placeholder={placeholder} />
          <ComboBox.Trigger
            aria-label={`Open ${label} options`}
          />
        </ComboBox.InputGroup>
        <ComboBox.Popover className="min-w-(--trigger-width)">
          <ListBox>
            {options.map((opt) => (
              <ListBox.Item
                key={opt.id}
                id={opt.id}
                textValue={opt.label}
              >
                {opt.label}
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox.Root>
    </div>
  );
}
