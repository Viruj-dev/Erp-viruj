import Image from "next/image";
import { virujBrand } from "@/lib/viruj-brand";
import { cn } from "@/lib/utils";

export function VirujLogo({ className }: { className?: string }) {
  // Intrinsic size is intentionally generous (fluid density) so the icon stays
  // crisp when rendered larger than 48px via `className` (e.g. the auth screen).
  return (
    <Image
      src={virujBrand.logo}
      alt="Viruj Health"
      width={256}
      height={256}
      className={cn("size-12 shrink-0 object-contain", className)}
      sizes="192px"
    />
  );
}
