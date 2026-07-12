"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeParticipants } from "@/lib/participants";

type ParticipantListEditorProps = {
  participants: string[];
  onChange: (participants: string[]) => void;
  /** Registered usernames from the signed-in payer's circle */
  circleMembers?: string[];
};

export function ParticipantListEditor({
  participants,
  onChange,
  circleMembers = [],
}: ParticipantListEditorProps) {
  const [draft, setDraft] = useState("");

  const availableCircleMembers = circleMembers.filter(
    (name) =>
      !participants.some(
        (participant) => participant.toLowerCase() === name.toLowerCase(),
      ),
  );

  function addParticipant(name?: string) {
    const nextName = name ?? draft;
    const next = normalizeParticipants([...participants, nextName]);
    if (next.length === participants.length) {
      setDraft("");
      return;
    }
    onChange(next);
    setDraft("");
  }

  function removeParticipant(index: number) {
    onChange(participants.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <SectionCard
      title="Who's splitting?"
      description="Optional — add names so friends can pick themselves instead of typing."
    >
      {participants.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {participants.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="bg-background inline-flex items-center gap-1 rounded-full border py-1 pr-1 pl-3 text-sm font-medium"
            >
              {name}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${name}`}
                onClick={() => removeParticipant(index)}
                className="size-7 rounded-full"
              >
                <X className="size-3.5" />
              </Button>
            </span>
          ))}
        </div>
      ) : null}

      {availableCircleMembers.length > 0 ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Quick add from your circle
          </p>
          <div className="flex flex-wrap gap-2">
            {availableCircleMembers.map((name) => (
              <Button
                key={name}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => addParticipant(name)}
              >
                <Plus />
                {name}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="participant-name" className="sr-only">
            Participant name
          </Label>
          <Input
            id="participant-name"
            placeholder="e.g. Alex"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addParticipant();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-auto shrink-0"
          onClick={() => addParticipant()}
          disabled={!draft.trim()}
        >
          <Plus />
          Add
        </Button>
      </div>
    </SectionCard>
  );
}
