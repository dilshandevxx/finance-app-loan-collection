"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createLoan } from "@/app/actions";
import { User, Hash, Phone, DollarSign, Percent, CalendarDays, CheckCircle2, AlertCircle, ChevronDown, MapPin, Camera } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  memberId?: string;
  state?: string;
};

const initialState = { error: undefined as string | undefined };

export function NewLoanForm({ customers }: { customers: Customer[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createLoan(formData);
      return result ?? initialState;
    },
    initialState
  );

  const [isExisting, setIsExisting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [principal, setPrincipal] = useState<number>(0);
  const [interest, setInterest] = useState<number>(10);
  const [weeks, setWeeks] = useState<number>(10);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressedPhoto, setCompressedPhoto] = useState<string>("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = 150;
        canvas.width = size;
        canvas.height = size;

        let sx = 0;
        let sy = 0;
        let sWidth = img.width;
        let sHeight = img.height;

        if (img.width > img.height) {
          sx = (img.width - img.height) / 2;
          sWidth = img.height;
        } else {
          sy = (img.height - img.width) / 2;
          sHeight = img.width;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setCompressedPhoto(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const existingStates = Array.from(
    new Set(
      customers
        .map(c => c.state)
        .filter((s): s is string => !!s && s.trim() !== "")
    )
  ).sort();

  const calculateInstallment = () => {
    if (weeks <= 0) return 0;
    const totalDue = principal * (1 + interest / 100);
    return totalDue / weeks;
  };

  const installmentAmount = calculateInstallment();

  return (
    <form action={formAction} className="flex flex-col gap-6 sm:gap-8">
      
      {/* Error Banner */}
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 text-red-700 dark:text-red-400 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}

      {/* Segmented Control for Customer Type */}
      <div className="bg-gray-100/80 dark:bg-muted p-1.5 rounded-2xl flex items-center relative overflow-hidden">
        <div 
          className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#222] rounded-xl shadow-sm transition-all duration-300 ease-out" 
          style={{ left: isExisting ? 'calc(50% + 3px)' : '6px' }}
        />
        <button
          type="button"
          onClick={() => setIsExisting(false)}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors relative z-10 ${!isExisting ? 'text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          New Customer
        </button>
        <button
          type="button"
          onClick={() => setIsExisting(true)}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors relative z-10 ${isExisting ? 'text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Existing Customer
        </button>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <h3 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
          Customer Information
        </h3>

        {isExisting ? (
          <div className="space-y-2">
            <label htmlFor="existingCustomerId" className="text-sm font-semibold text-gray-750 dark:text-white/70">Select Customer</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-neon-lime dark:group-focus-within:text-neon-lime transition-colors" />
              </div>
              <select
                id="existingCustomerId"
                name="existingCustomerId"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-2xl pl-11 pr-10 py-3.5 text-black dark:text-white focus:outline-none focus:border-neon-lime dark:focus:border-neon-lime focus:ring-2 focus:ring-neon-lime/5 transition shadow-sm dark:shadow-none appearance-none font-medium"
                required
              >
                <option value="" disabled>Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (ID: {c.memberId || c.id.slice(0, 8)})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400 dark:text-white/45 group-focus-within:text-neon-lime dark:group-focus-within:text-neon-lime transition-colors" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Profile Photo Uploader */}
            <div className="col-span-2 flex flex-col items-center justify-center gap-3 py-2">
              <div className="relative group">
                <div 
                  onClick={() => document.getElementById("photo-input")?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-border hover:border-primary dark:hover:border-primary overflow-hidden bg-gray-50 dark:bg-[#1C1B1A] flex items-center justify-center transition-all shadow-inner group-hover:scale-105 cursor-pointer relative"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-white/30 group-hover:text-primary transition-colors">
                      <Camera className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Add Photo</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById("photo-input")?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground border border-white dark:border-[#252322] flex items-center justify-center shadow-md hover:bg-primary/95 active:scale-90 transition-all cursor-pointer"
                  title="Upload / Capture Photo"
                >
                  <Camera className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
              <input 
                type="file" 
                id="photo-input"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <input 
                type="hidden" 
                name="avatarDataUrl" 
                value={compressedPhoto} 
              />
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setCompressedPhoto("");
                  }}
                  className="text-xs text-red-500 hover:text-red-650 font-bold transition-colors cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-750 dark:text-white/70">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. John Doe" 
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-455 dark:placeholder:text-white/30 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/5 transition shadow-sm font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label htmlFor="memberId" className="text-sm font-semibold text-gray-750 dark:text-white/70">Member ID <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  id="memberId"
                  name="memberId"
                  placeholder="e.g. M-1004" 
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-455 dark:placeholder:text-white/30 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/5 transition shadow-sm font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label htmlFor="phone" className="text-sm font-semibold text-gray-750 dark:text-white/70">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  required
                  placeholder="e.g. 555-0199" 
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-455 dark:placeholder:text-white/30 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/5 transition shadow-sm font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="gender" className="text-sm font-semibold text-gray-750 dark:text-white/70">Gender</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                </div>
                <select
                  id="gender"
                  name="gender"
                  defaultValue="male"
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-10 py-3.5 text-black dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/5 transition shadow-sm appearance-none font-medium"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400 dark:text-white/45 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            </div>

            {/* State/Village Collection Area */}
            <div className="space-y-2 col-span-2">
              <label htmlFor="state" className="text-sm font-semibold text-gray-750 dark:text-white/70">Collection Area (State/Village)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  id="state"
                  name="state"
                  list="states-list"
                  placeholder="Search or enter area (e.g. Village West, Ward 4)" 
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-455 dark:placeholder:text-white/30 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/5 transition shadow-sm font-medium"
                />
                <datalist id="states-list">
                  {existingStates.map(state => (
                    <option key={state} value={state} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Landmark/Address */}
            <div className="space-y-2 col-span-2">
              <label htmlFor="address" className="text-sm font-semibold text-gray-750 dark:text-white/70">Street Address / Landmark <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  id="address"
                  name="address"
                  placeholder="e.g. Near the temple, House #12" 
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-455 dark:placeholder:text-white/30 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/5 transition shadow-sm font-medium"
                />
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-[#222]" />

      <div className="space-y-4 sm:space-y-5">
        <h3 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
          Loan Details
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="principal" className="text-sm font-semibold text-gray-750 dark:text-white/70">Principal Amount</label>
            <span className="text-xs font-bold text-black/50 dark:text-white/50 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">${principal.toFixed(2)}</span>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-black dark:text-white group-focus-within:text-neon-lime transition-colors" />
            </div>
            <input 
              type="number" 
              id="principal"
              name="principal"
              required
              min="0"
              step="0.01"
              value={principal || ""}
              onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
              placeholder="0.00" 
              className="w-full bg-white dark:bg-card border-2 border-gray-200 dark:border-border focus:border-neon-lime dark:focus:border-neon-lime rounded-2xl pl-12 pr-4 py-4 text-2xl font-bold text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-neon-lime/5 transition shadow-sm"
            />
          </div>
          <div className="pt-1 px-1">
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={principal}
              onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
              className="w-full h-1 bg-gray-250 dark:bg-[#222] rounded-lg appearance-none cursor-pointer accent-neon-lime"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/30 px-0.5 mt-0.5 font-medium">
              <span>$0</span>
              <span>$2,500</span>
              <span>$5,000</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <div className="flex justify-between items-center">
              <label htmlFor="interest" className="text-sm font-semibold text-gray-750 dark:text-white/70">Interest Rate</label>
              <span className="text-xs font-bold text-black/50 dark:text-white/50 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{interest}%</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Percent className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              </div>
              <input 
                type="number" 
                id="interest"
                name="interest"
                required
                min="0"
                step="0.1"
                value={interest || ""}
                onChange={(e) => setInterest(parseFloat(e.target.value) || 0)}
                placeholder="10" 
                className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-455 dark:placeholder:text-white/30 focus:outline-none focus:border-neon-lime dark:focus:border-neon-lime focus:ring-2 focus:ring-neon-lime/5 transition shadow-sm font-medium"
              />
            </div>
            <div className="pt-1 px-1">
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={interest}
                onChange={(e) => setInterest(parseFloat(e.target.value) || 0)}
                className="w-full h-1 bg-gray-250 dark:bg-[#222] rounded-lg appearance-none cursor-pointer accent-neon-lime"
              />
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/30 px-0.5 mt-0.5 font-medium">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <div className="flex justify-between items-center">
              <label htmlFor="weeks" className="text-sm font-semibold text-gray-750 dark:text-white/70">Duration (Weeks)</label>
              <span className="text-xs font-bold text-black/50 dark:text-white/50 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{weeks} weeks</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CalendarDays className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              </div>
              <input 
                type="number" 
                id="weeks"
                name="weeks"
                required
                min="1"
                value={weeks || ""}
                onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
                placeholder="10" 
                className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-455 dark:placeholder:text-white/30 focus:outline-none focus:border-neon-lime dark:focus:border-neon-lime focus:ring-2 focus:ring-neon-lime/5 transition shadow-sm font-medium"
              />
            </div>
            <div className="pt-1.5 px-1">
              <input
                type="range"
                min="1"
                max="52"
                step="1"
                value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
                className="w-full h-1 bg-gray-250 dark:bg-[#222] rounded-lg appearance-none cursor-pointer accent-neon-lime"
              />
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/30 px-0.5 mt-0.5 font-medium">
                <span>1 wk</span>
                <span>26 wks</span>
                <span>52 wks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Installment Summary */}
      <div className="bg-neon-lime/10 dark:bg-neon-lime/5 border border-neon-lime/25 dark:border-neon-lime/20 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 mt-2 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-black dark:text-neon-lime uppercase tracking-wider truncate">Calculated Installment</span>
            <span className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight flex items-baseline gap-1 flex-wrap">
              ${installmentAmount.toFixed(2)} <span className="text-xs sm:text-sm text-gray-500 dark:text-white/60 font-medium">/ week</span>
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-lime text-black rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5.5 h-5.5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
        </div>
        
        {/* Breakdown details */}
        {principal > 0 && (
          <div className="border-t border-neutral-200 dark:border-[#333] pt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-white/40 font-medium">Principal</span>
              <span className="text-black dark:text-white font-bold">${principal.toFixed(2)}</span>
            </div>
            <div className="flex flex-col border-x border-neutral-250 dark:border-[#333]">
              <span className="text-gray-500 dark:text-white/40 font-medium">Interest ({interest}%)</span>
              <span className="text-black dark:text-white font-bold">+${((principal * interest) / 100).toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-white/40 font-medium">Total Repay</span>
              <span className="text-black dark:text-white font-bold">${(principal * (1 + interest / 100)).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-black dark:via-black to-transparent z-50">
        <div className="bg-white dark:bg-muted p-2 rounded-2xl border border-gray-200 dark:border-border shadow-2xl backdrop-blur-xl">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-neon-lime hover:bg-[#d4f02a] text-black font-black rounded-xl h-14 text-base shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 border-none"
          >
            {isPending ? "Creating..." : "Create Loan Account"}
          </Button>
        </div>
      </div>

      {/* Desktop Action */}
      <Button 
        type="submit" 
        disabled={isPending}
        className="hidden md:flex w-full bg-neon-lime hover:bg-[#d4f02a] text-black font-black rounded-2xl h-14 text-lg mt-4 shadow-[0_4px_20px_rgba(226,255,59,0.25)] border-none transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "Creating Loan..." : "Create Loan Account"}
      </Button>
    </form>
  );
}
