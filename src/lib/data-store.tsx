"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Package } from "./types";
import { getPackages } from "@/app/actions/tracking";

interface PackageContextType {
  packages: Package[];
  setPackages: (packages: Package[]) => void;
  isLoading: boolean;
  refreshPackages: () => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export function PackageProvider({ 
  children,
  initialData = []
}: { 
  children: ReactNode,
  initialData?: Package[] 
}) {
  const [packages, setPackages] = useState<Package[]>(initialData);
  const [isLoading, setIsLoading] = useState(initialData.length === 0);

  const refreshPackages = async () => {
    setIsLoading(true);
    try {
      const liveData = await getPackages();
      setPackages(liveData);
    } catch (err) {
      console.error("Failed to refresh packages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Se não vier dados iniciais (Server Side Render), a gente tenta buscar.
  useEffect(() => {
    if (packages.length === 0) {
      refreshPackages();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PackageContext.Provider value={{ packages, setPackages, isLoading, refreshPackages }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const ctx = useContext(PackageContext);
  if (!ctx) throw new Error("usePackages must be used within PackageProvider");
  return ctx;
}
