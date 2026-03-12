"use client";

import { useState, useEffect } from "react";
import type { LeadData } from "@/lib/types/quote";

const STORAGE_KEY = "calyx_lead_session";

export function useLeadSession() {
  const [lead, setLead] = useState<LeadData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLead(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveLead = (data: LeadData) => {
    setLead(data);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const clearLead = () => {
    setLead(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return { lead, saveLead, clearLead, isLoaded };
}
