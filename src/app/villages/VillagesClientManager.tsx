"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Trash2, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { createSystemVillage, deleteSystemVillage } from "@/app/actions";

type VillageStat = {
  name: string;
  clientCount: number;
};

interface VillagesClientManagerProps {
  initialStats: VillageStat[];
}

export default function VillagesClientManager({ initialStats }: VillagesClientManagerProps) {
  const [stats, setStats] = useState<VillageStat[]>(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [newVillageName, setNewVillageName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isAdding, startAddingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const handleAddVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newVillageName.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Client side duplicate check
    if (stats.some(v => v.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage("Village already exists.");
      return;
    }

    startAddingTransition(async () => {
      const res = await createSystemVillage(trimmed);
      if (res.success) {
        setStats(prev => [...prev, { name: trimmed, clientCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
        setNewVillageName("");
        setSuccessMessage(`Village "${trimmed}" added successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || "Failed to add village.");
      }
    });
  };

  const handleDeleteVillage = (villageName: string) => {
    const target = stats.find(v => v.name === villageName);
    if (!target) return;

    if (target.clientCount > 0) {
      setErrorMessage("Cannot delete a village that is assigned to active clients.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletingName(villageName);

    startDeletingTransition(async () => {
      const res = await deleteSystemVillage(villageName);
      if (res.success) {
        setStats(prev => prev.filter(v => v.name !== villageName));
        setSuccessMessage(`Village "${villageName}" deleted.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || "Failed to delete village.");
      }
      setDeletingName(null);
    });
  };

  const filteredStats = stats.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-left">
        <h3 className="text-lg font-bold text-foreground">Route Villages Registry</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Create and manage areas independently. Registered areas will be selectable from the dropdown when creating client accounts.
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-3 rounded-xl text-xs font-medium leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 p-3 rounded-xl text-xs font-medium leading-relaxed">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add Area Form */}
      <form onSubmit={handleAddVillage} className="flex gap-2.5 items-stretch">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={newVillageName}
            onChange={(e) => setNewVillageName(e.target.value)}
            disabled={isAdding}
            placeholder="Enter new village name..."
            className="w-full bg-secondary/70 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isAdding || !newVillageName.trim()}
          className="h-10 px-4 bg-primary hover:bg-primary/95 disabled:opacity-50 text-primary-foreground font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none shrink-0"
        >
          {isAdding ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Area
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search registered villages..."
          className="w-full bg-secondary/50 border border-border/80 rounded-xl pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-border transition-all"
        />
      </div>

      {/* Villages List */}
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {filteredStats.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground italic border border-dashed border-border rounded-xl">
            {searchQuery ? "No matching villages found." : "No villages registered yet."}
          </div>
        ) : (
          filteredStats.map(v => {
            const isDeletingThis = deletingName === v.name && isDeleting;
            const hasClients = v.clientCount > 0;

            return (
              <div
                key={v.name}
                className="flex items-center justify-between p-3 bg-secondary/20 hover:bg-secondary/40 border border-border/50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground"><MapPin className="w-4 h-4" /></div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-foreground">{v.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {v.clientCount} {v.clientCount === 1 ? "Client" : "Clients"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteVillage(v.name)}
                  disabled={isDeleting || hasClients}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border-none ${
                    hasClients
                      ? "text-muted-foreground/40 bg-secondary/30 cursor-not-allowed"
                      : "text-destructive hover:bg-destructive/10 bg-transparent cursor-pointer"
                  }`}
                  title={hasClients ? "Cannot delete village assigned to active clients" : "Delete village"}
                >
                  {isDeletingThis ? (
                    <div className="w-3.5 h-3.5 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
