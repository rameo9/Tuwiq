import path from 'path';

/** Used by /api/upload; set UPLOAD_DIR on Prod if cwd differs from where files live. */
export function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }
  return path.join(process.cwd(), 'public', 'uploads');
}
