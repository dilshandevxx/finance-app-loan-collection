import { Installment, Loan } from "@/data/db";

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in the browser"));
      return;
    }
    const request = window.indexedDB.open("FinanceAppCache", 1);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keyval")) {
        db.createObjectStore("keyval");
      }
    };
  });
}

export async function getCacheItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("keyval", "readonly");
      const store = transaction.objectStore("keyval");
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("IndexedDB getCacheItem failed for key", key, error);
    return null;
  }
}

export async function setCacheItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("keyval", "readwrite");
      const store = transaction.objectStore("keyval");
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("IndexedDB setCacheItem failed for key", key, error);
  }
}

export async function updateLocalInstallmentPaid(installmentId: string, amount: number): Promise<void> {
  try {
    // 1. Update installment status in cache
    const installments = await getCacheItem<Installment[]>("installments");
    let loanId = "";
    if (installments) {
      const updatedInstallments = installments.map((inst) => {
        if (inst.id === installmentId) {
          loanId = inst.loanId;
          return {
            ...inst,
            status: "PAID" as const,
            paidDate: new Date().toISOString(), // store full timestamp with timezone
          };
        }
        return inst;
      });
      await setCacheItem("installments", updatedInstallments);
    }

    // 2. Update loan remaining balance in cache
    if (loanId) {
      const loans = await getCacheItem<Loan[]>("loans");
      if (loans) {
        const updatedLoans = loans.map((loan) => {
          if (loan.id === loanId) {
            const newBalance = Math.max(0, loan.remainingBalance - amount);
            return {
              ...loan,
              remainingBalance: newBalance,
              status: newBalance <= 0 ? ("PAID_OFF" as const) : loan.status,
            };
          }
          return loan;
        });
        await setCacheItem("loans", updatedLoans);
      }
    }
  } catch (error) {
    console.error("Failed to update local installment paid in IndexedDB", error);
  }
}
