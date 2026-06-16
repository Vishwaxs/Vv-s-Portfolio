"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteEntity, saveEntity } from "@/app/admin/actions";
import type { EntityTable } from "@/lib/validation/entities";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export type FieldConfig = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "date"
    | "select"
    | "list" // newline-separated string[]
    | "json"; // object edited as JSON text
  options?: { value: string; label: string }[];
  help?: string;
};

type Row = Record<string, unknown> & { id: string };

function toFormValue(field: FieldConfig, raw: unknown): string | boolean {
  if (field.type === "checkbox") return Boolean(raw);
  if (raw === null || raw === undefined) return "";
  if (field.type === "list") return (raw as string[]).join("\n");
  if (field.type === "json") return JSON.stringify(raw, null, 2);
  return String(raw);
}

/** Config-driven CRUD table + form used by every admin entity page. */
export function EntityManager({
  table,
  rows,
  fields,
  listColumns,
  titleField,
  singleton = false,
}: {
  table: EntityTable;
  rows: Row[];
  fields: FieldConfig[];
  listColumns: string[];
  titleField: string;
  /** singleton entities (profile) skip the list and edit the only row */
  singleton?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | "new" | null>(
    singleton ? (rows[0] ?? "new") : null
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const initialValues = useMemo(() => {
    const source = editing && editing !== "new" ? editing : {};
    return Object.fromEntries(
      fields.map((f) => [f.name, toFormValue(f, (source as Row)[f.name])])
    );
  }, [editing, fields]);

  const [values, setValues] = useState<Record<string, string | boolean>>(initialValues);

  // re-seed form when target row changes
  const [editKey, setEditKey] = useState<string>("init");
  const currentKey = editing === "new" ? "new" : editing?.id ?? "none";
  if (editKey !== currentKey) {
    setEditKey(currentKey);
    setValues(initialValues);
    setError(null);
    setSaved(false);
  }

  const submit = () => {
    setError(null);
    setSaved(false);
    const payload: Record<string, unknown> = {};
    if (editing && editing !== "new") payload.id = editing.id;
    for (const f of fields) {
      const v = values[f.name];
      if (f.type === "json") {
        try {
          payload[f.name] = v ? JSON.parse(String(v)) : {};
        } catch {
          setError(`${f.label}: invalid JSON`);
          return;
        }
      } else if (f.type === "checkbox") {
        payload[f.name] = Boolean(v);
      } else {
        payload[f.name] = v;
      }
    }
    startTransition(async () => {
      const res = await saveEntity(table, payload);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSaved(true);
        if (!singleton) setEditing(null);
        router.refresh();
      }
    });
  };

  const remove = (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteEntity(table, id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  const showForm = editing !== null;

  return (
    <div className="space-y-6">
      {!singleton && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus size={15} /> Add
          </Button>
        </div>
      )}

      {!singleton && rows.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-1 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                {listColumns.map((c) => (
                  <th key={c} className="px-4 py-3 font-medium">
                    {fields.find((f) => f.name === c)?.label ?? c}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-1">
                  {listColumns.map((c) => (
                    <td key={c} className="max-w-60 truncate px-4 py-3 text-ink">
                      {typeof row[c] === "boolean" ? (
                        <Badge tone={row[c] ? "success" : "neutral"}>
                          {row[c] ? "yes" : "no"}
                        </Badge>
                      ) : Array.isArray(row[c]) ? (
                        (row[c] as unknown[]).length
                      ) : (
                        String(row[c] ?? "")
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(row)}
                        aria-label={`Edit ${String(row[titleField])}`}
                        className="rounded p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(row.id)}
                        aria-label={`Delete ${String(row[titleField])}`}
                        className="rounded p-1.5 text-ink-muted hover:bg-surface-2 hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!singleton && rows.length === 0 && !showForm && (
        <p className="py-8 text-center text-sm text-ink-muted">
          Nothing here yet — add the first entry.
        </p>
      )}

      {showForm && (
        <div className="rounded-card border border-line bg-surface-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink">
              {singleton
                ? "Edit"
                : editing === "new"
                  ? "New entry"
                  : `Edit: ${String((editing as Row)[titleField] ?? "")}`}
            </h2>
            {!singleton && (
              <button
                onClick={() => setEditing(null)}
                aria-label="Close form"
                className="rounded p-1.5 text-ink-muted hover:bg-surface-2"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
              const v = values[f.name];
              const set = (nv: string | boolean) =>
                setValues((prev) => ({ ...prev, [f.name]: nv }));
              const wide =
                f.type === "textarea" || f.type === "json" || f.type === "list";
              return (
                <div key={f.name} className={wide ? "sm:col-span-2" : undefined}>
                  {f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 pt-6 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={Boolean(v)}
                        onChange={(e) => set(e.target.checked)}
                        className="h-4 w-4 accent-accent-600"
                      />
                      {f.label}
                    </label>
                  ) : f.type === "select" ? (
                    <Select label={f.label} value={String(v)} onChange={(e) => set(e.target.value)}>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  ) : f.type === "textarea" || f.type === "json" || f.type === "list" ? (
                    <Textarea
                      label={f.label}
                      value={String(v)}
                      rows={f.type === "textarea" ? 5 : 3}
                      onChange={(e) => set(e.target.value)}
                    />
                  ) : (
                    <Input
                      label={f.label}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={String(v)}
                      onChange={(e) => set(e.target.value)}
                    />
                  )}
                  {f.help && <p className="mt-1 text-xs text-ink-muted">{f.help}</p>}
                </div>
              );
            })}
          </div>

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          {saved && <p className="mt-4 text-sm text-success">Saved.</p>}

          <div className="mt-6">
            <Button onClick={submit} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
