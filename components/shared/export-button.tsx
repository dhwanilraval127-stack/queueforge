'use client';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  filename: string;
  data: Record<string, unknown>[];
  label?: string;
  disabled?: boolean;
}

export function ExportButton({ filename, data, label = 'Export CSV', disabled }: Props) {
  const handleExport = () => {
    if (data.length === 0) return;
    const headers = Array.from(
      data.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set<string>())
    );
    const escape = (v: unknown) => {
      if (v === null || v === undefined) return '';
      const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const rows = data.map((row) => headers.map((h) => escape(row[h])).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={disabled || data.length === 0}>
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}