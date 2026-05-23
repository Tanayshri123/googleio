"use client";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "India",
  "Australia",
  "Singapore",
  "Japan",
  "Brazil",
  "Mexico",
  "Other",
];

type Props = {
  city: string;
  country: string;
  onCityChange: (v: string) => void;
  onCountryChange: (v: string) => void;
};

export function LocationFields({
  city,
  country,
  onCityChange,
  onCountryChange,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          City
        </label>
        <input
          type="text"
          placeholder="Austin"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Country
        </label>
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
        >
          <option value="">Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
