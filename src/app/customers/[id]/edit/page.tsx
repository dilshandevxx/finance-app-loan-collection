import Link from "next/link";
import { ChevronLeft, UserCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EditCustomerForm } from "@/components/EditCustomerForm";
import { getCustomerById, getSystemVillages } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";

export const dynamic = 'force-dynamic';

export default async function EditCustomer({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const customerId = resolvedParams.id;
  const [customer, villages] = await Promise.all([
    getCustomerById(customerId),
    getSystemVillages()
  ]);

  if (!customer) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-white/50">
        Customer not found
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-32 md:pb-12 max-w-5xl mx-auto px-2 sm:px-4">
      <TopBar title="Edit Profile" backHref={`/customers/${customer.id}`} />

      <div className="max-w-2xl mx-auto w-full">
        <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-4 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1 mb-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-primary" />
                Update Profile
              </h3>
              <p className="text-xs text-muted-foreground">
                Modify details for {customer.name}
              </p>
            </div>
            
            <EditCustomerForm customer={customer} villages={villages} />
          </CardContent>
        </Card>
      </div>
      <BottomNav hideOnMobile />
    </div>
  );
}
