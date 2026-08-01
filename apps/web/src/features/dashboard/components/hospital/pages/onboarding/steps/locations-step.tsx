import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { TextField } from "../fields";
import { getEmptyBranch } from "../state";
import type { Branch, OnboardingKind, OnboardingState } from "../types";

export function LocationsStep({
  data,
  kind = "hospital",
  setData,
}: {
  data: OnboardingState;
  kind?: OnboardingKind;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const [locatingBranchId, setLocatingBranchId] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<Record<string, string>>({});
  const isClinic = kind === "clinic";

  const updateBranch = (id: string, key: keyof Branch, value: string) => {
    setData((current) => ({
      ...current,
      branches: current.branches.map((branch) =>
        branch.id === id ? { ...branch, [key]: value } : branch
      ),
    }));
  };

  const updateBranchDetails = (id: string, details: Partial<Branch>) => {
    setData((current) => ({
      ...current,
      branches: current.branches.map((branch) =>
        branch.id === id ? { ...branch, ...details } : branch
      ),
    }));
  };

  const handleUseCurrentLocation = async (branch: Branch) => {
    if (!navigator.geolocation) {
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: "Location access is not supported in this browser.",
      }));
      return;
    }

    setLocatingBranchId(branch.id);
    setLocationStatus((current) => ({
      ...current,
      [branch.id]: "Requesting browser location permission...",
    }));

    try {
      const position = await getCurrentPosition();
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      const mapsLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;

      updateBranchDetails(branch.id, {
        latitude,
        longitude,
        mapsLocation,
      });
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: "Coordinates found. Looking up address...",
      }));

      const address = await reverseGeocodeLocation(latitude, longitude);
      updateBranchDetails(branch.id, {
        address: address.address || branch.address,
        city: address.city || branch.city,
        country: address.country || branch.country,
        latitude,
        longitude,
        mapsLocation,
        postalCode: address.postalCode || branch.postalCode,
        state: address.state || branch.state,
      });
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: address.address
          ? "Location filled from your current position."
          : "Coordinates filled. Add address details manually if needed.",
      }));
    } catch (error) {
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: locationErrorMessage(error),
      }));
    } finally {
      setLocatingBranchId(null);
    }
  };

  return (
    <div className="space-y-5">
      {data.branches.map((branch, index) => {
        const isLocating = locatingBranchId === branch.id;
        const status = locationStatus[branch.id];

        return (
          <section
            className="rounded-[26px] border border-slate-200/80 bg-white/78 p-5 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
            key={branch.id}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--onboarding-accent)]">
                  {index === 0 ? (isClinic ? "Primary Location" : "Main Branch") : `Branch ${index + 1}`}
                </p>
                <h3 className="font-headline text-xl font-semibold">
                  {branch.name || (isClinic ? "Clinic address" : "Branch details")}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-accent-soft)] px-3 text-xs font-bold text-[var(--onboarding-accent)] transition hover:bg-[var(--onboarding-panel)] disabled:pointer-events-none disabled:opacity-60 dark:border-cyan-300/25 dark:bg-cyan-400/[0.08] dark:text-cyan-200"
                  disabled={isLocating}
                  onClick={() => void handleUseCurrentLocation(branch)}
                  type="button"
                >
                  {isLocating ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
                  {isLocating ? "Finding location" : "Use current location"}
                </button>
                {index > 0 ? (
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-300"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        branches: current.branches.filter(
                          (item) => item.id !== branch.id
                        ),
                      }))
                    }
                    type="button"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            {status ? (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#dbeafe] bg-[#f0f9ff] px-3 py-2 text-xs font-semibold text-[var(--onboarding-accent-mid)] dark:border-cyan-300/15 dark:bg-cyan-400/[0.06] dark:text-cyan-100/80">
                {isLocating ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
                {status}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <TextField
                label={isClinic ? "Location Name" : "Branch Name"}
                onChange={(value) => updateBranch(branch.id, "name", value)}
                placeholder={isClinic ? "Main Clinic" : "Main Campus"}
                value={branch.name}
              />
              <TextField
                label="Address"
                onChange={(value) => updateBranch(branch.id, "address", value)}
                placeholder="Block A, Ring Road"
                value={branch.address}
              />
              <TextField
                label="Landmark"
                onChange={(value) => updateBranch(branch.id, "landmark", value)}
                placeholder="Near metro station"
                value={branch.landmark}
              />
              <TextField
                label="City"
                onChange={(value) => updateBranch(branch.id, "city", value)}
                placeholder="Delhi"
                value={branch.city}
              />
              <TextField
                label="State"
                onChange={(value) => updateBranch(branch.id, "state", value)}
                placeholder="Delhi"
                value={branch.state}
              />
              <TextField
                label="Country"
                onChange={(value) => updateBranch(branch.id, "country", value)}
                placeholder="India"
                value={branch.country}
              />
              <TextField
                label={isClinic ? "Pincode" : "Postal Code"}
                onChange={(value) => updateBranch(branch.id, "postalCode", value)}
                placeholder="110001"
                value={branch.postalCode}
              />
              <TextField
                label="Google Maps Location"
                onChange={(value) =>
                  updateBranch(branch.id, "mapsLocation", value)
                }
                placeholder="https://maps.google.com/..."
                value={branch.mapsLocation}
              />
              <TextField
                label="Latitude"
                onChange={(value) => updateBranch(branch.id, "latitude", value)}
                placeholder="28.6139"
                value={branch.latitude}
              />
              <TextField
                label="Longitude"
                onChange={(value) => updateBranch(branch.id, "longitude", value)}
                placeholder="77.2090"
                value={branch.longitude}
              />
            </div>
          </section>
        );
      })}

      <button
        className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] border border-dashed border-[var(--onboarding-border-strong)] bg-[var(--onboarding-accent-soft)] text-sm font-bold text-[var(--onboarding-accent)] transition hover:-translate-y-0.5 hover:bg-[var(--onboarding-panel)] dark:border-cyan-300/25 dark:bg-cyan-400/[0.08] dark:text-cyan-200"
        onClick={() =>
          setData((current) => ({
            ...current,
            branches: [...current.branches, getEmptyBranch(false, kind)],
          }))
        }
        type="button"
      >
        <Plus size={18} />
        {isClinic ? "Add another location" : "Add another branch"}
      </button>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.branches.map((branch) => (
          <div
            className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
            key={`${branch.id}-card`}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)] dark:bg-cyan-400/10 dark:text-cyan-300">
                <MapPin size={18} />
              </span>
              <div>
                <p className="font-bold">{branch.name || "Unnamed location"}</p>
                <p className="text-xs font-semibold text-slate-500">
                  {[branch.city, branch.state].filter(Boolean).join(", ") ||
                    "Location pending"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ReverseGeocodeResult = {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
};

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 60_000,
      timeout: 12_000,
    });
  });
}

async function reverseGeocodeLocation(
  latitude: string,
  longitude: string,
): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&addressdetails=1`,
    );

    if (!response.ok) return emptyReverseGeocodeResult();

    const payload = (await response.json()) as {
      address?: Record<string, string | undefined>;
      display_name?: string;
    };
    const address = payload.address ?? {};
    const roadAddress = [
      address.house_number,
      address.road,
      address.neighbourhood,
      address.suburb,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      address: roadAddress || payload.display_name || "",
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        "",
      country: address.country || "",
      postalCode: address.postcode || "",
      state: address.state || address.state_district || "",
    };
  } catch {
    return emptyReverseGeocodeResult();
  }
}

function emptyReverseGeocodeResult(): ReverseGeocodeResult {
  return {
    address: "",
    city: "",
    country: "",
    postalCode: "",
    state: "",
  };
}

function locationErrorMessage(error: unknown) {
  if (error instanceof GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
      return "Location permission was denied. Allow location access and try again.";
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      return "Current location is unavailable. Enter the address manually.";
    }
    if (error.code === error.TIMEOUT) {
      return "Location lookup timed out. Try again or enter the address manually.";
    }
  }

  return "Unable to fetch current location. Enter the address manually.";
}
