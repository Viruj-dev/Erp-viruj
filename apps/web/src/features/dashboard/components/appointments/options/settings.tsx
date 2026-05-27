"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import {
  Bell,
  Clock,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function AppointmentSettings() {
  const [settings, setSettings] = useState({
    notifyEmail: true,
    notifySMS: true,
    notifyPatient: true,
    autoConfirm: false,
    appointmentDuration: "30",
    consultationFee: "500",
    bufferTime: "15",
    maxPatientsPerDay: "20",
    availableFrom: "09:00",
    availableTo: "17:00",
    rejectionMessage:
      "We are unable to accommodate your appointment request at this time. Please contact us for alternative options.",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Appointment Settings
        </h2>
        <p className="text-muted-foreground">
          Configure your appointment management preferences
        </p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Choose how you want to receive appointment notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for new appointment requests
                </p>
              </div>
              <Switch
                checked={settings.notifyEmail}
                onCheckedChange={(val: any) =>
                  setSettings({ ...settings, notifyEmail: val })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive SMS alerts for urgent appointment requests
                </p>
              </div>
              <Switch
                checked={settings.notifySMS}
                onCheckedChange={(val: any) =>
                  setSettings({ ...settings, notifySMS: val })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground">Patient Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically notify patients of appointment status changes
                </p>
              </div>
              <Switch
                checked={settings.notifyPatient}
                onCheckedChange={(val: any) =>
                  setSettings({ ...settings, notifyPatient: val })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground">Auto-Confirm Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically confirm appointments for returning patients
                </p>
              </div>
              <Switch
                checked={settings.autoConfirm}
                onCheckedChange={(val: any) =>
                  setSettings({ ...settings, autoConfirm: val })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Appointment Preferences
          </CardTitle>
          <CardDescription>
            Set default appointment duration and scheduling rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">
                Default Appointment Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={settings.appointmentDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    appointmentDuration: e.target.value,
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Time allocated per appointment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buffer">
                Buffer Time Between Appointments (minutes)
              </Label>
              <Input
                id="buffer"
                type="number"
                value={settings.bufferTime}
                onChange={(e) =>
                  setSettings({ ...settings, bufferTime: e.target.value })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Time gap between consecutive appointments
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">Consultation Fee (₹)</Label>
              <Input
                id="fee"
                type="number"
                value={settings.consultationFee}
                onChange={(e) =>
                  setSettings({ ...settings, consultationFee: e.target.value })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Default consultation charge
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPatients">Max Patients Per Day</Label>
              <Input
                id="maxPatients"
                type="number"
                value={settings.maxPatientsPerDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxPatientsPerDay: e.target.value,
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Maximum appointments allowed per day
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Working Hours
          </CardTitle>
          <CardDescription>
            Set your available appointment hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="from">Available From</Label>
              <Input
                id="from"
                type="time"
                value={settings.availableFrom}
                onChange={(e) =>
                  setSettings({ ...settings, availableFrom: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">Available Until</Label>
              <Input
                id="to"
                type="time"
                value={settings.availableTo}
                onChange={(e) =>
                  setSettings({ ...settings, availableTo: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle
              size={20}
              className="text-blue-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-semibold text-blue-900 text-sm">
                Working Hours
              </p>
              <p className="text-sm text-blue-700">
                Appointments can only be scheduled between{" "}
                {settings.availableFrom} and {settings.availableTo}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Message Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} />
            Rejection Message Template
          </CardTitle>
          <CardDescription>
            Customize the message sent to patients when rejecting their request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={settings.rejectionMessage}
            onChange={(e) =>
              setSettings({ ...settings, rejectionMessage: e.target.value })
            }
            className="min-h-24 resize-none"
            placeholder="Enter rejection message template..."
          />
          <p className="text-xs text-muted-foreground">
            Available variables: {"{patient_name}"}, {"{appointment_date}"},{" "}
            {"{appointment_reason}"}
          </p>
        </CardContent>
      </Card>

      {/* Automatic Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone size={20} />
            Automatic Reminders
          </CardTitle>
          <CardDescription>
            Configure automatic reminder settings for patients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email-reminder">
                Email Reminder (hours before)
              </Label>
              <Input
                id="email-reminder"
                type="number"
                defaultValue="24"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-reminder">SMS Reminder (hours before)</Label>
              <Input
                id="sms-reminder"
                type="number"
                defaultValue="2"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button
          onClick={handleSave}
          className={`transition-all ${saved ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary"}`}
        >
          {saved ? (
            <>
              <CheckCircle size={18} className="mr-2" />
              Saved Successfully
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
