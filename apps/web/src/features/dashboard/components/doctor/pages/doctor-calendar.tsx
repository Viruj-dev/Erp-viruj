"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pin, Bell, Plus } from "lucide-react";
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
import {
  DoctorPageShell,
  HospitalPanel,
} from "../_components/doctor-shared-ui";
import {
  useDoctorQuery,
  useDoctorSave,
  useDoctorTenant,
  type CalendarEvent,
  type WorkLocation,
  type DoctorAppointment,
  type Page,
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
  const [appointmentPage, setAppointmentPage] = useState(1);
  const appointments = useDoctorQuery<Page<DoctorAppointment>>(
    doctorDayAppointmentsPath(selected, appointmentPage)
  );
  function selectDate(date: string) {
    setSelected(date);
    setAppointmentPage(1);
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
  const selectedEvents = events
    .filter(
      (e) =>
        localDate(new Date(e.startsAt)) <= selected &&
        localDate(new Date(e.endsAt)) >= selected
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        a.startsAt.localeCompare(b.startsAt)
    );
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
      subtitle="Plan your work, visits and reminders. Times are shown in your device’s local timezone."
      actions={
        <Button
          onClick={() => setDraft(emptyEvent(new Date(`${selected}T12:00`)))}
        >
          <Plus size={16} />
          Add event
        </Button>
      }
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
                <div
                  key={key}
                  className={`min-h-36 border-b border-r p-2 ${selected === key ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""} ${d.getMonth() !== cursor.getMonth() && view === "month" ? "opacity-50" : ""}`}
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
                    {entries.slice(0, 3).map((e) => (
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
                        {e.pinned && <Pin className="mr-1 inline" size={11} />}
                        <span className="font-semibold">{e.title}</span>
                        <span className="mt-1 block">
                          {new Date(e.startsAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </button>
                    ))}
                    {entries.length > 3 && (
                      <button
                        type="button"
                        onClick={() => selectDate(key)}
                        className="text-xs text-primary"
                      >
                        +{entries.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <HospitalPanel
        title={new Date(`${selected}T12:00`).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        subtitle={`${selectedEvents.filter((e) => localDate(new Date(e.startsAt)) === selected).reduce((sum, e) => sum + e.patientsAttended, 0)} attended patients recorded on your events`}
      >
        {!selectedEvents.length && (
          <p className="text-sm text-muted-foreground">
            No events planned. Add a clinic session, rounds, leave or a personal
            reminder.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {selectedEvents.map((e) => (
            <Button
              variant="outline"
              className="h-auto justify-start whitespace-normal p-4 text-left"
              key={e.id}
              onClick={() =>
                setDraft({
                  ...e,
                  startsAt: localTime(e.startsAt),
                  endsAt: localTime(e.endsAt),
                })
              }
            >
              <span>
                {e.pinned && "📌 "}
                {e.title}
                <span className="block text-xs text-muted-foreground">
                  {locations.data?.find((l) => l.id === e.locationId)?.name ||
                    "Personal event"}{" "}
                  · {e.patientsAttended} patients · {e.reminderMinutes} min
                  reminder
                </span>
              </span>
            </Button>
          ))}
        </div>
      </HospitalPanel>
      <HospitalPanel
        title="Appointments from your practices"
        subtitle={`${appointments.data?.summary?.patientsAttended ?? 0} patients attended from completed appointments. Organisation staff manage booking decisions.`}
      >
        {appointments.isError ? (
          <p role="alert">Unable to load appointments.</p>
        ) : (
          <div className="space-y-2">
            {appointments.data?.data
              .filter((a) => localDate(new Date(a.startsAt)) === selected)
              .map((a) => (
                <p className="rounded-lg border p-3 text-sm" key={a.id}>
                  {new Date(a.startsAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {a.clinic?.name || "Practice"} · {a.status}
                </p>
              ))}
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={appointmentPage === 1}
                onClick={() => setAppointmentPage((p) => p - 1)}
              >
                Previous appointments
              </Button>
              <Button
                variant="outline"
                disabled={
                  !appointments.data ||
                  appointmentPage >= appointments.data.pagination.totalPages
                }
                onClick={() => setAppointmentPage((p) => p + 1)}
              >
                Next appointments
              </Button>
            </div>
          </div>
        )}
      </HospitalPanel>
      <p className="text-xs text-muted-foreground">
        Reminders work while your ERP is open. Calendar events plan your work;
        personal-practice booking hours are configured below.
      </p>
      <BookingHours />
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
function BookingHours() {
  const locations = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  const slots = useDoctorQuery<
    {
      id: string;
      locationId: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      slotDurationMinutes: number;
    }[]
  >("/doctor/availability");
  const save = useDoctorSave();
  return (
    <HospitalPanel
      title="Personal-practice booking hours"
      subtitle="Recurring hours for patient booking. Hospital and clinic booking hours are managed by their staff."
    >
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          save.mutate({
            path: "/doctor/availability",
            body: {
              locationId: data.get("locationId"),
              dayOfWeek: data.get("dayOfWeek"),
              startTime: data.get("startTime"),
              endTime: data.get("endTime"),
              slotDurationMinutes: Number(data.get("duration")),
              isActive: true,
            },
          });
        }}
      >
        <label>
          Location
          <ErpSelect required name="locationId">
            <option value="">Select practice</option>
            {locations.data
              ?.filter((l) => l.type === "PERSONAL_PRACTICE")
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
          </ErpSelect>
        </label>
        <label>
          Day
          <ErpSelect name="dayOfWeek">
            {[
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </ErpSelect>
        </label>
        <label>
          From
          <Input required name="startTime" type="time" />
        </label>
        <label>
          To
          <Input required name="endTime" type="time" />
        </label>
        <label>
          Minutes
          <Input
            required
            className="w-24"
            name="duration"
            type="number"
            defaultValue={30}
            min={5}
            max={240}
          />
        </label>
        <Button disabled={save.isPending}>Add hours</Button>
      </form>
      {save.isError && <p role="alert">{save.error.message}</p>}
      <div className="mt-4 space-y-2">
        {slots.data?.map((s) => (
          <div
            className="flex items-center justify-between rounded-lg border p-3 text-sm"
            key={s.id}
          >
            <span>
              {locations.data?.find((l) => l.id === s.locationId)?.name} ·{" "}
              {s.dayOfWeek} · {s.startTime}–{s.endTime} ·{" "}
              {s.slotDurationMinutes} min
            </span>
            <Button
              variant="ghost"
              disabled={save.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    "Remove these recurring booking hours? Existing bookings stay unchanged."
                  )
                )
                  save.mutate({
                    path: `/doctor/availability/${s.id}`,
                    method: "DELETE",
                  });
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </HospitalPanel>
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
