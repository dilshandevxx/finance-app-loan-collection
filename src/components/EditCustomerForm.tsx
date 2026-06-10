"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { editCustomer, createSystemVillage } from "@/app/actions";
import { 
  User, 
  Hash, 
  Phone, 
  MapPin, 
  Building,
  CheckCircle2,
  AlertCircle,
  Check,
  ChevronDown,
  Camera
} from "lucide-react";
import { Customer } from "@/data/db";

type FormState = {
  error?: string;
  success?: boolean;
};

const initialState: FormState = {};

export function EditCustomerForm({ 
  customer, 
  villages 
}: { 
  customer: Customer; 
  villages: string[]; 
}) {
  // Bind customer.id to the action
  const editCustomerWithId = editCustomer.bind(null, customer.id);
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await editCustomerWithId(formData);
      return (result as FormState) ?? initialState;
    },
    initialState
  );

  const [clientName, setClientName] = useState(customer.name || "");
  const [phoneInput, setPhoneInput] = useState(customer.phone || "");
  const [memberId, setMemberId] = useState(customer.memberId || "");
  const [idNumber, setIdNumber] = useState(customer.idNumber || "");
  const [companyName, setCompanyName] = useState(customer.companyName || "");
  const [clientState, setClientState] = useState(customer.state || "");
  const [address, setAddress] = useState(customer.address || "");

  const [localVillages, setLocalVillages] = useState<string[]>(villages);

  // Modal state for adding a new village
  const [isAddVillageModalOpen, setIsAddVillageModalOpen] = useState(false);
  const [modalVillageName, setModalVillageName] = useState("");
  const [modalIsAdding, setModalIsAdding] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleModalAddVillage = async () => {
    const nameVal = modalVillageName.trim();
    if (!nameVal) return;

    if (localVillages.map(v => v.toLowerCase()).includes(nameVal.toLowerCase())) {
      setModalError("Village already exists.");
      return;
    }

    setModalIsAdding(true);
    setModalError(null);
    try {
      const res = await createSystemVillage(nameVal);
      if (res.success) {
        setLocalVillages(prev => [...prev, nameVal].sort());
        setClientState(nameVal);
        setModalVillageName("");
        setIsAddVillageModalOpen(false);
      } else {
        setModalError(res.error || "Failed to add village.");
      }
    } catch (err) {
      setModalError("An unexpected error occurred.");
    } finally {
      setModalIsAdding(false);
    }
  };

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] animate-in zoom-in-95 duration-300">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-xl rounded-full scale-120 animate-pulse bg-green-500/20 dark:bg-green-500/10" />
          <div className="relative w-20 h-20 text-white rounded-full flex items-center justify-center shadow-lg bg-emerald-500">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
        </div>
        
        <h3 className="text-3xl font-black text-foreground tracking-tight mb-2">
          Profile Updated!
        </h3>
        <p className="text-muted-foreground font-medium mb-8 max-w-sm mx-auto">
          The customer's details have been successfully saved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center max-w-md">
          <Link href={`/customers/${customer.id}`} className="w-full sm:flex-1">
            <Button type="button" className="w-full h-13 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold cursor-pointer shadow-md shadow-primary/20 transition-all active:scale-[0.98]">
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-semibold">
            {state.error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Name Input */}
        <div className="space-y-1.5 col-span-2">
          <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Priyantha Silva"
              className="w-full bg-card border border-border/60 focus:border-primary focus:ring-primary/10 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold"
            />
          </div>
        </div>

        {/* Phone Input */}
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="e.g. 0775944600"
              className="w-full bg-card border border-border/60 focus:border-primary focus:ring-primary/10 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold"
            />
          </div>
        </div>

        {/* Member ID Input */}
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="memberId" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Member ID</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Hash className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              id="memberId"
              name="memberId"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="e.g. M-PRI-KOL-891"
              className="w-full bg-card border border-border/60 focus:border-primary focus:ring-primary/10 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold"
            />
          </div>
        </div>

        {/* Village / State Selection */}
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="state" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collection Area / Village</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <select
              id="state"
              name="state"
              value={clientState}
              onChange={(e) => {
                if (e.target.value === "ADD_NEW_VILLAGE") {
                  setIsAddVillageModalOpen(true);
                  // Optionally revert selection to empty or previous if cancelled
                  return;
                }
                setClientState(e.target.value);
              }}
              className="w-full bg-card border border-border/60 focus:border-primary focus:ring-primary/10 rounded-2xl pl-11 pr-10 py-4 text-foreground focus:outline-none focus:ring-4 transition appearance-none font-semibold cursor-pointer"
            >
              <option value="" disabled>Select Area...</option>
              {localVillages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
              <option value="ADD_NEW_VILLAGE" className="font-bold text-primary">+ Add New Area</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Street Address */}
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Home Address <span className="text-[10px] font-normal text-muted-foreground/60">(Optional)</span></label>
          <div className="relative group">
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street Address, City"
              className="w-full bg-card border border-border/60 focus:border-primary focus:ring-primary/10 rounded-2xl px-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold"
            />
          </div>
        </div>

        {/* Business Name */}
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="companyName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Business Name <span className="text-[10px] font-normal text-muted-foreground/60">(Optional)</span></label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Silva Groceries"
              className="w-full bg-card border border-border/60 focus:border-primary focus:ring-primary/10 rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold"
            />
          </div>
        </div>

        {/* ID Number */}
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="idNumber" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">NIC Number <span className="text-[10px] font-normal text-muted-foreground/60">(Optional)</span></label>
          <div className="relative group">
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. 199012345678"
              className="w-full bg-card border border-border/60 focus:border-primary focus:ring-primary/10 rounded-2xl px-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold"
            />
          </div>
        </div>

      </div>

      <div className="pt-6 mt-4 border-t border-border/40">
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/25 cursor-pointer transition-all active:scale-[0.98]"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Add Village Modal */}
      {isAddVillageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-[2rem] shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">Add New Area</h3>
            <p className="text-sm text-muted-foreground mb-6">Enter the name of the new collection area or village.</p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  autoFocus
                  value={modalVillageName}
                  onChange={(e) => setModalVillageName(e.target.value)}
                  placeholder="e.g. Kolonnawa"
                  className="w-full bg-secondary/50 border border-border/60 focus:border-primary focus:ring-primary/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition font-medium"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleModalAddVillage();
                    }
                  }}
                />
                {modalError && (
                  <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {modalError}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddVillageModalOpen(false)}
                  className="flex-1 rounded-xl h-11"
                  disabled={modalIsAdding}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleModalAddVillage}
                  className="flex-1 rounded-xl h-11"
                  disabled={modalIsAdding || !modalVillageName.trim()}
                >
                  {modalIsAdding ? "Adding..." : "Add Area"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
