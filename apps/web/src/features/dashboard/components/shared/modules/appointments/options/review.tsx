import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/features/dashboard/components/ui/badge";
import { Card, CardContent } from "@/features/dashboard/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/dashboard/components/ui/dialog";
import { Input } from "@/features/dashboard/components/ui/input";

import type { AppointmentRecord, AppointmentStatus } from "../types";
import { formatDate } from "../utils";

type ReviewAppointmentRecord = AppointmentRecord & {
  patientEmail?: string;
};

const fakeReviewAppointments: ReviewAppointmentRecord[] = [
  {
    appointmentDate: "2026-05-28",
    appointmentMode: "emergency",
    appointmentTime: "09:15 AM",
    departmentName: "Cardiology",
    doctorName: "Dr. Asha Mehta",
    id: "fake-review-001",
    patientAge: 58,
    patientEmail: "ramesh.patel@example.com",
    patientGender: "Male",
    patientName: "Ramesh Patel",
    patientPhone: "+91 98765 12001",
    reason: "Chest discomfort and shortness of breath since morning.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-28",
    appointmentMode: "walk-in",
    appointmentTime: "10:00 AM",
    departmentName: "Dermatology",
    doctorName: "Dr. Kavya Rao",
    id: "fake-review-002",
    patientAge: 31,
    patientEmail: "neha.sharma@example.com",
    patientGender: "Female",
    patientName: "Neha Sharma",
    patientPhone: "+91 98765 12002",
    reason: "Recurring skin rash with itching for one week.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-28",
    appointmentMode: "online",
    appointmentTime: "10:30 AM",
    departmentName: "General Medicine",
    doctorName: "Dr. Iqbal Khan",
    id: "fake-review-003",
    patientAge: 44,
    patientEmail: "amit.verma@example.com",
    patientGender: "Male",
    patientName: "Amit Verma",
    patientPhone: "+91 98765 12003",
    reason: "Fever, fatigue, and body ache for three days.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-28",
    appointmentMode: "clinic",
    appointmentTime: "11:15 AM",
    departmentName: "Orthopedics",
    doctorName: "Dr. Meera Nair",
    id: "fake-review-004",
    patientAge: 67,
    patientEmail: "sunita.iyer@example.com",
    patientGender: "Female",
    patientName: "Sunita Iyer",
    patientPhone: "+91 98765 12004",
    reason: "Knee pain and difficulty walking after a minor fall.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-28",
    appointmentMode: "online",
    appointmentTime: "12:00 PM",
    departmentName: "Pediatrics",
    doctorName: "Dr. Arjun Sen",
    id: "fake-review-005",
    patientAge: 7,
    patientEmail: "parent.riya@example.com",
    patientGender: "Female",
    patientName: "Riya Malhotra",
    patientPhone: "+91 98765 12005",
    reason: "Cough and mild fever, parent requests pediatric consultation.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-29",
    appointmentMode: "clinic",
    appointmentTime: "09:45 AM",
    departmentName: "Neurology",
    doctorName: "Dr. Pranav Bose",
    id: "fake-review-006",
    patientAge: 39,
    patientEmail: "karan.gill@example.com",
    patientGender: "Male",
    patientName: "Karan Gill",
    patientPhone: "+91 98765 12006",
    reason: "Frequent migraines with light sensitivity.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-29",
    appointmentMode: "walk-in",
    appointmentTime: "01:30 PM",
    departmentName: "ENT",
    doctorName: "Dr. Farah Siddiqui",
    id: "fake-review-007",
    patientAge: 25,
    patientEmail: "pooja.menon@example.com",
    patientGender: "Female",
    patientName: "Pooja Menon",
    patientPhone: "+91 98765 12007",
    reason: "Ear pain and blocked sensation after travel.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-29",
    appointmentMode: "clinic",
    appointmentTime: "03:00 PM",
    departmentName: "Gynecology",
    doctorName: "Dr. Leena Thomas",
    id: "fake-review-008",
    patientAge: 29,
    patientEmail: "anjali.das@example.com",
    patientGender: "Female",
    patientName: "Anjali Das",
    patientPhone: "+91 98765 12008",
    reason: "Follow-up for irregular cycle and abdominal cramps.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-30",
    appointmentMode: "online",
    appointmentTime: "04:15 PM",
    departmentName: "Psychiatry",
    doctorName: "Dr. Nitin Kapoor",
    id: "fake-review-009",
    patientAge: 36,
    patientEmail: "rahul.sinha@example.com",
    patientGender: "Male",
    patientName: "Rahul Sinha",
    patientPhone: "+91 98765 12009",
    reason: "Anxiety, sleep disruption, and work stress consultation.",
    status: "pending_approval",
  },
  {
    appointmentDate: "2026-05-30",
    appointmentMode: "emergency",
    appointmentTime: "05:00 PM",
    departmentName: "Ophthalmology",
    doctorName: "Dr. Shreya Kulkarni",
    id: "fake-review-010",
    patientAge: 52,
    patientEmail: "meenakshi.jain@example.com",
    patientGender: "Female",
    patientName: "Meenakshi Jain",
    patientPhone: "+91 98765 12010",
    reason: "Sudden blurred vision in right eye.",
    status: "pending_approval",
  },
];

