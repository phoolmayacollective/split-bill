import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split Bill",
  description: "No-signup bill splitter — create, share, and claim what you owe.",
};

export default function CreatePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Create a bill</h1>
        <p className="text-muted-foreground">
          Bill creation flow coming in the next milestone.
        </p>
      </main>
    </div>
  );
}
