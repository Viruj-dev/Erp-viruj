import Image from "next/image";
import { virujBrand } from "@/lib/viruj-brand";
import { cn } from "@/lib/utils";

export function VirujLogo({ className }: { className?: string }) {
  return (
    <Image
      src={virujBrand.logo}
      alt="Viruj Health"
      width={48}
      height={48}
      className={cn("size-12 shrink-0 object-contain", className)}
    />
  );
}
