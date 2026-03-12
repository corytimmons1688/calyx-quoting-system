"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface TierPrice {
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface MethodPricing {
  tiers: TierPrice[];
}

interface Quote {
  id: string;
  created_at: string;
  specifications: Record<string, string | number | number[]>;
  pricing_digital: MethodPricing | null;
  pricing_flexo: MethodPricing | null;
  pricing_intl_air: MethodPricing | null;
  pricing_intl_ocean: MethodPricing | null;
}

interface LeadQuotesData {
  lead: { full_name: string; business_name: string; email: string };
  quotes: Quote[];
}

const currencyFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyUnit = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const numberFmt = new Intl.NumberFormat("en-US");

function formatDims(specs: Record<string, string | number | number[]>): string {
  const w = specs.width;
  const h = specs.height;
  const g = specs.gusset;
  if (g && Number(g) > 0) return `${w}" x ${h}" x ${g}"`;
  return `${w}" x ${h}"`;
}

function MethodSummary({
  label,
  pricing,
}: {
  label: string;
  pricing: MethodPricing | null;
}) {
  if (!pricing || !pricing.tiers || pricing.tiers.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-90">{label}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {pricing.tiers.map((t) => (
          <span key={t.quantity} className="text-xs text-gray-60">
            {numberFmt.format(t.quantity)}: {currencyUnit.format(t.unit_price)}/ea ({currencyFull.format(t.total_price)})
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LeadQuotesPage() {
  const params = useParams();
  const leadId = params.leadId as string;
  const [data, setData] = useState<LeadQuotesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch(`/api/v1/quotes/lead/${leadId}`);
        if (!res.ok) throw new Error("Not found");
        setData(await res.json());
      } catch {
        setError("Unable to load quotes.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, [leadId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {loading && (
          <p className="text-gray-60 text-sm">Loading quotes...</p>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-90">
                Quotes for {data.lead.business_name}
              </h1>
              <p className="mt-1 text-sm text-gray-60">
                {data.lead.full_name} &middot; {data.lead.email}
              </p>
            </div>

            {data.quotes.length === 0 ? (
              <p className="text-gray-60">No quotes found.</p>
            ) : (
              <div className="space-y-6">
                {data.quotes.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-gray-10 bg-white p-5 shadow-sm space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-gray-90">
                          {formatDims(q.specifications)} {q.specifications.seal_type}
                        </h2>
                        <p className="text-xs text-gray-60 mt-0.5">
                          {q.specifications.substrate}, {q.specifications.finish}
                          {q.specifications.zipper !== "None" && ` / ${q.specifications.zipper} Zipper`}
                          {q.specifications.embellishment !== "None" && ` / ${q.specifications.embellishment}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-30 font-mono">{q.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-60">
                          {new Date(q.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Pricing by method */}
                    <div className="space-y-3 border-t border-gray-10 pt-3">
                      <MethodSummary label="Digital" pricing={q.pricing_digital} />
                      <MethodSummary label="Flexographic" pricing={q.pricing_flexo} />
                      <MethodSummary label="International Air" pricing={q.pricing_intl_air} />
                      <MethodSummary label="International Ocean" pricing={q.pricing_intl_ocean} />
                      {!q.pricing_digital && !q.pricing_flexo && !q.pricing_intl_air && !q.pricing_intl_ocean && (
                        <p className="text-xs text-gray-60">No pricing available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
