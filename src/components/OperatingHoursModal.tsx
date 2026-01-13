"use client"

import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type DayHours =
  | { closed: true }
  | { closed: false; open: string; close: string };

type HoursMap = Record<DayKey, DayHours>;

const DAYS: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "17:00";

export default function OperatingHoursModal({
  initialHours,
  onSave,
  triggerLabel = "Edit Operating Hours",
  disabled = false,
}: {
  initialHours?: Partial<Record<string, any>>;
  onSave?: (hours: HoursMap) => void;
  triggerLabel?: string;
  disabled?: boolean;
}) {
  const makeInitial = (): HoursMap => {
    const base: any = {};
    for (const d of DAYS) {
      const incoming = initialHours?.[d];
      if (!incoming) {
        base[d] = { closed: false, open: DEFAULT_OPEN, close: DEFAULT_CLOSE };
      } else if (incoming.closed) {
        base[d] = { closed: true };
      } else {
        base[d] = {
          closed: false,
          open: incoming.open || DEFAULT_OPEN,
          close: incoming.close || DEFAULT_CLOSE,
        };
      }
    }
    return base as HoursMap;
  };

  const [hours, setHours] = useState<HoursMap>(makeInitial());
  const [openState, setOpenState] = useState(false);
  const [saving, setSaving] = useState(false);

  const setDayClosed = (day: DayKey, closed: boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: closed ? { closed: true } : { closed: false, open: DEFAULT_OPEN, close: DEFAULT_CLOSE },
    }));
  };

  const setDayTime = (day: DayKey, which: "open" | "close", value: string) => {
    setHours((prev) => {
      const current = prev[day];
      if ((current as any).closed) return prev;
      return { ...prev, [day]: { closed: false, open: which === "open" ? value : (current as any).open, close: which === "close" ? value : (current as any).close } };
    });
  };

  const validate = (): { ok: boolean; problems: string[] } => {
    const problems: string[] = [];
    for (const d of DAYS) {
      const v = hours[d];
      if ((v as any).closed) continue;
      const open = (v as any).open;
      const close = (v as any).close;
      if (!open || !close) {
        problems.push(`${d}: open/close required`);
        continue;
      }
      if (open >= close) {
        problems.push(`${d}: open must be before close`);
      }
    }
    return { ok: problems.length === 0, problems };
  };

  const handleSave = async () => {
    const v = validate();
    if (!v.ok) {
      toast.error("Please fix operating hours: " + v.problems.join("; "));
      return;
    }
    setSaving(true);
    try {
      // Callback to parent
      if (onSave) onSave(hours);
      toast.success("Operating hours saved");
      setOpenState(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save operating hours");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={openState} onOpenChange={setOpenState} >
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>{triggerLabel}</Button>
      </DialogTrigger>
<DialogContent className="max-w-full">
        <DialogHeader>
          <DialogTitle>Operating Hours</DialogTitle>
          <DialogDescription>Set your business hours for each day. Mark a day as closed to disable times.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 sm:max-h-[50vh] max-h-[40vh] overflow-y-auto overflow-x-hidden pb-4">
          <div className="space-y-4">
            {DAYS.map((day) => {
              const v = hours[day] as DayHours;
              const closed = (v as any).closed === true;
              const openVal = !closed ? (v as any).open : DEFAULT_OPEN;
              const closeVal = !closed ? (v as any).close : DEFAULT_CLOSE;
              return (
                <div key={day} className="grid grid-cols-1 gap-2 items-center border-b pb-3">
                  <div>
                    <Label className="font-medium">{day}</Label>
                  </div>

                <div className="space-y-2 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
                    {/* Time inputs */}
<div className="flex items-center gap-2">
  <Input
    type="time"
    value={openVal}
    onChange={(e) => setDayTime(day, "open", e.target.value)}
    disabled={closed}
    className="w-full sm:w-32"
  />
  <span className="text-sm">to</span>
  <Input
    type="time"
    value={closeVal}
    onChange={(e) => setDayTime(day, "close", e.target.value)}
    disabled={closed}
    className="w-full sm:w-32"
  />
</div>

{/* Closed toggle */}
<div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
  <Label className="text-sm">Closed</Label>
  <Switch
    checked={closed}
    onCheckedChange={(c) => setDayClosed(day, Boolean(c))}
    aria-label={`${day} closed`}
  />
</div>
                  </div>
                
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpenState(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[#1E392A] hover:bg-[#1E392A]/90" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
