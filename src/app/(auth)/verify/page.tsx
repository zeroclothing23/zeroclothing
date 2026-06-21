import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmail } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmail(token)
    : { ok: false, message: "No verification token provided." };

  return (
    <div className="space-y-5 text-center">
      {result.ok ? (
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
      ) : (
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
      )}
      <h1 className="font-display text-2xl font-semibold">
        {result.ok ? "Email Verified" : "Verification Failed"}
      </h1>
      <p className="text-sm text-muted-foreground">{result.message}</p>
      <Button asChild size="lg" className="w-full">
        <Link href="/login">Continue to Sign In</Link>
      </Button>
    </div>
  );
}
