import {
  LayoutDashboard,
  ListChecks,
  LayoutGrid,
  Clock,
  FileText,
  BookOpenCheck,
  TestTube2,
  LineChart,
  Upload,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  number: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { number: '01', label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { number: '02', label: 'Registrations', href: '/dashboard/registrations', icon: ListChecks },
  { number: '03', label: 'Sessions', href: '/dashboard/sessions', icon: LayoutGrid },
  { number: '04', label: 'Queue', href: '/dashboard/queue', icon: Clock },
  { number: '05', label: 'Audit', href: '/dashboard/audit', icon: FileText },
  { number: '06', label: 'Rules', href: '/dashboard/rules', icon: BookOpenCheck },
  { number: '07', label: 'Simulator', href: '/dashboard/simulator', icon: TestTube2 },
  { number: '08', label: 'Intelligence', href: '/dashboard/intelligence', icon: LineChart },
];

export const UTILITY_ITEMS: NavItem[] = [
  { number: '', label: 'Import CSV', href: '/dashboard/import', icon: Upload },
];