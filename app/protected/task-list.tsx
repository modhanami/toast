"use client"
import {useEffect, useMemo, useState} from "react";
import {Task, UserTask} from "@/types";
import {getTasks, getUserTasks} from "@/app/clients/apiClient";
import {Button} from "@/components/ui/button";
import {CheckIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils";
import {toast} from "sonner";
import {NotebookPenIcon} from "lucide-react";
import {Dialog, DialogContent, DialogHeader, DialogTrigger} from "@/components/ui/dialog";
import {CardTitle} from "@/components/ui/card";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [userTasks, setUserTasks] = useState<UserTask[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [currentReview, setCurrentReview] = useState<string>("")

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
    setIsSaving(true)
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

    setIsSaving(false)
  }

  const completedTaskIds = useMemo(() => {
    return new Set(userTasks.map(userTask => userTask.task_id))
  }, [userTasks])

  async function reviewTask(task: Task, review: string) {
    setIsSaving(true)
    // call the API to review the task
    console.log("Reviewing task", task)

    const response = await fetch(`/api/tasks/${task.id}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({review})
    })

    if (response.ok) {
      console.log("Task reviewed", task)
    } else {
      console.error("Failed to review task", task)
    }

    loadTasks()
    loadUserTasks()

    setCurrentReview("")
    setIsSaving(false)
  }


  return (
    <div>
      {tasks.map(task => {
        const completed = completedTaskIds.has(task.id!);
        const disabled = completed
        const canReview = Boolean(task.review_points) && completed
        return (
          <div key={task.id} className="grid grid-cols-[2fr_1fr] items-center p-4 gap-4">
            <div className={cn("grid gap-1", {
              "line-through text-foreground/50": disabled
            })}>
              <h2 className={cn(
                "text-base", {
                  "font-semibold": !disabled
                }
              )}>
                <span
                  className={cn("text-sm", {
                    "font-semibold": !disabled
                  })}>{task.id}. &nbsp;</span>
                {task.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{task.points || 0} points</p>
            </div>
            <div className="flex gap-2 items-center">
              {/* Can review fore extra points */}
              {task.review_points && (
                <Dialog>
                  <DialogTrigger disabled={isSaving || !canReview}>
                    <Button className="w-8 h-8 rounded-full ml-auto" size="icon" variant="outline"
                            disabled={isSaving || !canReview}
                    >
                      <NotebookPenIcon className="w-4 h-4"/>
                      <span className="sr-only">Review</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <CardTitle>Review task {task.id}. {task.title}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Review the task to earn extra points</p>
                      <textarea
                        value={currentReview}
                        onChange={e => setCurrentReview(e.target.value)}
                        className="w-full h-32 p-2 border border-gray-200 rounded-lg"
                      />
                      <Button
                        onClick={() => reviewTask(task, currentReview)}
                        disabled={isSaving || !canReview}
                      >
                        Review
                      </Button>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              )}

              <Button className="w-8 h-8 rounded-full ml-auto" size="icon" variant="outline"
                      onClick={() => completeTask(task)}
                      disabled={disabled || isSaving}
              >
                <CheckIcon className="w-4 h-4"/>
                <span className="sr-only">Complete</span>
              </Button>

            </div>
          </div>
        );
      })}
    </div>
  )
}