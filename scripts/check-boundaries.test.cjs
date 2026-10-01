const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkBoundaries } = require('./check-boundaries.cjs');

test('accepts a server-rendered page calling a protected query', () => {
  const files = new Map([
    ['app/page.tsx', "import { getData } from '@/server/queries/data';"],
    ['server/queries/data.ts', "import 'server-only'; export const getData = () => [];"],
    ['frontend/view.tsx', "'use client'; export default function View() { return null; }"],
  ]);
  assert.deepEqual(checkBoundaries(files), []);
});

test('rejects a backend imported indirectly through a UI helper', () => {
  const files = new Map([
    ['app/page.tsx', "'use client'; import { helper } from './helper';"],
    ['app/helper.ts', "export { db as helper } from '../server/db';"],
    ['server/db.ts', "import 'server-only'; export const db = {};"],
  ]);
  assert(checkBoundaries(files).some(error => error.includes('browser dependency')));
});

test('rejects runtime dynamic imports and ORM imports from UI', () => {
  assert(checkBoundaries(new Map([
    ['frontend/view.tsx', "const query = import('@prisma/client');"],
  ])).some(error => error.includes('browser dependency')));
});

test('rejects private environment variables reachable from the browser', () => {
  assert(checkBoundaries(new Map([
    ['frontend/view.tsx', 'const key = process.env.CLERK_SECRET_KEY;'],
  ])).some(error => error.includes('private environment variable')));
});

test('only permits the erased UploadThing bridge from shared to server', () => {
  const files = new Map([
    ['shared/contracts/uploads.ts', "export type { OurFileRouter } from '@/server/integrations/uploadthing';"],
    ['server/integrations/uploadthing.ts', "import 'server-only'; export type OurFileRouter = {};"],
    ['frontend/upload.ts', "import type { OurFileRouter } from '@/shared/contracts/uploads';"],
  ]);
  assert.deepEqual(checkBoundaries(files), []);
  files.set('shared/contracts/uploads.ts', "export { router } from '@/server/integrations/uploadthing';");
  assert(checkBoundaries(files).some(error => error.includes('shared code')));
});

test('rejects backend-to-frontend dependencies and unprotected backend modules', () => {
  const files = new Map([
    ['server/query.ts', "import type { Data } from '@/frontend/view';"],
    ['frontend/view.tsx', 'export type Data = {};'],
  ]);
  const errors = checkBoundaries(files);
  assert(errors.some(error => error.includes("must import 'server-only'")));
  assert(errors.some(error => error.includes('backend cannot import')));
});

test('rejects direct database access from pages and logic in route adapters', () => {
  const files = new Map([
    ['app/page.tsx', "import { db } from '@/server/db';"],
    ['server/db.ts', "import 'server-only'; export const db = {};"],
    ['app/api/data/route.ts', 'export async function GET() { return Response.json([]); }'],
  ]);
  const errors = checkBoundaries(files);
  assert(errors.some(error => error.includes('pages must use')));
  assert(errors.some(error => error.includes('API adapters must delegate')));
});
