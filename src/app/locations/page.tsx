"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, MapPin } from "lucide-react";
import { Header, Footer } from "@/components/site";
import { apLocations } from "@/data";

export default function Locations() {
  const [query, setQuery] = useState("");
  const filtered = apLocations.filter((x) =>
    x.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page bg-[#faf9f6] min-h-screen flex flex-col">
      <Header active="locations" />

      <main className="page-main max-w-5xl mx-auto py-10 px-4 md:px-6 flex-1 w-full">
        <div className="mb-8">
          <div className="eyebrow">
            <MapPin size={13} /> Coverage Map &bull; Andhra Pradesh
          </div>
          <h1 className="serif text-3xl md:text-5xl font-bold mb-3">
            Your District. Your Voice.
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-xl leading-relaxed">
            Nivaran supports autonomous SLA escalation across all constituencies and mandals in Andhra Pradesh. Select your district to file an issue.
          </p>

          <div className="mt-6 max-w-xl">
            <div className="flex items-center gap-3 bg-white border border-line rounded-xl px-4 py-3 shadow-xs">
              <Search size={18} className="text-gray-400 flex-none" />
              <input
                aria-label="Search Andhra Pradesh locations"
                placeholder="Search district or mandal (e.g. Kakinada, Chittoor, Guntur)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-0 outline-none text-sm bg-transparent text-ink placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((location, index) => (
            <Link
              href={`/file-complaint?district=${encodeURIComponent(location)}`}
              className="card p-4 hover:border-emerald-600 hover:shadow-md transition-all group flex items-center justify-between gap-3 text-decoration-none"
              key={location}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs grid place-items-center flex-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs md:text-sm font-bold text-ink group-hover:text-green truncate m-0">
                    {location.split(",")[0]}
                  </h3>
                  <p className="text-[11px] text-muted truncate m-0">
                    {location.split(",")[1] || "Andhra Pradesh"}
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:text-green group-hover:translate-x-0.5 transition-all flex-none"
              />
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card p-8 text-center text-gray-500 text-sm max-w-md mx-auto my-8">
            No matching Andhra Pradesh location found for &ldquo;{query}&rdquo;.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
