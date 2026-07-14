"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getContactConfig,
  getServices,
  submitEnquiry,
  type ContactConfig,
  type PublicService,
} from "@/lib/public-api";
import type { ApiError } from "@/lib/api-client";

const ENQUIRY_LABELS: Record<string, string> = {
  BrandOwner: "Brand Owner",
  Distributor: "Distributor",
  General: "General",
  Other: "Other",
};

type ContactFormProps = {
  title?: string | null;
  description?: string | null;
};

export function ContactForm({ title, description }: ContactFormProps) {
  const [config, setConfig] = useState<ContactConfig | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [enquiryType, setEnquiryType] = useState("General");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([getContactConfig(), getServices()])
      .then(([cfg, svc]) => {
        setConfig(cfg);
        setServices(svc);
        if (cfg.enquiryTypes?.length) {
          setEnquiryType(cfg.enquiryTypes.includes("General") ? "General" : cfg.enquiryTypes[0]);
        }
      })
      .catch(() => setError("Unable to load contact form."));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await submitEnquiry({
        name,
        email,
        phone: phone || null,
        company: company || null,
        enquiryType,
        subject,
        message,
        serviceId: serviceId || null,
        consent,
        captchaToken: null,
        website: website || null,
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setSubject("");
      setMessage("");
      setServiceId("");
      setConsent(false);
      setWebsite("");
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError?.status === 429) {
        setError("Too many submissions. Please wait a few minutes and try again.");
      } else {
        setError(apiError?.message?.includes("CAPTCHA")
          ? "CAPTCHA verification failed. Please try again."
          : "Unable to send your enquiry. Please check the fields and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const types = config?.enquiryTypes ?? ["BrandOwner", "Distributor", "General", "Other"];

  return (
    <section className="border-b border-[var(--border)] bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
            Contact
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            {title ?? "Tell us how we can help"}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--ink-muted)]">
            {description ??
              "One form for brand owners, distributors, and partners. We respond from Dubai across Generio markets."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="relative space-y-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[var(--ink)]">Name *</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[var(--ink)]">Email *</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[var(--ink)]">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[var(--ink)]">Company</span>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[var(--ink)]">Enquiry type *</span>
              <select required value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2">
                {types.map((type) => (
                  <option key={type} value={type}>
                    {ENQUIRY_LABELS[type] ?? type}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[var(--ink)]">Interested service</span>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2">
                <option value="">Not sure yet</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--ink)]">Subject *</span>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--ink)]">Message *</span>
            <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 outline-none ring-[var(--brand-primary)] focus:ring-2" />
          </label>

          {/* Honeypot — hidden from users */}
          <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>

          <label className="flex items-start gap-3 text-sm text-[var(--ink-muted)]">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>I agree to be contacted by Generio about this enquiry. *</span>
          </label>

          {config?.captchaEnabled ? (
            <p className="text-xs text-[var(--ink-muted)]">
              CAPTCHA is enabled on this environment. Configure Turnstile keys for production.
            </p>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? (
            <p className="text-sm text-emerald-700">
              Thank you — your enquiry is with the Generio team. We will respond shortly.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex rounded-full bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-dark)] disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      </div>
    </section>
  );
}
