"use client"
import {useEffect, useMemo, useState} from "react";
import {Task, UserTask} from "@/types";
import {getTasks, getUserTasks} from "@/app/clients/apiClient";
import {Button} from "@/components/ui/button";
import {CheckIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils";
import {toast} from "sonner";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [userTasks, setUserTasks] = useState<UserTask[]>([])

  function loadTasks() {
    getTasks().then(setTasks)
  }

  function loadUserTasks() {
    // call the API to get the user's tasks
    getUserTasks().then(setUserTasks)
  }

  useEffect(loadTasks, []);
  useEffect(loadUserTasks, []);

  async function completeTask(task: Task) {
    // call the API to complete the task
    console.log("Completing task", task)

    const response = await fetch(`/api/tasks/${task.id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (response.ok) {
      console.log("Task completed", task)
      toast.success(`Task completed: ${task.title}! You earned ${task.points} points.`)
    } else {
      console.error("Failed to complete task", task)
    }

    loadTasks()
    loadUserTasks()


  }

  const completedTaskIds = useMemo(() => {
    return new Set(userTasks.map(userTask => userTask.task_id))
  }, [userTasks])


  return (
    <div>
      {tasks.map(task => {
        const disabled = completedTaskIds.has(task.id!);
        return (
          <div key={task.id} className="grid grid-cols-[2fr_1fr] items-center p-4 gap-4">
            <div className={cn("grid gap-1", {
              "line-through text-foreground/50": disabled
            })}>
              <h2 className={cn(
                "text-base", {
                  "font-semibold": !disabled
                }
              )}>{task.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{task.points || 0} points</p>
            </div>
            <Button className="w-8 h-8 rounded-full ml-auto" size="icon" variant="outline"
                    onClick={() => completeTask(task)}
                    disabled={disabled}
            >
              {/*<TrashIcon className="w-4 h-4"/>*/}
              <CheckIcon className="w-4 h-4"/>
              <span className="sr-only">Complete</span>
            </Button>
          </div>
        );
      })}
    </div>
  )
}