/**
 * v0 by Vercel.
 * @see https://v0.dev/t/orcUlOwR8GI
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {ToastUser} from "@/app/protected/page";
import {supabaseServer} from "@/app/clients/supabaseServer";
import {CreateTaskForm} from "@/app/admin/create-task-form";
import {supabaseAdmin} from "@/app/clients/supabaseAdmin";

export default async function AdminPage() {
  const {data: {user}} = await supabaseServer.auth.getUser();
  if (!user) {
    return <div>Not logged in</div>
  }
  console.log("User", user)
  const {data: linkedUser} = await supabaseAdmin.from('users').select().eq('user_id', user.id).maybeSingle<ToastUser>()
  let userRole = linkedUser?.user_role;
  console.log("Linked user", linkedUser, userRole)
  if (!linkedUser || userRole !== "admin") {
    return <div>Not an admin</div>
  }

  return (
    <CreateTaskForm/>
  )

}

