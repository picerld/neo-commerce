import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("flex flex-col gap-5", className)} {...props} />;
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn(className)} {...props} />;
}

function FieldError({ errors, className }: { errors?: Array<string | { message?: string } | undefined>; className?: string }) {
  const messages = (errors ?? [])
    .map((e) => (typeof e === "string" ? e : e?.message))
    .filter((m): m is string => !!m);
  if (messages.length === 0) return null;
  return (
    <p data-slot="field-error" className={cn("text-xs font-medium text-destructive", className)}>
      {messages[0]}
    </p>
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-description" className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

export { FieldGroup, Field, FieldLabel, FieldError, FieldDescription };
