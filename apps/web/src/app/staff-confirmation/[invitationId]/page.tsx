import { StaffConfirmationScreen } from "@/features/auth/components/staff-confirmation-screen";

export default async function StaffConfirmationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;

  return <StaffConfirmationScreen invitationId={invitationId} />;
}
