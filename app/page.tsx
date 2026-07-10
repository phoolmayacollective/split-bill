import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Split Bill</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Split a shared bill in minutes. No sign-up — just create, share,
            and claim what you owe.
          </p>
        </div>

        <Link
          href="/create"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Create a bill
        </Link>
      </main>
    </div>
  );
}
