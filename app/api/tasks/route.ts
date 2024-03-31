"use server";
import {NextResponse} from "next/server";
import {Task, ToastUser} from "@/types";
import {createClient} from "@supabase/supabase-js";
import {createServerClient} from "@/utils/supabase/server";

// create task
// POST /api/tasks
export async function POST(request: Request,
) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const supabaseServerClient = createServerClient();
  
  const {
    data: {user},
  } = await supabaseServerClient.auth.getUser();
  if (!user) {
    return NextResponse.error();
  }

  const {data: linkedUser} = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!).from('users').select().eq('user_id', user.id).maybeSingle<ToastUser>()
  if (!linkedUser || linkedUser.user_role !== "admin") {
    return NextResponse.error();
  }

  const {title, description, points} = await request.json() as Task;
  const {
    data: newTask,
    error
  } = await supabaseAdmin.from('tasks').insert({
    title,
    description,
    points,
    created_at: new Date(),
  }).select().returns<Task>();

  if (error) {
    console.error("Failed to create task", error);
    return NextResponse.error();
  } else {
    console.log("Created new task", newTask);
  }

  return NextResponse.json(newTask);
}