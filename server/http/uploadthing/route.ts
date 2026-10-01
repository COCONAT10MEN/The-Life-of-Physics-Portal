import 'server-only';

import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from '@/server/integrations/uploadthing';

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
