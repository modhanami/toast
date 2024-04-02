"use server";
import {NextResponse} from "next/server";
import {Task, ToastUser} from "@/types";
import {createClient} from "@supabase/supabase-js";
import {createServerClient} from "@/utils/supabase/server";
import {ARSAHUB_API_KEY, ARSAHUB_API_URL} from "@/lib/arsahub";

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

  const {title, description, points, review_keywords, review_points} = await request.json() as Task;
  const {
    data: newTasks,
    error
  } = await supabaseAdmin.from('tasks').insert({
    title,
    description,
    points,
    review_keywords,
    review_points,
    created_at: new Date(),
  }).select().returns<Task[]>();

  // get the one with latest id
  const newTask = newTasks
    // @ts-ignore
    ?.sort((a, b) => a.id! - b.id!).pop();
  if (error || !newTask) {
    console.error("Failed to create task", error);
    return NextResponse.error();
  } else {
    console.log("Created new task", newTask);
  }

  // create a rule with trigger task_reviewed if review_keywords are provided
  if (review_keywords) {
    const response = await fetch(`${ARSAHUB_API_URL}/apps/rules`, {
      method: "POST",
      headers: {
        "X-Api-Key": ARSAHUB_API_KEY,
        "Content-Type": "application/json"

      },
      body: JSON.stringify({
        "title": `Review task ID ${newTask.id} for points`,
        "description": null,
        "trigger": {
          "key": "task_reviewed",
          "params": null
        },
        "action": {
          "key": "add_points",
          "params": {
            "pointsExpression": "points_earned"
          }
        },
        "repeatability": "once_per_user",
        "actionAddPointsMode": "dynamic",
        "conditionExpression": `${buildConditionExpression(newTask.id!, review_keywords)}`,
        "accumulatedFields": null
      }),
    });

    const text = await response.text()
    console.log("Rule response", response.status, text);
  }

  return NextResponse.json(newTask);
}

function buildConditionExpression(id: string, review_keywords: string[]) {
  const result =
    `task_id == ${id} && ` +
    `${review_keywords.map(keyword => `review.contains("${keyword}")`).join(" && ")}`;

  console.log("Condition expression", result)
  return result;
}
