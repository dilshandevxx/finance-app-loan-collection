"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createLoan, createSystemVillage } from "@/app/actions";
import { 
  User, 
  Hash, 
  Phone, 
  DollarSign, 
  Percent, 
  CalendarDays, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  MapPin, 
  Camera, 
  Building,
  ArrowRight,
  ArrowLeft,
  Coins,
  Sparkles,
  Check,
  Info,
  Calendar,
  WifiOff
} from "lucide-react";
import { formatLKR } from "@/lib/format";
import type { VillageSchedule } from "@/lib/schedule";

type Customer = {
  id: string;
  name: string;
  memberId?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
};

type FormState = {
  error?: string;
  success?: boolean;
  customerId?: string;
};

const initialState: FormState = {};

export function NewLoanForm({ 
  customers, 
  villages, 
  schedule 
}: { 
  customers: Customer[]; 
  villages: string[]; 
  schedule: VillageSchedule | null 
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createLoan(formData);
      return (result as FormState) ?? initialState;
    },
    initialState
  );

  const [offlineSuccess, setOfflineSuccess] = useState(false);

  const handleAction = (formData: FormData) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const payload = Object.fromEntries(formData.entries());
      const queue = JSON.parse(localStorage.getItem("offlineSyncQueue") || "[]");
      queue.push({ type: "createLoan", payload });
      localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent("offline-queue-updated"));
      setOfflineSuccess(true);
    } else {
      formAction(formData);
    }
  };

  // Steps state: 1 = Profile, 2 = Terms, 3 = Confirm
  const [step, setStep] = useState(1);
  const [isExisting, setIsExisting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [principal, setPrincipal] = useState<number>(5000);
  const [interest, setInterest] = useState<number>(40);
  const [weeks, setWeeks] = useState<number>(14);

  // Special/custom installment states
  const [isCustomInstallment, setIsCustomInstallment] = useState<boolean>(false);
  const [preferredInstallment, setPreferredInstallment] = useState<string>("");

  // Ongoing loan states
  const [isOngoingLoan, setIsOngoingLoan] = useState<boolean>(false);
  const [amountAlreadyPaid, setAmountAlreadyPaid] = useState<string>("");
  const [originalStartDate, setOriginalStartDate] = useState<string>(() => {
    // Default to a month ago as a reasonable starting point if checked
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    if (!isCustomInstallment) {
      setInterest(40);
      setWeeks(14);
    } else {
      const prefVal = parseFloat(preferredInstallment) || 0;
      if (prefVal <= 0 || principal <= 0) {
        setInterest(40);
        setWeeks(14);
        return;
      }

      const stdWeeks = 14;
      const stdInterest = principal * 0.40;
      const stdTotal = principal + stdInterest;

      // 1. How many weeks needed to pay standard total of 70000 (for 50k principal)
      const weeksBase = Math.ceil(stdTotal / prefVal);
      if (weeksBase <= stdWeeks) {
        setInterest(40);
        setWeeks(14);
        return;
      }

      // 2. Extra weeks
      const weeksExtra = weeksBase - stdWeeks;

      // 3. Weekly profit of standard option, rounded to nearest 100 LKR
      const pHigh = Math.round((stdInterest / stdWeeks) / 100) * 100;

      // 4. Calculate full profit (standard interest + extra weeks * standard weekly profit)
      const interestAmt = stdInterest + (weeksExtra * pHigh);

      // 5. Calculate new interest rate
      const interestRate = (interestAmt / principal) * 100;

      // 6. Finally calculate weeks count needed to pay full amount
      const finalWeeks = Math.ceil((principal + interestAmt) / prefVal);

      setWeeks(finalWeeks);
      setInterest(Number(interestRate.toFixed(2)));
    }
  }, [isCustomInstallment, preferredInstallment, principal]);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressedPhoto, setCompressedPhoto] = useState<string>("");

  const [clientName, setClientName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [memberId, setMemberId] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gender, setGender] = useState("male");
  const [clientState, setClientState] = useState("");
  const [address, setAddress] = useState("");

  const [isMemberIdEdited, setIsMemberIdEdited] = useState(false);
  const [randomSuffix] = useState(() => Math.floor(100 + Math.random() * 900));

  // Local validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Local villages list state to allow dynamic addition
  const [localVillages, setLocalVillages] = useState<string[]>(villages);

  // Modal state
  const [isAddVillageModalOpen, setIsAddVillageModalOpen] = useState(false);
  const [modalVillageName, setModalVillageName] = useState("");
  const [modalIsAdding, setModalIsAdding] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Auto-generate initials for Avatar preview
  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Sync village on change to generate Member ID
  const handleVillageChange = (val: string) => {
    setClientState(val);
    generateAndSetMemberId(clientName, val);
    if (validationErrors.state) {
      setValidationErrors(prev => ({ ...prev, state: "" }));
    }
  };

  const handleNameChange = (val: string) => {
    setClientName(val);
    generateAndSetMemberId(val, clientState);
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: "" }));
    }
  };

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
        handleVillageChange(nameVal);
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

  const generateAndSetMemberId = (nameVal: string, stateVal: string) => {
    if (isMemberIdEdited) return;

    const initials = nameVal
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 3);

    const statePrefix = stateVal
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 3);

    const parts = ["M"];
    if (initials) parts.push(initials);
    if (statePrefix) parts.push(statePrefix);
    parts.push(randomSuffix.toString());

    setMemberId(parts.join("-"));
  };

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

  const calculateInstallment = () => {
    if (weeks <= 0) return 0;
    const totalDue = principal * (1 + interest / 100);
    return totalDue / weeks;
  };

  const installmentAmount = isCustomInstallment && parseFloat(preferredInstallment) > 0
    ? parseFloat(preferredInstallment)
    : calculateInstallment();

  const getDaysForVillage = (villageName: string) => {
    if (!schedule) return [];
    const days = [];
    for (const [day, dayVillages] of Object.entries(schedule)) {
      if (Array.isArray(dayVillages) && dayVillages.includes(villageName)) {
        days.push(day.slice(0, 3));
      }
    }
    return days;
  };

  const getFirstCollectionDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString("en-LK", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Inline validation function
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (isExisting) {
        if (!selectedCustomerId) {
          newErrors.existingCustomerId = "Please select an existing customer.";
        }
      } else {
        if (!clientName.trim()) {
          newErrors.name = "Full name is required.";
        } else if (clientName.trim().length < 3) {
          newErrors.name = "Name must be at least 3 characters.";
        }

        if (!phoneInput.trim()) {
          newErrors.phone = "Phone number is required.";
        } else {
          const digits = phoneInput.replace(/\D/g, "");
          if (digits.length < 9 || digits.length > 11) {
            newErrors.phone = "Enter a valid Sri Lankan phone number (e.g. 0775944600).";
          }
        }

        if (!clientState) {
          newErrors.state = "Please select a collection village.";
        }
      }
    } else if (currentStep === 2) {
      if (principal <= 0) {
        newErrors.principal = "Enter a principal amount greater than Rs. 0.";
      }
      if (isCustomInstallment) {
        const prefVal = parseFloat(preferredInstallment) || 0;
        const stdTotal = principal * 1.40;
        const stdInst = Math.round(stdTotal / 14);
        if (prefVal <= 0) {
          newErrors.preferredInstallment = "Enter a preferred weekly installment amount.";
        } else if (prefVal >= stdTotal) {
          newErrors.preferredInstallment = `Installment must be less than the total standard due (Rs. ${stdTotal.toLocaleString("en-LK")}).`;
        } else if (prefVal >= stdInst) {
          newErrors.preferredInstallment = `Installment must be less than the standard installment (Rs. ${stdInst.toLocaleString("en-LK")}) to require a custom duration.`;
        }
      }
      if (interest < 0) {
        newErrors.interest = "Interest rate cannot be negative.";
      }
      if (weeks <= 0) {
        newErrors.weeks = "Duration must be at least 1 week.";
      }
      if (isOngoingLoan) {
        const paidVal = parseFloat(amountAlreadyPaid) || 0;
        const totalDue = principal * (1 + interest / 100);
        if (paidVal < 0) {
          newErrors.amountAlreadyPaid = "Amount paid cannot be negative.";
        } else if (paidVal > totalDue) {
          newErrors.amountAlreadyPaid = `Amount paid cannot exceed total due (Rs. ${totalDue.toLocaleString("en-LK")}).`;
        }
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (currentStep: number) => {
    if (validateStep(currentStep)) {
      setStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find selected customer object
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  let selectedCustomerAddress: { state?: string; address?: string; companyName?: string; idNumber?: string } | null = null;
  if (selectedCustomer && selectedCustomer.address) {
    try {
      selectedCustomerAddress = JSON.parse(selectedCustomer.address);
    } catch (e) {
      // ignore
    }
  }

  // Set initial customer states if existing customer is selected
  useEffect(() => {
    if (isExisting && selectedCustomer) {
      setClientName(selectedCustomer.name);
      setPhoneInput(selectedCustomer.phone || "");
      setMemberId(selectedCustomer.memberId || "");
      if (selectedCustomerAddress) {
        setClientState(selectedCustomerAddress.state || "");
        setAddress(selectedCustomerAddress.address || "");
        setCompanyName(selectedCustomerAddress.companyName || "");
        setIdNumber(selectedCustomerAddress.idNumber || "");
      }
    }
  }, [isExisting, selectedCustomerId, selectedCustomer]);

  // Redirection/Success state styling
  if (state?.success || offlineSuccess) {
    const isOffline = offlineSuccess;
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[460px] animate-in zoom-in-95 duration-300">
        <div className="relative mb-6">
          <div className={`absolute inset-0 blur-xl rounded-full scale-120 animate-pulse ${isOffline ? 'bg-orange-500/20' : 'bg-green-500/20 dark:bg-green-500/10'}`} />
          <div className={`relative w-20 h-20 text-white rounded-full flex items-center justify-center shadow-lg ${isOffline ? 'bg-orange-500' : 'bg-emerald-500'}`}>
            {isOffline ? <WifiOff className="w-10 h-10 stroke-[2.5]" /> : <Check className="w-10 h-10 stroke-[3]" />}
          </div>
        </div>
        
        <h3 className="text-3xl font-black text-foreground tracking-tight mb-2">
          {isOffline ? "Loan Queued Offline" : "Loan Created!"}
        </h3>
        <p className="text-muted-foreground font-medium mb-8 max-w-sm mx-auto">
          {isOffline 
            ? "You are offline. The loan details have been saved to your device and will automatically sync when you reconnect." 
            : "The loan account and weekly repayment schedule have been registered."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center max-w-md">
          <Link href="/" className="w-full sm:flex-1">
            <Button type="button" variant="secondary" className="w-full h-13 rounded-2xl font-bold cursor-pointer transition-all active:scale-[0.98]">
              Dashboard
            </Button>
          </Link>
          {!isOffline && state?.customerId && (
            <Link href={`/customers/${state.customerId}`} className="w-full sm:flex-1">
              <Button type="button" className="w-full h-13 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold cursor-pointer shadow-md shadow-primary/20 transition-all active:scale-[0.98]">
                View Profile
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Predefined Presets
  const principalPresets = [1000, 2500, 5000, 10000, 25000];
  const interestPresets = [5, 10, 12, 15, 20];
  const durationPresets = [10, 15, 20, 26, 40, 52];

  return (
    <form action={handleAction} className="flex flex-col gap-6">
      
      {/* Client-side Action Error or Server Error */}
      {(state?.error || Object.keys(validationErrors).length > 0) && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-semibold">
            {state?.error || "Please fix the validation errors below."}
          </div>
        </div>
      )}

      {/* Modern High-Fidelity Stepper */}
      <div className="bg-secondary/40 dark:bg-secondary/10 border border-border/40 rounded-3xl p-4 sm:p-5">
        <div className="flex items-center justify-between relative px-4 max-w-lg mx-auto">
          {/* Connector Line */}
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-10" />
          <div 
            className="absolute top-5 left-10 right-10 h-0.5 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${step === 1 ? '0%' : step === 2 ? '50%' : '100%'}` }}
          />

          {/* Stepper Steps */}
          {[
            { id: 1, label: "Profile", icon: User },
            { id: 2, label: "Terms", icon: Coins },
            { id: 3, label: "Confirm", icon: CheckCircle2 },
          ].map((s) => {
            const IconComponent = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (isCompleted || (s.id === 2 && step === 3) || (s.id === 1 && step === 2)) {
                    setStep(s.id);
                  }
                }}
                disabled={!isCompleted && step < s.id}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/25' 
                    : isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white dark:bg-muted border-border text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider uppercase transition-colors duration-300 ${
                  isActive ? 'text-primary' : isCompleted ? 'text-emerald-500' : 'text-muted-foreground'
                }`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          STEP 1: CUSTOMER PROFILE
          ────────────────────────────────────────────────────────── */}
      <div className={step === 1 ? "flex flex-col gap-6" : "hidden"}>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Borrower Profile
          </h3>
          <p className="text-xs text-muted-foreground">Select an existing customer account or input details for a new borrower.</p>
        </div>

        {/* Customer Type Selector */}
        <div className="bg-secondary/60 dark:bg-muted p-1.5 rounded-2xl flex items-center relative overflow-hidden border border-border/40">
          <div
            className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-card border border-border/30 rounded-xl shadow-sm transition-all duration-300 ease-out"
            style={{ left: isExisting ? 'calc(50% + 3px)' : '6px' }}
          />
          <button
            type="button"
            onClick={() => {
              setIsExisting(false);
              setValidationErrors({});
            }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all relative z-10 cursor-pointer flex items-center justify-center gap-1.5 ${
              !isExisting ? 'text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            New Borrower
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExisting(true);
              setValidationErrors({});
            }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all relative z-10 cursor-pointer flex items-center justify-center gap-1.5 ${
              isExisting ? 'text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Existing Customer
          </button>
        </div>

        {/* Existing Customer Dropdown */}
        {isExisting ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <label htmlFor="existingCustomerId" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Customer</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <select
                  id="existingCustomerId"
                  name="existingCustomerId"
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    if (validationErrors.existingCustomerId) {
                      setValidationErrors(prev => ({ ...prev, existingCustomerId: "" }));
                    }
                  }}
                  className={`w-full bg-card border ${
                    validationErrors.existingCustomerId ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10" : "border-border/60 focus:border-primary focus:ring-primary/10"
                  } rounded-2xl pl-11 pr-10 py-4 text-foreground focus:outline-none focus:ring-4 transition appearance-none font-semibold cursor-pointer`}
                >
                  <option value="" disabled>Choose customer account...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.memberId ? `(${c.memberId})` : `(ID: ${c.id.slice(0, 8)})`}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              {validationErrors.existingCustomerId && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.existingCustomerId}
                </p>
              )}
            </div>

            {/* Selected Customer Card Preview */}
            {selectedCustomer && (
              <div className="bg-secondary/40 dark:bg-secondary/15 border border-border/50 rounded-3xl p-5 flex items-center gap-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-border shadow-inner bg-muted shrink-0 flex items-center justify-center text-lg font-bold text-primary">
                  {selectedCustomer.avatarUrl ? (
                    <img src={selectedCustomer.avatarUrl} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(selectedCustomer.name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-black text-foreground truncate">{selectedCustomer.name}</div>
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Hash className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span>{selectedCustomer.memberId || "M-N/A"}</span>
                    {selectedCustomer.phone && (
                      <>
                        <span className="text-border">•</span>
                        <Phone className="w-3 h-3 text-primary/70 shrink-0" />
                        <span>{selectedCustomer.phone}</span>
                      </>
                    )}
                  </div>
                  {selectedCustomerAddress?.state && (
                    <div className="text-xs font-bold text-primary flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Collection Area: {selectedCustomerAddress.state}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Custom Avatar Capture / File Selection */}
            <div className="col-span-2 flex flex-col items-center justify-center gap-2 py-3">
              <div className="relative group">
                <div
                  onClick={() => document.getElementById("photo-input-new")?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-border group-hover:border-primary overflow-hidden bg-secondary/50 dark:bg-muted flex items-center justify-center transition-all shadow-inner group-hover:scale-105 cursor-pointer relative"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary/80 to-indigo-600/80 text-white flex flex-col items-center justify-center font-black text-2xl tracking-tighter">
                      {clientName.trim() ? (
                        getInitials(clientName)
                      ) : (
                        <Camera className="w-8 h-8 stroke-[1.5]" />
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById("photo-input-new")?.click()}
                  className="absolute bottom-0 right-0 w-8.5 h-8.5 rounded-full bg-primary text-white border-2 border-card flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
                  title="Upload Borrower Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                type="file"
                id="photo-input-new"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <input
                type="hidden"
                name="avatarDataUrl"
                value={compressedPhoto}
              />
              {photoPreview ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setCompressedPhoto("");
                  }}
                  className="text-xs text-red-500 hover:underline font-bold transition-all cursor-pointer"
                >
                  Clear Photo
                </button>
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Borrower Photo</span>
              )}
            </div>

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
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Priyantha Silva"
                  className={`w-full bg-card border ${
                    validationErrors.name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10" : "border-border/60 focus:border-primary focus:ring-primary/10"
                  } rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold`}
                />
              </div>
              {validationErrors.name ? (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.name}
                </p>
              ) : (
                clientName.trim() && (
                  <p className="text-[11px] font-bold text-primary/75 flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                    Generated ID: {memberId}
                  </p>
                )
              )}
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
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    if (validationErrors.phone) {
                      setValidationErrors(prev => ({ ...prev, phone: "" }));
                    }
                  }}
                  placeholder="e.g. 0775944600"
                  className={`w-full bg-card border ${
                    validationErrors.phone ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10" : "border-border/60 focus:border-primary focus:ring-primary/10"
                  } rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-semibold`}
                />
              </div>
              {validationErrors.phone && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Member ID Override */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label htmlFor="memberId" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Member ID <span className="text-[10px] font-normal text-muted-foreground/60">(override)</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  id="memberId"
                  name="memberId"
                  value={memberId}
                  onChange={(e) => {
                    setMemberId(e.target.value);
                    setIsMemberIdEdited(true);
                  }}
                  placeholder="e.g. M-1004"
                  className="w-full bg-card border border-border/60 focus:border-primary rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition font-semibold"
                />
              </div>
            </div>

            {/* Collection Area Selector with Inline Add Area Modal Trigger */}
            <div className="space-y-1.5 col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="village-select" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collection Area (Village)</label>
                <button
                  type="button"
                  onClick={() => setIsAddVillageModalOpen(true)}
                  className="text-xs font-black text-primary hover:underline flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
                >
                  ➕ New Village
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <select
                  id="village-select"
                  name="state"
                  value={clientState}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  className={`w-full bg-card border ${
                    validationErrors.state ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10" : "border-border/60 focus:border-primary focus:ring-primary/10"
                  } rounded-2xl pl-11 pr-10 py-4 text-foreground focus:outline-none focus:ring-4 transition appearance-none font-semibold cursor-pointer`}
                >
                  <option value="" disabled>Select area...</option>
                  {localVillages.map(v => {
                    const days = getDaysForVillage(v);
                    const daysStr = days.length > 0 ? ` (${days.join(", ")})` : "";
                    return (
                      <option key={v} value={v}>📍 {v}{daysStr}</option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              {validationErrors.state ? (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.state}
                </p>
              ) : (
                clientState && (
                  <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scheduled Collection Days:</span>
                    {getDaysForVillage(clientState).length > 0 ? (
                      <div className="flex gap-1">
                        {getDaysForVillage(clientState).map(day => (
                          <span key={day} className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {day}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-semibold italic">No fixed schedule</span>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Collapsible/Grid section for Optional Details */}
            <div className="col-span-2 border-t border-border/40 pt-4 mt-1">
              <span className="text-[11px] font-black text-primary uppercase tracking-wider mb-3 block">Additional Details (Optional)</span>
              
              <div className="grid grid-cols-2 gap-4">
                {/* NIC */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label htmlFor="idNumber" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">NIC / ID Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. 951044234V"
                      className="w-full bg-card border border-border/60 focus:border-primary rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition font-semibold"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label htmlFor="companyName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company / Workplace</label>
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
                      placeholder="e.g. Wijeya Textiles"
                      className="w-full bg-card border border-border/60 focus:border-primary rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition font-semibold"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5 col-span-2">
                  <label htmlFor="gender" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gender</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <select
                      id="gender"
                      name="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-card border border-border/60 focus:border-primary rounded-2xl pl-11 pr-10 py-4 text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition appearance-none font-semibold cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-1.5 col-span-2">
                  <label htmlFor="address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Street Address / Landmark</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Near Temple Rd, House #14"
                      className="w-full bg-card border border-border/60 focus:border-primary rounded-2xl pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button Step 1 */}
        <div className="pt-4 border-t border-border/40">
          <Button
            type="button"
            onClick={() => handleNextStep(1)}
            className="w-full bg-primary hover:bg-primary/95 text-white font-black rounded-2xl h-14 text-base shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Continue to Loan Terms
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          STEP 2: LOAN PARAMETERS
          ────────────────────────────────────────────────────────── */}
      <div className={step === 2 ? "flex flex-col gap-6" : "hidden"}>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Loan Settings
          </h3>
          <p className="text-xs text-muted-foreground">Adjust the principal, interest rate, and duration of the loan.</p>
        </div>

        {/* Principal input card */}
        <div className="bg-secondary/30 dark:bg-secondary/10 border border-border/40 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="principal" className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Principal Amount</label>
            <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{formatLKR(principal)}</span>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="text-2xl font-black text-muted-foreground group-focus-within:text-primary transition-colors">Rs.</span>
            </div>
            <input
              type="number"
              id="principal"
              name="principal"
              min="0"
              step="1"
              value={principal || ""}
              onChange={(e) => {
                setPrincipal(parseFloat(e.target.value) || 0);
                if (validationErrors.principal) {
                  setValidationErrors(prev => ({ ...prev, principal: "" }));
                }
              }}
              placeholder="0"
              className={`w-full bg-card border ${
                validationErrors.principal ? "border-red-500/50 focus:border-red-500" : "border-border/60 focus:border-primary"
              } rounded-2xl pl-14 pr-4 py-5 text-3xl font-black text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition`}
            />
          </div>

          {/* Slider for Principal */}
          <div className="pt-2">
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={principal}
              onChange={(e) => {
                setPrincipal(parseFloat(e.target.value) || 0);
                if (validationErrors.principal) {
                  setValidationErrors(prev => ({ ...prev, principal: "" }));
                }
              }}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-1 px-1">
              <span>Rs. 1,000</span>
              <span>Rs. 25,000</span>
              <span>Rs. 50,000</span>
            </div>
          </div>

          {/* Quick presets principal */}
          <div className="flex flex-wrap gap-2 pt-1.5">
            {principalPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setPrincipal(val);
                  setValidationErrors(prev => ({ ...prev, principal: "" }));
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  principal === val 
                    ? "bg-primary border-primary text-white shadow-sm shadow-primary/20 scale-105" 
                    : "bg-card border-border/70 text-foreground hover:bg-secondary"
                }`}
              >
                Rs. {val.toLocaleString("en-LK")}
              </button>
            ))}
          </div>
          {validationErrors.principal && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationErrors.principal}
            </p>
          )}
        </div>

        {/* Custom weekly installment card */}
        <div className="bg-secondary/40 dark:bg-secondary/15 border border-border/40 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                ⭐ Custom Weekly Installment
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Adjust terms for a lower customer installment.
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                const nextVal = !isCustomInstallment;
                setIsCustomInstallment(nextVal);
                if (nextVal) {
                  const stdTotal = principal * 1.40;
                  const defaultInst = Math.round(stdTotal / 14);
                  setPreferredInstallment(defaultInst.toString());
                } else {
                  setPreferredInstallment("");
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isCustomInstallment ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isCustomInstallment ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isCustomInstallment && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label htmlFor="preferredInstallment" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Preferred Weekly Installment
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-sm font-black text-muted-foreground group-focus-within:text-primary transition-colors">Rs.</span>
                </div>
                <input
                  type="number"
                  id="preferredInstallment"
                  value={preferredInstallment}
                  onChange={(e) => {
                    setPreferredInstallment(e.target.value);
                    if (validationErrors.preferredInstallment) {
                      setValidationErrors(prev => ({ ...prev, preferredInstallment: "" }));
                    }
                  }}
                  placeholder="e.g. 3500"
                  className={`w-full bg-card border ${
                    validationErrors.preferredInstallment ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10" : "border-border/60 focus:border-primary focus:ring-primary/10"
                  } rounded-2xl pl-11 pr-4 py-3 text-foreground font-black text-lg focus:outline-none focus:ring-4 transition`}
                />
              </div>
              {validationErrors.preferredInstallment && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-0.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.preferredInstallment}
                </p>
              )}
              <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl p-3">
                <details className="group cursor-pointer">
                  <summary className="flex items-center gap-1.5 text-xs font-bold text-primary list-none outline-none">
                    <Info className="w-4 h-4" />
                    How is custom interest calculated?
                  </summary>
                  <div className="mt-2 text-[10px] text-muted-foreground leading-relaxed space-y-1.5">
                    <p>1. <strong>Standard Check:</strong> Default is Rs. {Math.round((principal * 1.40) / 14).toLocaleString("en-LK")} over 14 weeks.</p>
                    <p>2. <strong>Duration Extension:</strong> We calculate how many weeks it takes to pay the standard total with your lower installment.</p>
                    <p>3. <strong>Recovery Fee:</strong> For every extra week beyond 14, a fixed travel/recovery fee is added to the interest.</p>
                    <p>4. <strong>Final Calculation:</strong> The new duration and total interest rate are automatically updated below.</p>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Interest input card */}
          <div className="bg-secondary/15 dark:bg-secondary/5 border border-border/40 rounded-3xl p-4 sm:p-5 space-y-3 col-span-2 sm:col-span-1 opacity-90 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <label htmlFor="interest" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interest Rate</label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                isCustomInstallment 
                  ? "text-primary bg-primary/10" 
                  : "text-amber-600 dark:text-amber-400 bg-amber-500/10"
              }`}>
                {isCustomInstallment ? "⚙️ Calculated" : "🔒 Fixed"}
              </span>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Percent className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="number"
                id="interest"
                value={interest || ""}
                disabled
                className="w-full bg-secondary/50 border border-border/40 rounded-2xl pl-11 pr-4 py-4 text-muted-foreground focus:outline-none transition font-black text-lg cursor-not-allowed"
              />
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/60 italic">
              {isCustomInstallment ? "Adjusted to recover travel/oil bills." : "Fixed at 40% interest rate."}
            </div>
          </div>

          {/* Weeks input card */}
          <div className="bg-secondary/15 dark:bg-secondary/5 border border-border/40 rounded-3xl p-4 sm:p-5 space-y-3 col-span-2 sm:col-span-1 opacity-90 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <label htmlFor="weeks" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                isCustomInstallment 
                  ? "text-primary bg-primary/10" 
                  : "text-amber-600 dark:text-amber-400 bg-amber-500/10"
              }`}>
                {isCustomInstallment ? "⚙️ Calculated" : "🔒 Fixed"}
              </span>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="number"
                id="weeks"
                value={weeks || ""}
                disabled
                className="w-full bg-secondary/50 border border-border/40 rounded-2xl pl-11 pr-4 py-4 text-muted-foreground focus:outline-none transition font-black text-lg cursor-not-allowed"
              />
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/60 italic">
              {isCustomInstallment ? "Extended to match preferred payment." : "Fixed at 14 weeks duration."}
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            ONGOING LOAN SECTION (Historical Import)
            ────────────────────────────────────────────────────────── */}
        <div className="bg-secondary/30 dark:bg-card border border-border/60 rounded-3xl p-5 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start pt-1">
              <input
                type="checkbox"
                name="isOngoingLoan"
                value="true"
                checked={isOngoingLoan}
                onChange={(e) => {
                  setIsOngoingLoan(e.target.checked);
                  if (!e.target.checked) {
                    setAmountAlreadyPaid("");
                    if (validationErrors.amountAlreadyPaid) {
                      setValidationErrors(prev => ({ ...prev, amountAlreadyPaid: "" }));
                    }
                  }
                }}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded border-2 border-muted-foreground/50 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Is this an ongoing legacy loan?
              </span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">
                Check this if the borrower has already started paying off this loan. You can enter their original start date and the amount they have already paid to accurately preserve their history.
              </span>
            </div>
          </label>

          {isOngoingLoan && (
            <div className="pl-8 animate-in slide-in-from-top-2 fade-in duration-200 space-y-4">
              
              {/* Original Start Date Input */}
              <div className="space-y-1.5 relative">
                <label htmlFor="originalStartDate" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original Start Date</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="date"
                    id="originalStartDate"
                    name="originalStartDate"
                    value={originalStartDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setOriginalStartDate(e.target.value)}
                    className="w-full bg-card border border-border/60 focus:border-primary rounded-2xl pl-11 pr-4 py-3 text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition font-bold"
                  />
                </div>
              </div>

              {/* Amount Already Paid Input */}
              <div className="space-y-1.5 relative">
                <label htmlFor="amountAlreadyPaid" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount Already Paid (Rs.)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-muted-foreground font-bold group-focus-within:text-primary transition-colors">Rs</span>
                  </div>
                  <input
                    type="number"
                    id="amountAlreadyPaid"
                    name="amountAlreadyPaid"
                    value={amountAlreadyPaid}
                    onChange={(e) => {
                      setAmountAlreadyPaid(e.target.value);
                      if (validationErrors.amountAlreadyPaid) {
                        setValidationErrors(prev => ({ ...prev, amountAlreadyPaid: "" }));
                      }
                    }}
                    placeholder="e.g. 15000"
                    className={`w-full bg-card border ${
                      validationErrors.amountAlreadyPaid ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10" : "border-border/60 focus:border-primary focus:ring-primary/10"
                    } rounded-2xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-4 transition font-bold`}
                  />
                </div>
                {validationErrors.amountAlreadyPaid && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.amountAlreadyPaid}
                  </p>
                )}
              </div>
              
              {/* Visual Math Helper */}
              {parseFloat(amountAlreadyPaid) > 0 && parseFloat(amountAlreadyPaid) <= (principal * (1 + interest / 100)) && (
                <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-primary/70">
                    <span>Total Due:</span>
                    <span>{formatLKR(principal * (1 + interest / 100))}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-primary/70">
                    <span>Historical Paid:</span>
                    <span>- {formatLKR(parseFloat(amountAlreadyPaid))}</span>
                  </div>
                  <div className="h-px bg-primary/20 w-full my-0.5" />
                  <div className="flex items-center justify-between text-xs font-black text-primary">
                    <span>Remaining Balance:</span>
                    <span>{formatLKR((principal * (1 + interest / 100)) - parseFloat(amountAlreadyPaid))}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* High-Fidelity Repayment Estimator Widget */}
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Estimated Repayment</span>
              <span className="text-3xl font-black tracking-tight text-foreground flex items-baseline gap-1">
                {formatLKR(installmentAmount)}
                <span className="text-xs font-bold text-muted-foreground">/ week</span>
              </span>
            </div>
            <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          {/* Visual principal vs interest stack progress bar */}
          {principal > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="flex justify-between items-center text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                <span>Principal ({((principal / (principal * (1 + interest / 100))) * 100).toFixed(0)}%)</span>
                <span>Interest ({(((principal * (interest / 100)) / (principal * (1 + interest / 100))) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-neutral-200 dark:bg-neutral-850 overflow-hidden flex">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(100 / (100 + interest)) * 100}%` }}
                />
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${(interest / (100 + interest)) * 100}%` }}
                />
              </div>

              {/* Financial cells */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="flex flex-col py-1.5 bg-card/40 border border-border/20 rounded-xl">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Principal</span>
                  <span className="text-xs font-black text-foreground">{formatLKR(principal)}</span>
                </div>
                <div className="flex flex-col py-1.5 bg-card/40 border border-border/20 rounded-xl">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Interest</span>
                  <span className="text-xs font-black text-amber-500">+{formatLKR((principal * interest) / 100)}</span>
                </div>
                <div className="flex flex-col py-1.5 bg-card/40 border border-border/20 rounded-xl">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Due</span>
                  <span className="text-xs font-black text-foreground">{formatLKR(principal * (1 + interest / 100))}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back and Continue Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            className="flex-1 h-14 rounded-2xl font-bold cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <Button
            type="button"
            onClick={() => handleNextStep(2)}
            className="flex-1 bg-primary hover:bg-primary/95 text-white font-black rounded-2xl h-14 text-base shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          STEP 3: CONFIRM & SUBMIT
          ────────────────────────────────────────────────────────── */}
      <div className={step === 3 ? "flex flex-col gap-6" : "hidden"}>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Review & Create Account
          </h3>
          <p className="text-xs text-muted-foreground">Verify all client details and financial parameters before creation.</p>
        </div>

        {/* Customer Review Summary Card */}
        <div className="bg-secondary/30 dark:bg-secondary/10 border border-border/40 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border/30 pb-2">
            <span className="text-xs font-black text-primary uppercase tracking-wider">Borrower Profile</span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-muted-foreground hover:text-primary hover:underline cursor-pointer"
            >
              Modify
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center text-lg font-bold text-primary">
              {isExisting && selectedCustomer?.avatarUrl ? (
                <img src={selectedCustomer.avatarUrl} alt={clientName} className="w-full h-full object-cover" />
              ) : photoPreview ? (
                <img src={photoPreview} alt={clientName} className="w-full h-full object-cover" />
              ) : (
                getInitials(clientName)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-black text-foreground truncate">{clientName}</div>
              <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Hash className="w-3.5 h-3.5 text-primary/75 shrink-0" />
                <span>{memberId || "Pending"}</span>
                <span className="text-border">•</span>
                <Phone className="w-3 h-3 text-primary/75 shrink-0" />
                <span>{phoneInput || "No Phone"}</span>
              </div>
              {clientState && (
                <div className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Collection Location: {clientState}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Terms Review Summary Card */}
        <div className="bg-secondary/30 dark:bg-secondary/10 border border-border/40 rounded-3xl p-5 space-y-3.5">
          <div className="flex justify-between items-center border-b border-border/30 pb-2">
            <span className="text-xs font-black text-primary uppercase tracking-wider">Financial Terms</span>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-bold text-muted-foreground hover:text-primary hover:underline cursor-pointer"
            >
              Modify
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Principal</span>
              <span className="font-extrabold text-foreground">{formatLKR(principal)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Repayment</span>
              <span className="font-extrabold text-foreground">{formatLKR(installmentAmount)} <span className="text-xs font-normal text-muted-foreground">/ week</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interest Rate</span>
              <span className="font-extrabold text-foreground">{interest}% (+{formatLKR((principal * interest) / 100)})</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</span>
              <span className="font-extrabold text-foreground">{weeks} Weeks</span>
            </div>
            <div className="flex flex-col col-span-2 border-t border-border/30 pt-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Repayment Amount</span>
              <span className="text-xl font-black text-primary">{formatLKR(principal * (1 + interest / 100))}</span>
            </div>
          </div>
        </div>

        {/* Schedule Forecast Card */}
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Collections Schedule Forecast</span>
          </div>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Collections are set to begin on:
          </p>
          <p className="text-sm font-black text-foreground">
            📅 {getFirstCollectionDate()}
          </p>
          <p className="text-[11px] font-bold text-muted-foreground/80 leading-normal">
            Installments of <span className="text-foreground font-black">{formatLKR(installmentAmount)}</span> will be scheduled weekly for the next {weeks} weeks.
          </p>
        </div>

        {/* Standard input components rendered as hidden to feed the formAction */}
        {!isExisting && (
          <>
            <input type="hidden" name="name" value={clientName} />
            <input type="hidden" name="phone" value={phoneInput} />
            <input type="hidden" name="memberId" value={memberId} />
            <input type="hidden" name="idNumber" value={idNumber} />
            <input type="hidden" name="companyName" value={companyName} />
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="state" value={clientState} />
            <input type="hidden" name="address" value={address} />
          </>
        )}
        {isExisting && (
          <input type="hidden" name="existingCustomerId" value={selectedCustomerId} />
        )}
        <input type="hidden" name="principal" value={principal} />
        <input type="hidden" name="interest" value={interest} />
        <input type="hidden" name="weeks" value={weeks} />
        <input type="hidden" name="isCustom" value={isCustomInstallment ? "true" : "false"} />
        <input type="hidden" name="preferredInstallment" value={preferredInstallment} />

        {/* Back and Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            className="flex-1 h-14 rounded-2xl font-bold cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-primary hover:bg-primary/95 text-white font-black rounded-2xl h-14 text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Loan...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Create Loan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modern Glassmorphic Village Creator Modal */}
      {isAddVillageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsAddVillageModalOpen(false)}
          />

          <div className="bg-card border border-border/60 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 text-left">
            <h4 className="text-base font-bold text-foreground">Add New Village</h4>
            <p className="text-xs text-muted-foreground mt-1">This village will be added to the system and selected for the client.</p>

            {modalError && (
              <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
                ⚠️ {modalError}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                value={modalVillageName}
                onChange={(e) => setModalVillageName(e.target.value)}
                placeholder="Enter village name..."
                className="w-full bg-secondary border border-border/60 focus:border-primary rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={modalIsAdding}
                required
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleModalAddVillage();
                  }
                }}
              />

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVillageModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-foreground hover:bg-secondary text-xs font-bold rounded-lg border border-border cursor-pointer transition-colors"
                  disabled={modalIsAdding}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModalAddVillage}
                  className="px-4 py-2 bg-primary text-white font-black text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer border-none"
                  disabled={modalIsAdding}
                >
                  {modalIsAdding ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Save Village"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
