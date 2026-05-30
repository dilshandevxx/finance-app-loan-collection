import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCustomers, getSystemVillages, getVillageSchedule } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import VillagesClientManager from "./VillagesClientManager";
import VillageScheduleManager from "./VillageScheduleManager";

export const dynamic = 'force-dynamic';

export default async function VillagesPage() {
  const [customers, villages, schedule] = await Promise.all([
    getCustomers(),
    getSystemVillages(),
    getVillageSchedule()
  ]);

  // Compute client counts per village
  const villageStats = villages.map(v => {
    const count = customers.filter(c => c.state?.trim().toLowerCase() === v.trim().toLowerCase()).length;
    return { name: v, clientCount: count };
  });

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-32 md:pb-12 max-w-4xl mx-auto px-2 sm:px-4 pt-2 sm:pt-4 min-h-screen">
      {/* Header */}
      <header className="w-full flex items-center justify-between bg-card p-4 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-2">
        <Link href="/settings">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-secondary transition-colors shadow-sm cursor-pointer relative z-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-sm font-semibold tracking-tight text-foreground">Manage Route Villages</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
          Settings
        </span>
      </header>

      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-4 sm:p-8">
            <VillagesClientManager initialStats={villageStats} />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm mt-4">
          <CardContent className="p-4 sm:p-8">
            <VillageScheduleManager availableVillages={villages} initialSchedule={schedule} />
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
