import {NextResponse} from "next/server";
import {ARSAHUB_API_KEY, ARSAHUB_API_URL} from "@/lib/arsahub";
import {supabaseServer} from "@/app/clients/supabaseServer";

// Complete task
// POST /api/tasks/{id}/complete
export async function POST(request: Request,
                           {params}: { params: { taskId: string } }
) {
  const taskId = params.taskId;

  // await supabase.from('tasks').update({completed: true}).eq('id', taskId);
  const task = await supabaseServer.from('tasks').select().eq('id', taskId);
  console.log("Completed task", task);

  const {
    data: {user},
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.error();
  }

  // Send trigger to gamification platform
  const response = await fetch(`${ARSAHUB_API_URL}/apps/trigger`, {
    method: "POST",
    headers: {
      "X-Api-Key": ARSAHUB_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "key": "task_completed",
      "userId": user?.id,
      "params": {
        "task_id": 1
      }
    }),
  });

// await supabase.from('tasks').update({completed: true}).eq('id', taskId);
  const text = await response.text()
  console.log("Trigger response", response.status, text);
  return NextResponse.json(task);
}
