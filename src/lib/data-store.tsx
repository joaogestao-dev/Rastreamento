"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Package } from "./types";
import { mockPackages } from "./mock-data";

interface PackageContextType {
  packages: Package[];
  setPackages: (packages: Package[]) => void;
  upsertPackages: (incoming: Package[]) => void;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<Package[]>(mockPackages);

  const upsertPackages = useCallback((incoming: Package[]) => {
    setPackages((prev) => {
      const updated = [...prev];
      for (const pkg of incoming) {
        const existingIdx = updated.findIndex(
          (p) =>
            p.tracking_code === pkg.tracking_code &&
            p.last_update === pkg.last_update
        );
        if (existingIdx >= 0) {
          updated[existingIdx] = { ...updated[existingIdx], ...pkg };
        } else {
          const sameTracking = updated.find(
            (p) => p.tracking_code === pkg.tracking_code
          );
          updated.push({
            ...pkg,
            id: String(Date.now() + Math.random()),
            order_id: sameTracking?.order_id || pkg.order_id,
          });
        }
      }
      return updated;
    });
  }, []);

  return (
    <PackageContext.Provider value={{ packages, setPackages, upsertPackages }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const ctx = useContext(PackageContext);
  if (!ctx) throw new Error("usePackages must be used within PackageProvider");
  return ctx;
}
