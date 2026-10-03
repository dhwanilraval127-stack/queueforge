'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { CsvUpload } from '@/components/import/csv-upload';
import { CsvPreview } from '@/components/import/csv-preview';
import { ImportSummary } from '@/components/import/import-summary';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { parseCsvFile } from '@/lib/csv/parser';
import type { CsvValidationResult } from '@/types/import';
import type { ImportResult } from '@/lib/services/import-service';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<CsvValidationResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const pushToast = useAppStore((s) => s.pushToast);

  const handleFile = async (f: File) => {
    setFile(f);
    setResult(null);
    setParsing(true);
    try {
      const res = await parseCsvFile(f);
      setParsed(res);
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Parse error' });
    } finally {
      setParsing(false);
    }
  };

  const process = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/import', { method: 'POST', body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Import failed');
      setResult(json.data);
      pushToast({ variant: 'success', message: 'Import complete' });
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsed(null);
    setResult(null);
  };

  return (
    <>
      <PageHeader
        title="CSV Import"
        description="Import registrations and process them through the deterministic engine."
        actions={
          file && (
            <Button variant="outline" size="sm" onClick={reset}>
              Start over
            </Button>
          )
        }
      />

      {!file && <CsvUpload onFileSelected={handleFile} disabled={parsing} />}

      {file && parsed && !result && (
        <div className="space-y-5">
          <div className="border border-border bg-ivory-light p-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs text-ink">{file.name}</div>
              <div className="font-mono text-2xs text-muted">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <Button
              variant="primary"
              onClick={process}
              disabled={processing || parsed.validRows.length === 0}
            >
              {processing ? 'Processing…' : `Process ${parsed.validRows.length} registrations`}
            </Button>
          </div>
          <CsvPreview result={parsed} />
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ImportSummary result={result} />
          <Button variant="outline" onClick={reset}>Import another file</Button>
        </div>
      )}
    </>
  );
}