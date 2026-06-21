"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/server/actions/newsletter";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Subscribe"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
    >
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeNewsletter, null);

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
    else if (state && !state.ok) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex gap-2">
      <Input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        aria-label="Email address"
      />
      <SubmitButton />
    </form>
  );
}
