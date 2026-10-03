import { NextRequest } from 'next/server';
import { importService } from '@/lib/services/import-service';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';
import { MAX_CSV_SIZE_BYTES } from '@/lib/utils/constants';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let csvText: string;
    let filename: string;

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (!(file instanceof File)) {
        return errorResponse({
          code: 'INVALID_INPUT',
          message: 'No file provided in form data',
        }, 400);
      }
      if (file.size > MAX_CSV_SIZE_BYTES) {
        return errorResponse({
          code: 'FILE_TOO_LARGE',
          message: `File exceeds max size of ${MAX_CSV_SIZE_BYTES} bytes`,
        }, 413);
      }
      if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        return errorResponse({
          code: 'INVALID_FILE_TYPE',
          message: 'Only CSV files are accepted',
        }, 400);
      }
      csvText = await file.text();
      filename = file.name;
    } else {
      const body = await req.json();
      if (!body.csv || typeof body.csv !== 'string') {
        return errorResponse({
          code: 'INVALID_INPUT',
          message: 'CSV content required',
        }, 400);
      }
      csvText = body.csv;
      filename = body.filename || 'upload.csv';
    }

    const result = await importService.importCsv(filename, csvText);
    return successResponse(result);
  } catch (err) {
    logger.error('Import failed', { error: err instanceof Error ? err.message : String(err) });
    return handleApiError(err);
  }
}