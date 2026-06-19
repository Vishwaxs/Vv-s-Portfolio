"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "rate_limited">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    setStatus("idle");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setStatus("sent");
      reset();
    } else {
      setStatus(res.status === 429 ? "rate_limited" : "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <Input label="Subject (optional)" error={errors.subject?.message} {...register("subject")} />
      <Textarea
        label="Message"
        rows={6}
        error={errors.message?.message}
        {...register("message")}
      />
      {/* honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("website")}
      />

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Send size={16} /> {isSubmitting ? "Sending…" : "Send message"}
        </Button>
        {status === "sent" && (
          <p className="text-sm text-success" role="status">
            Thanks — your message is in. I&apos;ll reply by email.
          </p>
        )}
        {status === "rate_limited" && (
          <p className="text-sm text-warning" role="alert">
            Too many messages from your network — please try again in an hour.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-danger" role="alert">
            Something went wrong. Email me directly instead.
          </p>
        )}
      </div>
    </form>
  );
}
