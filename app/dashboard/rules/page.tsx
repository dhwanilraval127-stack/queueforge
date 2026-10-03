'use client';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RulesDisplay } from '@/components/rules/rules-display';
import { RuleSheet } from '@/components/rules/rule-sheet';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import type { RuleSet } from '@/types/rules';
import { Printer } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

export default function RulesPage() {
  const [rules, setRules] = useState<RuleSet | null>(null);
  const [loading, setLoading] = useState(true);
  const pushToast = useAppStore((s) => s.pushToast);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rules');
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      setRules(json.data);
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader
        number="06"
        title="Rules"
        description="The rule set executed by the deterministic registration engine."
        actions={
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print rule sheet
          </Button>
        }
      />

      {loading || !rules ? (
        <TableSkeleton rows={6} />
      ) : (
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live configuration</TabsTrigger>
            <TabsTrigger value="sheet">Rule sheet</TabsTrigger>
          </TabsList>
          <TabsContent value="live">
            <RulesDisplay rules={rules} onUpdated={load} />
          </TabsContent>
          <TabsContent value="sheet">
            <RuleSheet rules={rules} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}