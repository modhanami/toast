import {createClient as supabaseCreateClient} from "@supabase/supabase-js";

export const supabaseAdmin = supabaseCreateClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);