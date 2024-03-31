import {NextResponse} from "next/server";
import {ToastUser} from "@/app/protected/page";
import {supabaseServer} from "@/app/clients/supabaseServer";
import {supabaseAdmin} from "@/app/clients/supabaseAdmin";

// create task
// POST /api/tasks

export interface Task {
  id?: string;
  title: string;
  description: string;
  points: number;
  created_at: string;
}

export async function POST(request: Request,
) {
  const {
    data: {user},
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return NextResponse.error();
  }

  const {data: linkedUser} = await supabaseAdmin.from('users').select().eq('user_id', user.id).maybeSingle<ToastUser>()
  if (!linkedUser || linkedUser.user_role !== "admin") {
    return NextResponse.error();
  }

  const {title, description, points} = await request.json() as Task;
  const {data: newTask, error} = await supabaseAdmin.from('tasks').insert({
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