"use client";

import { useState } from "react";
import { ANNUAL_SPEND_OPTIONS } from "@/lib/constants/bag-options";
import type { LeadData } from "@/lib/types/quote";

interface Props {
  onSubmit: (data: {
    full_name: string;
    business_name: string;
    email: string;
    phone: string;
    annual_spend: string;
  }) => void;
  /** Called when a returning lead clicks "Continue" without re-submitting. */
  onContinueExisting?: () => void;
  /** Pre-filled lead data for returning visitors. */
  existingLead?: LeadData | null;
  isSubmitting?: boolean;
}

interface FormErrors {
  full_name?: string;
  business_name?: string;
  email?: string;
  phone?: string;
  annual_spend?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadCaptureForm({ onSubmit, onContinueExisting, existingLead, isSubmitting = false }: Props) {
  const [showForm, setShowForm] = useState(!existingLead);
  const [fullName, setFullName] = useState(existingLead?.full_name ?? "");
  const [businessName, setBusinessName] = useState(existingLead?.business_name ?? "");
  const [email, setEmail] = useState(existingLead?.email ?? "");
  const [phone, setPhone] = useState(existingLead?.phone ?? "");
  const [annualSpend, setAnnualSpend] = useState(existingLead?.annual_spend ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!fullName.trim()) {
      next.full_name = "Full name is required";
    }
    if (!businessName.trim()) {
      next.business_name = "Business name is required";
    }
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Enter a valid email address";
    }
    if (!phone.trim()) {
      next.phone = "Phone number is required";
    }
    if (!annualSpend) {
      next.annual_spend = "Please select your annual spend";
    }

    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      full_name: fullName.trim(),
      business_name: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      annual_spend: annualSpend,
    });
  }

  // Returning-lead welcome-back view
  if (existingLead && !showForm) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-gray-10 bg-gray-05 p-5 space-y-2">
          <p className="text-sm font-medium text-gray-90">
            Welcome back, {existingLead.full_name}!
          </p>
          <p className="text-sm text-gray-60">
            {existingLead.business_name} &middot; {existingLead.email}
          </p>
        </div>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onContinueExisting}
          className="w-full rounded-lg bg-calyx-blue px-6 py-3 text-sm font-semibold text-white hover:bg-ocean-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Loading..." : "See My Price"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full text-sm text-gray-60 hover:text-gray-90 transition-colors"
        >
          Not you? Enter different info
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-90 mb-1"
        >
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-gray-10 px-3 py-2 text-gray-90 placeholder:text-gray-30 focus:border-calyx-blue focus:ring-1 focus:ring-calyx-blue outline-none transition-colors"
          placeholder="Jane Smith"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>

      {/* Business Name */}
      <div>
        <label
          htmlFor="business_name"
          className="block text-sm font-medium text-gray-90 mb-1"
        >
          Business Name
        </label>
        <input
          id="business_name"
          type="text"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-lg border border-gray-10 px-3 py-2 text-gray-90 placeholder:text-gray-30 focus:border-calyx-blue focus:ring-1 focus:ring-calyx-blue outline-none transition-colors"
          placeholder="Acme Foods Inc."
        />
        {errors.business_name && (
          <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-90 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-10 px-3 py-2 text-gray-90 placeholder:text-gray-30 focus:border-calyx-blue focus:ring-1 focus:ring-calyx-blue outline-none transition-colors"
          placeholder="jane@acmefoods.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-90 mb-1"
        >
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-gray-10 px-3 py-2 text-gray-90 placeholder:text-gray-30 focus:border-calyx-blue focus:ring-1 focus:ring-calyx-blue outline-none transition-colors"
          placeholder="(555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Annual Spend */}
      <div>
        <label
          htmlFor="annual_spend"
          className="block text-sm font-medium text-gray-90 mb-1"
        >
          Annual Packaging Spend
        </label>
        <select
          id="annual_spend"
          required
          value={annualSpend}
          onChange={(e) => setAnnualSpend(e.target.value)}
          className="w-full rounded-lg border border-gray-10 px-3 py-2 text-gray-90 focus:border-calyx-blue focus:ring-1 focus:ring-calyx-blue outline-none transition-colors"
        >
          <option value="" disabled>
            Select a range
          </option>
          {ANNUAL_SPEND_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.annual_spend && (
          <p className="mt-1 text-sm text-red-600">{errors.annual_spend}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-calyx-blue px-6 py-3 text-sm font-semibold text-white hover:bg-ocean-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Submitting..." : "See My Price"}
      </button>
    </form>
  );
}
