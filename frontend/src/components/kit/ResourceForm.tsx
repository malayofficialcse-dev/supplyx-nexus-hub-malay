import * as React from "react";
import { Field, Input, Select, Textarea } from "./Input";
import { ItemsEditor, emptyItem, itemsTotal, type LineItem } from "./ItemsEditor";

export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "select"
  | "date"
  | "textarea"
  | "items";

export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType | undefined;
  options?: string[] | undefined;
  required?: boolean | undefined;
  hint?: string | undefined;
  placeholder?: string | undefined;
  defaultValue?: unknown | undefined;
  full?: boolean | undefined;
  /** Hide the field when editing an existing record. */
  createOnly?: boolean | undefined;
}

export type FormValues = Record<string, unknown>;

export function initialValues(fields: FieldDef[], record?: FormValues | null): FormValues {
  const out: FormValues = {};
  for (const f of fields) {
    const existing = record ? record[f.name] : undefined;
    if (f.type === "items") {
      const parsed = coerceItems(existing);
      out[f.name] = parsed.length ? parsed : [emptyItem()];
    } else if (existing !== undefined && existing !== null) {
      out[f.name] = existing;
    } else if (f.defaultValue !== undefined) {
      out[f.name] = f.defaultValue;
    } else if (f.type === "select") {
      out[f.name] = f.options?.[0] ?? "";
    } else if (f.type === "number" || f.type === "currency") {
      out[f.name] = "";
    } else {
      out[f.name] = "";
    }
  }
  return out;
}

export function coerceItems(value: unknown): LineItem[] {
  if (Array.isArray(value)) {
    return value.map((raw) => {
      const o = (raw ?? {}) as Record<string, unknown>;
      return {
        item: String(o['item'] ?? o['name'] ?? o['description'] ?? ""),
        unit: String(o['unit'] ?? "EA"),
        quantity: Number(o['quantity'] ?? o['qty'] ?? 0),
        unitPrice: Number(o['unitPrice'] ?? o['price'] ?? o['rate'] ?? 0),
      };
    });
  }
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      return coerceItems(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

export function validate(fields: FieldDef[], values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (!f.required) continue;
    const v = values[f.name];
    if (f.type === "items") {
      const items = (v as LineItem[]) ?? [];
      if (!items.length || items.every((i) => !i.item.trim())) {
        errors[f.name] = "Add at least one line item.";
      }
    } else if (v === "" || v === null || v === undefined) {
      errors[f.name] = `${f.label} is required.`;
    }
  }
  return errors;
}

export function buildPayload(fields: FieldDef[], values: FormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === "items") {
      const items = ((v as LineItem[]) ?? []).filter((i) => i.item.trim());
      payload[f.name] = items;
      continue;
    }
    if (f.type === "number" || f.type === "currency") {
      payload[f.name] = v === "" || v === null || v === undefined ? 0 : Number(v);
      continue;
    }
    payload[f.name] = v;
  }
  return payload;
}

export function itemsSum(values: FormValues, key = "items"): number {
  return itemsTotal((values[key] as LineItem[]) ?? []);
}

export function ResourceForm({
  fields,
  values,
  errors,
  onChange,
  isEdit,
}: {
  fields: FieldDef[];
  values: FormValues;
  errors: Record<string, string>;
  onChange: (name: string, value: unknown) => void;
  isEdit?: boolean | undefined;
}) {
  const visible = fields.filter((f) => !(isEdit && f.createOnly));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {visible.map((f) => {
        const type = f.type ?? "text";
        const full = f.full || type === "items" || type === "textarea";
        return (
          <Field
            key={f.name}
            label={f.label}
            required={f.required}
            hint={f.hint}
            error={errors[f.name]}
            className={full ? "sm:col-span-2" : undefined}
          >
            {type === "items" ? (
              <ItemsEditor
                value={(values[f.name] as LineItem[]) ?? []}
                onChange={(items) => onChange(f.name, items)}
              />
            ) : type === "select" ? (
              <Select
                value={String(values[f.name] ?? "")}
                onChange={(e) => onChange(f.name, e.target.value)}
              >
                <option value="">Select…</option>
                {(f.options ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            ) : type === "textarea" ? (
              <Textarea
                value={String(values[f.name] ?? "")}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.name, e.target.value)}
              />
            ) : (
              <Input
                type={type === "number" || type === "currency" ? "number" : type === "date" ? "date" : "text"}
                step={type === "currency" ? "0.01" : type === "number" ? "any" : undefined}
                value={String(values[f.name] ?? "")}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.name, e.target.value)}
              />
            )}
          </Field>
        );
      })}
    </div>
  );
}