export function ReviewQueue({
  appointments,
  departmentFilter,
  departments,
  decisionReason,
  isLoading,
  isUpdating,
  onDecision,
  onDepartmentFilter,
  onQuery,
  onReason,
  onSelect,
  query,
  selectedAppointmentId,
}: {
  appointment: AppointmentRecord | null;
  appointments: AppointmentRecord[];
  departmentFilter: string;
  departments: string[];
  decisionReason: string;
  isLoading: boolean;
  isUpdating: boolean;
  onDecision: (id: string, status: AppointmentStatus) => void;
  onDepartmentFilter: (value: string) => void;
  onQuery: (value: string) => void;
  onReason: (value: string) => void;
  onSelect: (id: string) => void;
  query: string;
  selectedAppointmentId: string | null;
}) {
  const [selectedRequest, setSelectedRequest] =
    useState<ReviewAppointmentRecord | null>(null);

  const reviewAppointments: ReviewAppointmentRecord[] = appointments.length
    ? appointments
    : fakeReviewAppointments;

  const filteredAppointments = useMemo(() => {
    return reviewAppointments.filter((item) => {
      const matchesSearch =
        item.patientName?.toLowerCase().includes(query.toLowerCase()) ||
        item.reason?.toLowerCase().includes(query.toLowerCase()) ||
        item.doctorName?.toLowerCase().includes(query.toLowerCase()) ||
        item.departmentName?.toLowerCase().includes(query.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || item.departmentName === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [reviewAppointments, query, departmentFilter]);

  const getPriorityColor = (mode?: string) => {
    switch (mode?.toLowerCase()) {
      case "emergency":
        return "bg-red-100 text-red-700 border-red-300";
      case "walk-in":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-green-100 text-green-700 border-green-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 text-muted-foreground"
              size={18}
            />

            <Input
              className="pl-10"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onQuery(e.target.value)
              }
              placeholder="Search by patient name, reason, doctor..."
              value={query}
            />
          </div>

          {/* Department Filter */}
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

      {/* Requests Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading pending requests...</p>
          </CardContent>
        </Card>
      ) : filteredAppointments.length ? (
        <div className="space-y-4">
          {filteredAppointments.map((request) => (
            <Card
              className={`overflow-hidden transition-shadow hover:shadow-lg ${
                selectedAppointmentId === request.id
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              key={request.id}
            >
              <CardContent className="p-0">
                <div className="grid grid-cols-1 gap-4 p-3 md:grid-cols-4 md:gap-0">
                  {/* Patient Info */}
                  <div className="md:border-r md:pr-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground">
                          {request.patientName}
                        </h3>

                        <Badge
                          className={`${getPriorityColor(
                            request.appointmentMode
                          )} capitalize`}
                        >
                          {request.appointmentMode || "General"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {request.reason || "No reason provided"}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={16} />

                        <span>
                          {request.patientAge || "N/A"} years •{" "}
                          {request.patientGender || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="md:border-r md:px-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Request Details
                      </p>

                      <div className="space-y-1">
                        <p className="text-sm text-foreground">
                          {request.patientEmail || "No email"}
                        </p>

                        <p className="text-sm text-foreground">
                          {request.patientPhone || "No phone"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Doctor: {request.doctorName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Department: {request.departmentName || "General"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Preference */}
                  <div className="md:border-r md:px-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Appointment Time
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="text-primary" size={16} />

                          <span className="font-medium">
                            {formatDate(request.appointmentDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="text-primary" size={16} />

                          <span>{request.appointmentTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 md:pl-4">
                    <Button
                      className="w-full text-sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        onSelect(request.id);
                      }}
                      variant="outline"
                    >
                      View Details
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        disabled={isUpdating}
                        onClick={() => onDecision(request.id, "approved")}
                        size="sm"
                      >
                        <CheckCircle className="mr-1" size={16} />
                        Accept
                      </Button>

                      <Button
                        className="flex-1"
                        disabled={isUpdating}
                        onClick={() => onDecision(request.id, "rejected")}
                        size="sm"
                        variant="destructive"
                      >
                        <XCircle className="mr-1" size={16} />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle
              className="mx-auto mb-2 text-muted-foreground"
              size={32}
            />

            <p className="text-muted-foreground">
              No requests match your search criteria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <Dialog
          onOpenChange={() => setSelectedRequest(null)}
          open={!!selectedRequest}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRequest.patientName}</DialogTitle>

              <DialogDescription>
                {selectedRequest.reason || "No reason provided"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Patient Info */}
              <div>
                <h3 className="mb-3 font-semibold text-foreground">
                  Patient Information
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Age</p>

                    <p className="font-medium">
                      {selectedRequest.patientAge || "N/A"} years
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Gender</p>

                    <p className="font-medium">
                      {selectedRequest.patientGender || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Email</p>

                    <p className="font-medium">
                      {selectedRequest.patientEmail || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Phone</p>

                    <p className="font-medium">
                      {selectedRequest.patientPhone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="mb-3 font-semibold text-foreground">
                  Appointment Details
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Doctor</p>

                    <p className="font-medium">{selectedRequest.doctorName}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Department</p>

                    <p className="font-medium">
                      {selectedRequest.departmentName || "General"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Appointment Date</p>

                    <p className="font-medium">
                      {formatDate(selectedRequest.appointmentDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Appointment Time</p>

                    <p className="font-medium">
                      {selectedRequest.appointmentTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="mb-3 font-semibold text-foreground">
                  Request Reason
                </h3>

                <p className="rounded-lg bg-muted p-3 text-sm">
                  {selectedRequest.reason || "No reason added by patient."}
                </p>
              </div>

              {/* Decision Reason */}
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Confirmation / Rejection Reason
                </label>

                <textarea
                  className="mt-2 min-h-28 w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  onChange={(event) => onReason(event.target.value)}
                  placeholder="Write why this appointment is confirmed or rejected..."
                  value={decisionReason}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isUpdating}
                  onClick={() => {
                    onDecision(selectedRequest.id, "approved");
                    setSelectedRequest(null);
                  }}
                >
                  <CheckCircle className="mr-2" size={16} />
                  Accept Request
                </Button>

                <Button
                  className="flex-1"
                  disabled={isUpdating}
                  onClick={() => {
                    onDecision(selectedRequest.id, "rejected");
                    setSelectedRequest(null);
                  }}
                  variant="destructive"
                >
                  <XCircle className="mr-2" size={16} />
                  Reject Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
