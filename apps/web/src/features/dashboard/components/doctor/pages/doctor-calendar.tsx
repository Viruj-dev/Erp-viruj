"use client";
import { useEffect, useRef, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/erp/checkbox";
import { Input } from "@/components/ui/erp/input";
import { Textarea } from "@/components/ui/erp/textarea";
import { ErpSelect } from "@/components/ui/erp/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorPageShell } from "../_components/doctor-shared-ui";
import {
  useDoctorQuery,
  useDoctorSave,
  useDoctorTenant,
  type CalendarEvent,
  type WorkLocation,
} from "@/features/dashboard/lib/doctor-workspace";
const colors: Record<string, string> = {
  blue: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  green: "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  rose: "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
};
const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const localTime = (s: string) => {
  const d = new Date(s);
  return `${localDate(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const emptyEvent = (d: Date): CalendarEvent => ({
  id: "",
  title: "",
  startsAt: `${localDate(d)}T09:00`,
  endsAt: `${localDate(d)}T10:00`,
  locationId: "",
  notes: "",
  pinned: false,
  highlight: "blue",
  reminderMinutes: 15,
  patientsAttended: 0,
});
export function doctorDayAppointmentsPath(date: string, page = 1) {
  const from = new Date(`${date}T00:00:00`);
  const until = new Date(from);
  until.setDate(until.getDate() + 1);
  return `/doctor/appointments?page=${page}&pageSize=100&from=${encodeURIComponent(from.toISOString())}&until=${encodeURIComponent(until.toISOString())}`;
}
export function DoctorCalendarPage() {
  const query = useDoctorQuery<CalendarEvent[]>("/doctor/calendar");
  const locations = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(localDate(new Date()));
  const [draft, setDraft] = useState<CalendarEvent>();
  const save = useDoctorSave();
  function selectDate(date: string) {
    setSelected(date);
  }
  const start = new Date(
    cursor.getFullYear(),
    cursor.getMonth(),
    view === "month" ? 1 : cursor.getDate()
  );
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const count = view === "month" ? 42 : 7;
  const dates = Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const events = query.data || [];
  function move(direction: number) {
    const d = new Date(cursor);
    if (view === "month") {
      d.setDate(1);
      d.setMonth(d.getMonth() + direction);
    } else d.setDate(d.getDate() + direction * 7);
    setCursor(d);
  }
  return (
    <DoctorPageShell
      eyebrow="Clinical schedule"
      title="Availability"
      subtitle="Right-click a date to add an event, pin it, choose a highlight and set a reminder. Double-click a date or press Enter to add an event. Times use your device’s timezone."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous period"
            onClick={() => move(-1)}
          >
            <ChevronLeft />
          </Button>
          <h2 className="min-w-44 text-center font-semibold">
            {cursor.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next period"
            onClick={() => move(1)}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCursor(new Date());
              selectDate(localDate(new Date()));
            }}
          >
            Today
          </Button>
        </div>
        <div className="flex gap-2">
          <ErpSelect
            aria-label="Calendar view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </ErpSelect>
          <Button
            variant="outline"
            onClick={async () => {
              if (!("Notification" in window)) {
                toast.info(
                  "Browser notifications are unavailable. In-app reminders remain active."
                );
                return;
              }
              const permission = await Notification.requestPermission();
              toast.info(
                permission === "granted"
                  ? "Notifications enabled while ERP is open"
                  : "In-app reminders remain active while ERP is open"
              );
            }}
          >
            <Bell size={16} />
            Enable reminders
          </Button>
        </div>
      </div>
      {query.isPending && <p role="status">Loading saved calendar…</p>}
      {query.isError && (
        <p role="alert">
          Calendar could not load.{" "}
          <Button variant="outline" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 border-b">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                className="p-3 text-center text-xs font-semibold text-muted-foreground"
                key={d}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {dates.map((d) => {
              const key = localDate(d);
              const entries = events
                .filter(
                  (e) =>
                    localDate(new Date(e.startsAt)) <= key &&
                    localDate(new Date(e.endsAt)) >= key
                )
                .sort(
                  (a, b) =>
                    Number(b.pinned) - Number(a.pinned) ||
                    a.startsAt.localeCompare(b.startsAt)
                );
              return (
                <ContextMenu.Root key={key}>
                  <ContextMenu.Trigger asChild>
                    <div
                      tabIndex={0}
                      role="group"
                      aria-label={d.toDateString()}
                      onDoubleClick={() => setDraft(emptyEvent(d))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target === e.currentTarget)
                          setDraft(emptyEvent(d));
                      }}
                      className={`min-h-36 border-b border-r p-2 transition-colors duration-150 hover:bg-emerald-50 focus-within:bg-emerald-50 dark:hover:bg-emerald-950/40 dark:focus-within:bg-emerald-950/40 ${selected === key ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""} ${d.getMonth() !== cursor.getMonth() && view === "month" ? "opacity-50" : ""}`}
                    >
                      <button
                        type="button"
                        aria-label={`View ${d.toDateString()}`}
                        aria-pressed={selected === key}
                        className={`mb-2 flex size-8 items-center justify-center rounded-full text-sm ${key === localDate(new Date()) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        onClick={() => selectDate(key)}
                      >
                        {d.getDate()}
                      </button>
                      <div className="space-y-1">
                        {entries.map((e) => (
                          <button
                            type="button"
                            key={e.id}
                            className={`block w-full rounded-md p-2 text-left text-xs ${colors[e.highlight] || colors.blue}`}
                            onClick={() =>
                              setDraft({
                                ...e,
                                startsAt: localTime(e.startsAt),
                                endsAt: localTime(e.endsAt),
                              })
                            }
                          >
                            {e.pinned && (
                              <Pin className="mr-1 inline" size={11} />
                            )}
                            <span className="font-semibold">{e.title}</span>
                            <span className="mt-1 block">
                              {new Date(e.startsAt).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenu.Content className="z-50 min-w-48 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
                      {[
                        ["Add event", {}],
                        ["Add pinned event", { pinned: true }],
                        ["Add highlighted event", { highlight: "amber" }],
                        ["Add reminder", { reminderMinutes: 30 }],
                      ].map(([label, preset]) => (
                        <ContextMenu.Item
                          key={String(label)}
                          className="cursor-default rounded-sm px-3 py-2 text-sm outline-none focus:bg-accent"
                          onSelect={() => {
                            selectDate(key);
                            setDraft({
                              ...emptyEvent(d),
                              ...(preset as Partial<CalendarEvent>),
                            });
                          }}
                        >
                          {String(label)}
                        </ContextMenu.Item>
                      ))}
                    </ContextMenu.Content>
                  </ContextMenu.Portal>
                </ContextMenu.Root>
              );
            })}
          </div>
        </div>
      </div>
      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open) setDraft(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit event" : "Add event"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(
                  {
                    path: `/doctor/calendar${draft.id ? `/${draft.id}` : ""}`,
                    method: draft.id ? "PATCH" : "POST",
                    body: {
                      ...draft,
                      startsAt: new Date(draft.startsAt).toISOString(),
                      endsAt: new Date(draft.endsAt).toISOString(),
                    },
                  },
                  { onSuccess: () => setDraft(undefined) }
                );
              }}
            >
              <label>
                Event title
                <Input
                  required
                  maxLength={200}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  Starts
                  <Input
                    required
                    type="datetime-local"
                    value={draft.startsAt}
                    onChange={(e) =>
                      setDraft({ ...draft, startsAt: e.target.value })
                    }
                  />
                </label>
                <label>
                  Ends
                  <Input
                    required
                    type="datetime-local"
                    min={draft.startsAt}
                    value={draft.endsAt}
                    onChange={(e) =>
                      setDraft({ ...draft, endsAt: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Work location
                <ErpSelect
                  value={draft.locationId}
                  onChange={(e) =>
                    setDraft({ ...draft, locationId: e.target.value })
                  }
                >
                  <option value="">Personal / other</option>
                  {locations.data?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </ErpSelect>
              </label>
              <label>
                Notes
                <Textarea
                  maxLength={4000}
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft({ ...draft, notes: e.target.value })
                  }
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  Patients attended
                  <Input
                    type="number"
                    required
                    min={0}
                    max={10000}
                    value={draft.patientsAttended}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        patientsAttended: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Reminder before event
                  <ErpSelect
                    value={String(draft.reminderMinutes)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        reminderMinutes: Number(e.target.value),
                      })
                    }
                  >
                    {[0, 5, 15, 30, 60, 1440].map((n) => (
                      <option value={n} key={n}>
                        {n === 0
                          ? "At start"
                          : n === 1440
                            ? "1 day"
                            : `${n} minutes`}
                      </option>
                    ))}
                  </ErpSelect>
                </label>
              </div>
              <label>
                Highlight
                <ErpSelect
                  value={draft.highlight}
                  onChange={(e) =>
                    setDraft({ ...draft, highlight: e.target.value })
                  }
                >
                  {Object.keys(colors).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </ErpSelect>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={draft.pinned}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, pinned: checked === true })
                  }
                />
                Pin event
              </label>
              {save.isError && (
                <p role="alert" className="text-destructive">
                  {save.error.message}
                </p>
              )}
              <div className="flex gap-2">
                <Button disabled={save.isPending}>Save event</Button>
                {draft.id && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={save.isPending}
                    onClick={() => {
                      if (window.confirm("Delete this calendar event?"))
                        save.mutate(
                          {
                            path: `/doctor/calendar/${draft.id}`,
                            method: "DELETE",
                          },
                          { onSuccess: () => setDraft(undefined) }
                        );
                    }}
                  >
                    Delete event
                  </Button>
                )}
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DoctorPageShell>
  );
}
export function DoctorReminders() {
  const q = useDoctorQuery<CalendarEvent[]>("/doctor/calendar");
  const tenant = useDoctorTenant();
  const delivered = useRef(new Set<string>());
  useEffect(() => {
    const check = () => {
      for (const e of q.data || []) {
        const due = Date.parse(e.startsAt) - e.reminderMinutes * 60000;
        const key = `viruj:doctor-reminder:${tenant.organizationId}:${e.id}:${e.startsAt}:${e.reminderMinutes}`;
        let alreadyDelivered = delivered.current.has(key);
        try {
          alreadyDelivered ||= sessionStorage.getItem(key) === "1";
        } catch {
          /* Memory deduplication still works if storage is unavailable. */
        }
        if (
          due <= Date.now() &&
          Date.parse(e.startsAt) + 60000 > Date.now() &&
          !alreadyDelivered
        ) {
          delivered.current.add(key);
          try {
            sessionStorage.setItem(key, "1");
          } catch {
            /* Memory deduplication still works. */
          }
          toast.info(`Reminder: ${e.title}`);
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification("Viruj schedule reminder", {
                body: e.title,
                tag: key,
              });
            } catch {
              /* In-app reminder remains available. */
            }
          }
        }
      }
    };
    check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, [q.data, tenant.organizationId]);
  return null;
}
