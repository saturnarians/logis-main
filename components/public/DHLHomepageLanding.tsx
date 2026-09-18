"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TawkMessenger } from "./tawk";
import {
  ArrowUp,
  ArrowUpRight,
  Building2,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Menu,
  ReceiptText,
  Search,
  Youtube,
} from "lucide-react";

export function DHLHomepageLanding() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState("DHL-8942-01");

  const handleTrackSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const code = trackingInput.trim();
    router.push(
      code ? `/track?id=${encodeURIComponent(code.toUpperCase())}` : "/track",
    );
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
      <header className="w-full">
        <div className="hidden bg-[var(--dhl-yellow)] md:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <Link
                href="#"
                className="dhl-logo flex items-center space-x-1 py-2"
              >
                <span className="dhl-stripes" />
                <span className="text-[var(--dhl-red)] text-3xl font-black italic tracking-tighter">
                  DHL
                </span>
              </Link>

              <div className="flex items-center space-x-8 text-sm font-medium text-[var(--text-primary)]">
                <Link
                  href="/track"
                  className="flex items-center transition-colors hover:underline"
                >
                  <span>Find a Service Point</span>
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => router.push("/track")}
                  className="flex items-center transition-colors hover:underline focus:outline-none"
                >
                  <Search className="mr-2 h-3.5 w-3.5" />
                  <span>Search</span>
                </button>
                <Link
                  href="/track"
                  className="flex items-center transition-colors hover:underline"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Nigeria</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden border-b border-[var(--glass-border-subtle)] bg-[var(--surface-raised)] shadow-sm md:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
              <div className="flex items-center space-x-8">
                <Link
                  href="/track"
                  className="border-b-2 border-transparent py-3 transition-colors hover:border-[var(--dhl-red)] hover:text-[var(--dhl-red)]"
                >
                  Track
                </Link>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => router.push("/track")}
                    className="flex items-center py-3 transition-colors hover:text-[var(--dhl-red)] focus:outline-none"
                  >
                    <span>Ship</span>
                    <ChevronDown className="ml-1 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  </button>
                </div>
                <Link
                  href="/track"
                  className="border-b-2 border-transparent py-3 transition-colors hover:border-[var(--dhl-red)] hover:text-[var(--dhl-red)]"
                >
                  Customer Service
                </Link>
              </div>
              {/* <div>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="flex items-center py-3 transition-colors hover:text-[var(--dhl-red)] focus:outline-none"
                >
                  <span>Customer Portal Logins</span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                </button>
              </div> */}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[var(--dhl-yellow)] px-4 py-3 shadow-md md:hidden">
          <Link href="#" className="dhl-logo flex items-center space-x-1">
            <span className="dhl-stripes" />
            <span className="text-[var(--dhl-red)] text-2xl font-black italic tracking-tighter">
              DHL
            </span>
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            className="p-1 text-2xl text-[var(--text-primary)] focus:outline-none"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-3 border-b border-[var(--glass-border-subtle)] bg-[var(--surface-raised)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-lg md:hidden">
            <Link
              href="/track"
              className="block border-b border-[var(--glass-border-subtle)] py-2 transition-colors hover:text-[var(--dhl-red)]"
            >
              Track
            </Link>
            <Link
              href="/track"
              className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] py-2 transition-colors hover:text-[var(--dhl-red)]"
            >
              <span>Ship</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/track"
              className="block border-b border-[var(--glass-border-subtle)] py-2 transition-colors hover:text-[var(--dhl-red)]"
            >
              Customer Service
            </Link>
            {/* <Link
              href="/login"
              className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] py-2 transition-colors hover:text-[var(--dhl-red)]"
            >
              <span>Customer Portal Logins</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link> */}
            <div className="flex justify-between border-t border-[var(--glass-border-subtle)] pt-2 text-xs font-normal text-[var(--text-secondary)]">
              <Link href="/track" className="flex items-center">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                Service Points
              </Link>
              <Link href="/track" className="flex items-center">
                <Globe className="mr-1 h-3.5 w-3.5" />
                Nigeria
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <section className="hero-bg relative min-h-[480px] px-4 pb-20 pt-10 sm:px-6 md:pb-32 lg:px-8">
          <div className="mx-auto max-w-5xl w-full pt-4 text-center md:pt-8 md:text-left">
            <h1 className="mb-6 text-2xl font-extrabold tracking-normal text-white drop-shadow-md sm:text-3xl md:text-4xl">
              Track Your Shipment
            </h1>

            <div className="w-full max-w-4xl">
              <form
                onSubmit={handleTrackSubmit}
                className="hidden items-center rounded-xl bg-white p-1.5 pl-6 shadow-2xl md:flex"
              >
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(event) => setTrackingInput(event.target.value)}
                  placeholder="Enter your tracking number(s)"
                  className="w-full bg-transparent pr-4 text-base font-normal text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-lg bg-[var(--dhl-red)] px-10 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--dhl-red-hover)]"
                >
                  Track
                </button>
              </form>

              <form
                onSubmit={handleTrackSubmit}
                className="space-y-3 rounded-2xl bg-white p-3 shadow-xl md:hidden"
              >
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(event) => setTrackingInput(event.target.value)}
                  placeholder="Enter your tracking number(s)"
                  className="w-full rounded-xl border border-[var(--glass-border-subtle)] p-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--dhl-yellow)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[var(--dhl-red)] py-3.5 text-base font-bold text-white shadow transition-colors hover:bg-[var(--dhl-red-hover)]"
                >
                  Track
                </button>
              </form>
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-8 w-full max-w-5xl md:-mb-24">
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[var(--glass-border-subtle)] bg-white shadow-xl divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
              <Link
                href="/track"
                className="group flex flex-col items-center justify-between p-6 text-center transition-colors hover:bg-[var(--surface-sunken)]"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-3 text-3xl text-[var(--dhl-red)] transition-transform group-hover:scale-110">
                    <CalendarRange className="h-8 w-8" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-[var(--text-primary)]">
                    Ship Now
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Find the right service
                  </p>
                </div>
              </Link>

              <Link
                href="/track"
                className="group flex flex-col items-center justify-between p-6 text-center transition-colors hover:bg-[var(--surface-sunken)]"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-3 text-3xl text-[var(--dhl-red)] transition-transform group-hover:scale-110">
                    <ReceiptText className="h-8 w-8" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-[var(--text-primary)]">
                    Get a Quote
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Estimate cost to share and compare
                  </p>
                </div>
              </Link>

              <Link
                href="/#"
                className="group relative flex flex-col items-center justify-between p-6 text-center transition-colors hover:bg-[var(--surface-sunken)]"
              >
                <div className="yellow-corner-badge" />
                <div className="flex flex-col items-center">
                  <div className="mb-3 text-3xl text-[var(--dhl-red)] transition-transform group-hover:scale-110">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-[var(--text-primary)]">
                    DHL for Business
                  </h3>
                  <p className="max-w-xs text-xs leading-relaxed text-[var(--text-secondary)]">
                    Shipping regularly? Request a business account and profit
                    from exclusive benefits
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-16 max-w-7xl px-4 pt-16 sm:px-6 md:mt-36 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--glass-border-subtle)] bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="relative h-64 overflow-hidden sm:h-72">
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80"
                  alt="DHL electric courier van"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex flex-grow flex-col justify-between p-6 md:p-8">
                <div>
                  <Link
                    href="#"
                    className="group mb-3 inline-flex items-center text-xl font-extrabold text-[var(--text-primary)] hover:text-[var(--dhl-red)]"
                  >
                    <span>Sustainability</span>
                    <ChevronRight className="ml-2 h-4 w-4 text-[var(--dhl-red)] transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    Sustainable business begins with low carbon supply chains.
                    Find out what we have to offer and how we integrate
                    sustainability into our operations to reduce environmental
                    impacts for your supply chain.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--glass-border-subtle)] bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="relative h-64 overflow-hidden sm:h-72">
                <img
                  src="https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=1000&q=80"
                  alt="DHL logistics and connectivity"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex flex-grow flex-col justify-between p-6 md:p-8">
                <div>
                  <Link
                    href="#"
                    className="group mb-3 inline-flex items-center text-xl font-extrabold text-[var(--text-primary)] hover:text-[var(--dhl-red)]"
                  >
                    <span>Globalization holds firm at a record level</span>
                    <ArrowUpRight className="ml-2 h-4 w-4 text-[var(--dhl-red)]" />
                  </Link>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    The DHL Global Connectedness Report 2026 offers the most
                    comprehensive view of globalization available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--glass-border-subtle)] bg-[var(--surface-raised)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-4 text-base font-bold text-[var(--dhl-red)]">
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm font-medium text-[var(--text-secondary)]">
                <li>
                  <Link
                    href="/track"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    Customer Service
                  </Link>
                </li>
                <li>
                  {/* <Link
                    href="/login"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    Customer Portal Logins
                  </Link> */}
                </li>
                <li>
                  <Link
                    href="/login"
                    className="inline-flex items-center transition-colors hover:text-[var(--dhl-red)]"
                  >
                    <span>Developer Portal</span>
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/track"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    Get a Quote
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    DHL for Business
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-base font-bold text-[var(--text-primary)]">
                Our Divisions
              </h4>
              <ul className="space-y-3 text-sm font-medium text-[var(--text-secondary)]">
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    DHL Express
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    DHL Global Forwarding
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    Other Global Divisions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-base font-bold text-[var(--text-primary)]">
                Company Information
              </h4>
              <ul className="space-y-3 text-sm font-medium text-[var(--text-secondary)]">
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    About DHL
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="inline-flex items-center transition-colors hover:text-[var(--dhl-red)]"
                  >
                    <span>Delivered</span>
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="inline-flex items-center transition-colors hover:text-[var(--dhl-red)]"
                  >
                    <span>Careers</span>
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    Press Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="inline-flex items-center transition-colors hover:text-[var(--dhl-red)]"
                  >
                    <span>Investors</span>
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-[var(--dhl-red)]"
                  >
                    Brand Partnerships
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative border-t border-[var(--glass-border-subtle)] bg-[var(--surface-sunken)] py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div className="flex items-center space-x-1">
                <span
                  className="dhl-stripes"
                  style={{ height: "14px", width: "24px" }}
                />
                <span className="text-xl font-black italic tracking-tighter text-[var(--text-primary)]">
                  DHL
                </span>
                <span className="ml-1 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                  Group
                </span>
              </div>

              <div className="flex items-center space-x-5">
                <span className="mr-1 text-xs font-bold text-[var(--text-primary)]">
                  Follow Us
                </span>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="text-lg text-[var(--text-primary)] transition-colors hover:text-[var(--dhl-red)]"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="text-lg text-[var(--text-primary)] transition-colors hover:text-[var(--dhl-red)]"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="text-lg text-[var(--text-primary)] transition-colors hover:text-[var(--dhl-red)]"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-lg text-[var(--text-primary)] transition-colors hover:text-[var(--dhl-red)]"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="mt-6 flex flex-col justify-between space-y-3 border-t border-[var(--glass-border-subtle)] pt-4 text-xs text-[var(--text-secondary)] md:flex-row md:items-center md:space-y-0">
              <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium">
                <Link
                  href="#"
                  className="transition-colors hover:text-[var(--dhl-red)]"
                >
                  Fraud Awareness
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-[var(--dhl-red)]"
                >
                  Legal Notice
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-[var(--dhl-red)]"
                >
                  Terms of Use
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-[var(--dhl-red)]"
                >
                  Privacy Notice
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-[var(--dhl-red)]"
                >
                  Additional Information
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-[var(--dhl-red)]"
                >
                  Cookie Settings
                </Link>
              </div>
              <div className="font-normal text-[var(--text-tertiary)]">
                2026 © - all rights reserved
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Scroll to top"
            onClick={handleScrollToTop}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--dhl-red)] text-white shadow-lg transition-all hover:bg-[var(--dhl-red-hover)] focus:outline-none"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </footer>
      <TawkMessenger />
    </div>
  );
}
