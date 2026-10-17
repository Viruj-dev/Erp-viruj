"use client";
import Image from "next/image";
import { useState } from "react";
export function DoctorAvatar({
  name,
  imageUrl,
  gender,
  className = "size-14",
  tone = "clinic",
}: {
  name: string;
  imageUrl?: string;
  gender?: string;
  className?: string;
  tone?: string;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const accent =
    tone === "clinic" ? "#7c3aed" : tone === "doctor" ? "#059669" : "#2563eb";
  const female = gender === "female",
    male = gender === "male";
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-2xl ${className}`}
      style={{ background: `${accent}14`, color: accent }}
    >
      {imageUrl && failedUrl !== imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          sizes="80px"
          className="object-cover"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <svg
          viewBox="0 0 80 80"
          role="img"
          aria-label={`${name}, ${female ? "female" : male ? "male" : "doctor"} avatar`}
        >
          {female && (
            <path
              d="M20 48V27C20 4 60 4 60 27V50Z"
              fill="currentColor"
              opacity=".8"
            />
          )}
          <path d="M8 80V67C8 42 72 42 72 67V80" fill="white" />
          <path d="M31 49L40 62L49 49V43H31Z" fill="#e8b99c" />
          <ellipse cx="40" cy="30" rx="15" ry="19" fill="#f1c7aa" />
          {female ? (
            <path
              d="M24 30C20 8 55 4 57 28C45 23 39 15 38 15C35 24 28 28 24 30"
              fill="currentColor"
            />
          ) : male ? (
            <path
              d="M25 28L23 21C24 5 57 5 57 25L54 29L51 19L30 22L27 30Z"
              fill="currentColor"
            />
          ) : (
            <path
              d="M24 25C24 6 56 6 56 25H24"
              fill="currentColor"
              opacity=".7"
            />
          )}
          <circle cx="35" cy="31" r="1.4" fill="#49342c" />
          <circle cx="45" cy="31" r="1.4" fill="#49342c" />
          <path
            d="M36 39Q40 42 44 39"
            fill="none"
            stroke="#a56c55"
            strokeWidth="1.6"
          />
          <path
            d="M28 51V63Q28 74 40 74Q52 74 52 63V51"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
          />
          <circle cx="40" cy="73" r="4" fill="currentColor" />
          <path
            d="M61 58V68M56 63H66"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
      )}
    </span>
  );
}
