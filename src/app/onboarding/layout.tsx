import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Setup Perangkat Garmin // Onboarding',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
