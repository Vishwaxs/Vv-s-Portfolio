"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { uploadResume } from "@/app/admin/resume-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ResumeUploader() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await uploadResume(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        formRef.current?.reset();
        router.refresh();
      }
    });
  };

  return (
    <form
      ref={formRef}
      action={submit}
      className="flex flex-wrap items-end gap-4 rounded-card border border-line bg-surface-1 p-5"
    >
      <div className="min-w-48 flex-1">
        <Input name="title" label="Title" placeholder="SDE Intern 2026" required />
      </div>
      <div className="min-w-48 flex-1">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-secondary">
            PDF (max 10 MB)
          </span>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            required
            className="block w-full text-sm text-ink-secondary file:mr-3 file:rounded-full file:border-0 file:bg-accent-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-500"
          />
        </label>
      </div>
      <Button type="submit" disabled={pending}>
        <Upload size={16} /> {pending ? "Uploading…" : "Upload"}
      </Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}
