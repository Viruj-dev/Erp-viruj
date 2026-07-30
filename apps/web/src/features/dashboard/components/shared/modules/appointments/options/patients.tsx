import {
  Calendar,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/features/dashboard/components/ui/badge";
import { Card, CardContent } from "@/features/dashboard/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/features/dashboard/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/features/dashboard/components/ui/tabs";

import type { AppointmentRecord } from "../types";
import { formatDate, getStatusLabel } from "../utils";

type PatientHistoryAppointment = AppointmentRecord & {
  patientEmail?: string;
};

function getStatusColor(status?: string) {
  switch (status?.toLowerCase()) {
    case "approved":
    case "confirmed":
    case "completed":
      return "bg-green-100 text-green-700 border-green-300";

    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300";

    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";

    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

function AppointmentCard({
  appointment,
  departmentLabel,
}: {
  appointment: PatientHistoryAppointment;
  departmentLabel: string;
}) {
  const isApproved = appointment.status?.toLowerCase() === "approved";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-5 md:gap-0">
          {/* Patient Info */}
          <div className="space-y-2 md:border-r md:pr-4">
            <h3 className="font-semibold text-foreground">
              {appointment.patientName}
            </h3>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={16} />

              <span>{appointment.patientEmail || "No email"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone size={16} />

              <span>{appointment.patientPhone || "No phone"}</span>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="space-y-2 md:border-r md:px-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Details
            </p>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {appointment.reason || "No reason provided"}
              </p>

              <p className="text-xs text-muted-foreground">
                Doctor: {appointment.doctorName}
              </p>

              <p className="text-xs text-muted-foreground">
                {departmentLabel}: {appointment.departmentName || "General"}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2 md:border-r md:px-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Schedule
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-primary" size={16} />

                <span className="font-medium">
                  {formatDate(appointment.appointmentDate)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="text-primary" size={16} />

                <span>{appointment.appointmentTime}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2 md:border-r md:px-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Status
            </p>

            <Badge
              className={`${getStatusColor(appointment.status)} capitalize`}
            >
              {isApproved ? (
                <CheckCircle2 className="mr-1" size={14} />
              ) : (
                <XCircle className="mr-1" size={14} />
              )}

              {getStatusLabel(appointment.status)}
            </Badge>
          </div>

          {/* Notes / Actions */}
          <div className="flex flex-col gap-2 md:pl-4">
            <Button className="w-full" size="sm" variant="outline">
              <Eye className="mr-2" size={16} />
              View
            </Button>

            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Notes</p>

              <p className="mt-1 line-clamp-3 text-xs text-foreground">
                {appointment.approvalNotes ||
                  appointment.reason ||
                  "No notes available"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientDecisionHistory({
  appointments,
  departmentFilter,
  departmentLabel,
  departments,
  isLoading,
  onDepartmentFilter,
  onQuery,
  query,
}: {
  appointments: AppointmentRecord[];
  departmentFilter: string;
  departmentLabel: string;
  departments: string[];
  isLoading: boolean;
  onDepartmentFilter: (value: string) => void;
  onQuery: (value: string) => void;
  query: string;
}) {
  const historyAppointments: PatientHistoryAppointment[] = appointments;

  const approvedAppointments = useMemo(() => {
    return historyAppointments.filter(
      (appointment) => appointment.status?.toLowerCase() === "approved"
    );
  }, [historyAppointments]);

  const rejectedAppointments = useMemo(() => {
    return historyAppointments.filter(
      (appointment) => appointment.status?.toLowerCase() === "rejected"
    );
  }, [historyAppointments]);

  const filterAppointments = (data: PatientHistoryAppointment[]) => {
    return data.filter((appointment) => {
      const matchesSearch =
        appointment.patientName?.toLowerCase().includes(query.toLowerCase()) ||
        appointment.patientEmail?.toLowerCase().includes(query.toLowerCase()) ||
        appointment.doctorName?.toLowerCase().includes(query.toLowerCase()) ||
        appointment.reason?.toLowerCase().includes(query.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" ||
        appointment.departmentName === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  };

  const filteredApproved = filterAppointments(approvedAppointments);

  const filteredRejected = filterAppointments(rejectedAppointments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Patient Decision History
        </h2>

        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 text-muted-foreground"
              size={18}
            />

            <Input
              className="pl-10"
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search by patient, email, doctor..."
              value={query}
            />
          </div>

          {/* Department Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              className="capitalize"
              onClick={() => onDepartmentFilter("all")}
              size="sm"
              variant={departmentFilter === "all" ? "default" : "outline"}
            >
              All
            </Button>

            {departments.map((dept) => (
              <Button
                className="capitalize"
                key={dept}
                onClick={() => onDepartmentFilter(dept)}
                size="sm"
                variant={departmentFilter === dept ? "default" : "outline"}
              >
                {dept}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading patient history...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs className="w-full" defaultValue="approved">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="approved">
              Approved ({approvedAppointments.length})
            </TabsTrigger>

            <TabsTrigger value="rejected">
              Rejected ({rejectedAppointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Approved */}
          <TabsContent className="mt-4 space-y-4" value="approved">
            {filteredApproved.length > 0 ? (
              filteredApproved.map((appointment) => (
                <AppointmentCard
                  appointment={appointment}
                  departmentLabel={departmentLabel}
                  key={appointment.id}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle
                    className="mx-auto mb-2 text-muted-foreground"
                    size={32}
                  />

                  <p className="text-muted-foreground">
                    No approved appointments found
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rejected */}
          <TabsContent className="mt-4 space-y-4" value="rejected">
            {filteredRejected.length > 0 ? (
              filteredRejected.map((appointment) => (
                <AppointmentCard
                  appointment={appointment}
                  departmentLabel={departmentLabel}
                  key={appointment.id}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle
                    className="mx-auto mb-2 text-muted-foreground"
                    size={32}
                  />

                  <p className="text-muted-foreground">
                    No rejected appointments found
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
