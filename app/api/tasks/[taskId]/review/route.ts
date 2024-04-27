"use server"
import {NextResponse} from "next/server";
import {ARSAHUB_API_KEY, ARSAHUB_API_URL} from "@/lib/arsahub";
import {ReviewRequest, Task, UserTask} from "@/types";
import {createClient} from "@supabase/supabase-js";
import {createServerClient} from "@/utils/supabase/server";

// Complete task
// POST /api/tasks/{id}/review
export async function POST(request: Request,
                           {params}: { params: { taskId: string } }
) {
    const taskId = params.taskId;
    const supabaseServerClient = createServerClient();
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const review = await request.json() as ReviewRequest;

    const {
        data: {user},
    } = await supabaseServerClient.auth.getUser();
    if (!user) {
        return NextResponse.json({error: "Not logged in"}, {status: 401});
    }

    const {data: task} = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!).from('tasks').select().eq('id', taskId).maybeSingle<Task>();
    if (!task) {
        console.log("Task not found", taskId)
        return NextResponse.json({error: "Task not found"}, {status: 404});
    }


    // Send trigger to gamification platform
    const response = await fetch(`${ARSAHUB_API_URL}/apps/trigger`, {
        method: "POST",
        headers: {
            "X-Api-Key": ARSAHUB_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "key": "task_reviewed",
            "userId": user.id,
            "params": {
                "task_id": Number(taskId),
                "review": review.review,
                "points_earned": task.review_points,
            }
        }),
    });

    const text = await response.text()
    console.log("Trigger response", response.status, text);
    if (!response.ok) {
        return NextResponse.json({error: text}, {status: response.status});
    }

    const {data: userTask, error: userTaskError} = await supabaseAdmin.from('user_tasks').update({
        review: review.review,
        reviewed_at: new Date(),
    }).eq('task_id', taskId).eq('user_id', user.id).select().returns<UserTask>();
    console.log("User task", userTask)
    console.log("User task error", userTaskError)

    if (userTaskError) {
        return NextResponse.json({error: userTaskError}, {status: 500});
    }

    return NextResponse.json(userTask);
}
