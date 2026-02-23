import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'On-Call Follow the Sun',
  description: 'A global dashboard visualizing active on-call engineers.',
});

export default function DashboardPage() {
  return <DashboardLayout />;
}
