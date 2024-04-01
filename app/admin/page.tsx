/**
 * v0 by Vercel.
 * @see https://v0.dev/t/orcUlOwR8GI
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {CreateTaskForm} from "@/app/admin/create-task-form";
import {ToastUser} from "@/types";
import {createClient as supabaseCreateClient} from "@supabase/supabase-js";
import {createServerClient} from "@/utils/supabase/server";

export default async function AdminPage() {
  const {data: {user}} = await createServerClient().auth.getUser();
  if (!user) {
    return <div>Not logged in</div>
  }
  console.log("User", user)
  const {data: linkedUser} = await supabaseCreateClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!).from('users').select().eq('user_id', user.id).maybeSingle<ToastUser>()
  let userRole = linkedUser?.user_role;
  console.log("Linked user", linkedUser, userRole)
  if (!linkedUser || userRole !== "admin") {
    return <div>Not an admin</div>
  }

  return (
    <CreateTaskForm/>
  )

}

