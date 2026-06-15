import { Badge } from './Badge';

export function IssueStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes('approval')
    ? 'gold'
    : normalized.includes('assigned') || normalized.includes('progress')
      ? 'brown'
      : normalized.includes('verified') || normalized.includes('fixed') || normalized.includes('completed')
        ? 'green'
      : 'neutral';

  return <Badge tone={tone}>{status}</Badge>;
}
