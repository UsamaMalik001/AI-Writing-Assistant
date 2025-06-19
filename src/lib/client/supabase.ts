import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// For client components
export const supabaseBrowser = () => createPagesBrowserClient();

// For server components or API routes
export const supabaseServer = (cookies: () => any) =>
  createServerComponentClient({ cookies });
