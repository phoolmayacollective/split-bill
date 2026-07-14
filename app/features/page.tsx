import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  Camera,
  HandCoins,
  Lock,
  Search,
  Share2,
  Split,
  UtensilsCrossed,
  Users,
} from "lucide-react";

import { AppPageHeader } from "@/components/layout/app-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How it works — Split Bill",
  description:
    "Scan or type a bill, share a link, and let friends claim what they owe — with encrypted payment details, QR sharing, and restaurant menus.",
};

type FeatureSection = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  lead: string;
  body: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

const SECTIONS: FeatureSection[] = [
  {
    id: "create",
    icon: UtensilsCrossed,
    title: "Build the bill in minutes",
    lead: "Type line items, tax, and tip — or scan a receipt — then invite everyone who was at the table.",
    body: "Start from scratch, photograph a receipt, or pick dishes from a restaurant menu. Name your friends on the roster so each person can find themselves when they open the link. Signed-in payers can quick-add people from their saved circle. Totals update as you go, so you know the full amount before sharing.",
    image: {
      src: "/features/create-bill.png",
      alt: "Manual bill form with momo, tax, tip, and a participant roster",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "scan",
    icon: Camera,
    title: "Scan a receipt",
    lead: "Photograph or upload a receipt — line items are read for you to review and fix.",
    body: "Take a photo on your phone or upload an image from your gallery. The receipt stays on your device while text is extracted; only the text is sent to structure items, tax, and tip. Review every line before continuing — scans can miss prices or names. A tax-inclusive toggle handles receipts where VAT is already baked into item prices.",
    image: {
      src: "/features/scan-receipt.png",
      alt: "Receipt scan review with editable line items and tax inclusive toggle",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "payment",
    icon: Lock,
    title: "Payment details stay encrypted",
    lead: "Your PayPal or bank info is locked before it ever leaves your browser.",
    body: "Split Bill uses client-side encryption. The server stores ciphertext only — your payment details are decrypted on each friend's phone after they claim their share. You choose a bill password; friends need it from the link (or a separate message) to unlock how to pay you.",
    image: {
      src: "/features/payment.png",
      alt: "Payment step with PayPal field and encryption notice",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "share",
    icon: Share2,
    title: "One link for everyone",
    lead: "Copy the share link, use native share, or show a QR code — no app install required.",
    body: "Send the ower link in your group chat. Each friend opens it on their phone, picks their name, and walks through a short flow. Prefer not to put the password in the link? Toggle separate-password mode and send the password in another message. You keep a payer dashboard to track who has claimed and who has paid.",
    image: {
      src: "/features/share.png",
      alt: "Share screen with copy link, QR code, and password options",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "claim",
    icon: Split,
    title: "Claim items, split shared dishes",
    lead: "Check what you ate — and split a plate with the people who shared it.",
    body: "Shared appetizers are common at group dinners. Tap an item to claim it, then choose how many people split the cost. Tax and tip scale to what each person claimed, so nobody overpays for food they did not touch.",
    image: {
      src: "/features/ower-claim.png",
      alt: "Ower claiming momo and splitting it two ways",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "summary",
    icon: HandCoins,
    title: "See exactly what you owe",
    lead: "A clear breakdown and one-tap copy for payment details.",
    body: "After claiming, each person sees their subtotal, share of tax and tip, and the total to send. Payment info decrypts locally — copy PayPal or use native share on mobile when available.",
    image: {
      src: "/features/ower-summary.png",
      alt: "Ower summary with total owed and decrypted PayPal details",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "track",
    icon: Users,
    title: "Track collection from your dashboard",
    lead: "Per-item progress bars, mark-paid when the money lands, and an optional account to find bills again.",
    body: "The payer dashboard shows who has claimed each dish and how many people have paid. Mark someone paid when you receive their transfer, or let them tap \"I've paid\" on their summary to notify you. Progress bars make it obvious what is still outstanding. Optionally save a username after sharing — sign in later at your dashboard to reopen linked bills and manage your circle of frequent split partners.",
    image: {
      src: "/features/payer-dashboard.png",
      alt: "Payer dashboard with item progress and participant payment status",
      width: 780,
      height: 1688,
    },
  },
  {
    id: "restaurant",
    icon: Search,
    title: "Restaurant menus built in",
    lead: "Search a menu with fuzzy matching — type scattered letters to find momo.",
    body: "For partner restaurants like Dal Bhat, pick dishes from a searchable menu instead of typing prices by hand. Quantities and totals roll up automatically so you can move straight to payment and sharing.",
    image: {
      src: "/features/dalbhat.png",
      alt: "Dal Bhat menu with fuzzy search for momo",
      width: 780,
      height: 1688,
    },
  },
];

export default function FeaturesPage() {
  return (
    <PageShell wide className="pb-12">
      <AppPageHeader
        title="How Split Bill works"
        description={
          <>
            A shared dinner should not end in spreadsheet math. Split Bill walks
            your group from receipt to settled — create once, share a link, and
            let everyone claim what they owe.
          </>
        }
      />

      <SectionCard highlight className="overflow-hidden p-0">
        <div className="bg-muted/30 p-4 sm:p-5">
          <p className="text-sm font-medium">The whole flow in one glance</p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Landing → type or scan items → encrypt payment → share → friends
            claim → get paid.
          </p>
        </div>
        <Image
          src="/features/landing.png"
          alt="Split Bill home screen with create, scan receipt, and open bill options"
          width={780}
          height={1688}
          className="border-border/60 w-full border-t"
          priority
        />
      </SectionCard>

      <ol className="space-y-10">
        {SECTIONS.map((section, index) => (
          <li key={section.id} id={section.id}>
            <SectionCard className="overflow-hidden p-0">
              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                      <section.icon
                        className="text-primary size-5 shrink-0"
                        aria-hidden
                      />
                      {section.title}
                    </h2>
                    <p className="text-foreground/90 leading-relaxed">
                      {section.lead}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {section.body}
                    </p>
                  </div>
                </div>
              </div>
              <Image
                src={section.image.src}
                alt={section.image.alt}
                width={section.image.width}
                height={section.image.height}
                className="border-border/60 w-full border-t"
              />
            </SectionCard>
          </li>
        ))}
      </ol>

      <SectionCard className="text-center">
        <h2 className="text-lg font-semibold">Ready to split your next bill?</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          No account required. Create a bill and share the link in under a
          minute.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/create/manual"
            className={cn(buttonVariants({ size: "lg" }), "shadow-card w-full sm:w-auto")}
          >
            Create a bill
          </Link>
          <Link
            href="/create/scan"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            Scan a receipt
          </Link>
          <Link
            href="/restaurant/dalbhat"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            Dal Bhat menu
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
}
