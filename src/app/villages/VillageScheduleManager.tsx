"use client";

import { useState, useTransition } from "react";
import { saveVillageSchedule } from "@/app/actions";
import { Loader2, Calendar, MapPin, Check } from "lucide-react";
import { VillageSchedule, defaultVillageSchedule } from "@/lib/schedule";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Props {
  availableVillages: string[];
  initialSchedule: VillageSchedule;
}

export default function VillageScheduleManager({ availableVillages, initialSchedule }: Props) {
  const [schedule, setSchedule] = useState<VillageSchedule>(initialSchedule || defaultVillageSchedule);
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState("");

  const toggleVillage = (day: string, village: string) => {
    setSchedule(prev => {
      const dayVillages = prev[day] || [];
      const newVillages = dayVillages.includes(village)
        ? dayVillages.filter(v => v !== village)
        : [...dayVillages, village];
      return { ...prev, [day]: newVillages };
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      setSaveMessage("");
      const res = await saveVillageSchedule(schedule);
      if (res.success) {
        setSaveMessage("Schedule saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage(res.error || "Failed to save schedule.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Weekly Route Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">Assign villages to days of the week.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
          {isPending ? "Saving..." : "Save Schedule"}
        </button>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm font-medium ${saveMessage.includes("success") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="border border-border bg-card/50 rounded-2xl p-5 hover:bg-card/80 transition-colors">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary/50"></span>
              {day}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {availableVillages.length === 0 ? (
                <span className="text-xs text-muted-foreground">No villages added yet.</span>
              ) : (
                availableVillages.map(village => {
                  const isSelected = schedule[day]?.includes(village);
                  return (
                    <button
                      key={village}
                      onClick={() => toggleVillage(day, village)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {village}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
