import { PasswordRecoveryScreen } from "@/features/auth/components/password-recovery-screen";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    token?: string | string[];
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : null;

  return (
    <PasswordRecoveryScreen
      invalidToken={Boolean(query.error)}
      mode="reset"
      token={token}
    />
  );
}
