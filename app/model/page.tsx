import { Metadata } from 'next';
import { ModelPageClient } from './ModelPageClient';

export const metadata: Metadata = {
  title: 'On-Call Modeling',
  description: 'Model and analyze on-call schedules and rotations.',
};

export default function ModelPage() {
  return <ModelPageClient />;
}
