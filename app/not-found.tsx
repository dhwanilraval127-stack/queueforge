import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="font-mono text-xs text-muted">ERROR 404</div>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="primary">
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}