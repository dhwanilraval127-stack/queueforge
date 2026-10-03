'use client';
import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface Props {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function CsvUpload({ onFileSelected, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a .csv file');
      return;
    }
    onFileSelected(file);
  }, [onFileSelected]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={cn(
        'border-2 border-dashed p-10 text-center transition-colors',
        dragOver ? 'border-teal bg-teal/5' : 'border-border bg-ivory-light',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <Upload className="h-8 w-8 text-muted mx-auto mb-3" />
      <div className="text-sm text-ink">Drop a CSV file here, or</div>
      <div className="mt-3">
        <label>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button asChild variant="outline" size="sm">
            <span>Select file</span>
          </Button>
        </label>
      </div>
      <div className="mt-4 font-mono text-2xs text-muted">
        Required columns: student_id, session_id, timestamp
      </div>
    </div>
  );
}