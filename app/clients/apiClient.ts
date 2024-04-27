import {createClientClient} from "@/utils/supabase/client";
import {Task, UserTask} from "@/types";

export async function getTasks() {
    const {data: tasks} = await createClientClient().from('tasks').select().order('created_at', {ascending: false}).returns<Task[]>()
    console.log("[getTasks] Tasks", tasks)
    return tasks || []
}

export async function getUserTasks() {
    const {data: userTasks} = await createClientClient().from('user_tasks').select().returns<UserTask[]>()
    console.log("[getUserTasks] User tasks", userTasks)
    return userTasks || []
}