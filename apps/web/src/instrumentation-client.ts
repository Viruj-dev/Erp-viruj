import posthog from "posthog-js";
import { getAnalyticsPath } from "@/lib/analytics-route";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    persistence: "localStorage",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_exceptions: false,
    disable_session_recording: true,
    advanced_enable_surveys: false,
    save_campaign_params: false,
    save_referrer: false,
    property_blacklist: [
      "$set",
      "$set_once",
      "$referrer",
      "$initial_referrer",
      "$initial_current_url",
      "$initial_pathname",
      "$title",
      "$session_entry_url",
      "$session_entry_referrer",
      "$session_exit_url",
    ],
    before_send: (event) => {
      if (event) {
        const pathname = getAnalyticsPath(window.location.pathname);
        event.properties.$current_url = `${window.location.origin}${pathname}`;
        event.properties.$pathname = pathname;
      }
      return event;
    },
  });
}
