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
import {Separator} from "@/components/ui/separator";

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

    const taskToUserTaskMap = useMemo(() => {
        const map = new Map<string, UserTask>()
        userTasks.forEach(userTask => {
            map.set(userTask.task_id, userTask)
        })
        return map
    }, [userTasks])

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
            const text = await response.text();
            console.error("Failed to complete task", task)
            toast.error(`Failed to complete task: ${response.statusText}: ${text}`)
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
            toast.success(`Task reviewed: ${task.title}!`)
        } else {
            const text = await response.text();
            console.error("Failed to review task", task, response.statusText, text)
            toast.error(`Failed to review task: ${response.statusText}: ${text}`)
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
                const keywordsText = task.review_keywords?.join(", ") || ""
                return (
                    <>
                        <div key={task.id} className="flex p-4 gap-8">

                            <div className="flex flex-col gap-2">
                                <div className={cn("flex flex-col gap-1", {
                                    "line-through opacity-30": disabled
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400"><span
                                        className="font-medium text-lg text-amber-300">{task.points || 0}</span> points
                                    </p>
                                </div>

                                {/*Review Call to action*/}

                                <p
                                    className={cn("text-sm text-gray-500 dark:text-gray-400", {})}
                                >
                                    Review the task to earn extra <span
                                    className="font-medium text-md text-pink-300">{task.review_points || 0}</span> points<br/>
                                    Required keywords: <span
                                    className="font-medium text-md text-emerald-300">{keywordsText}</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 ml-8">
                                <div className="flex gap-2 items-center">
                                    {/* Can review fore extra points */}
                                    {task.review_points && (
                                        <Dialog>
                                            <DialogTrigger disabled={isSaving || !canReview}>
                                                <Button className="flex px-4 py-2 gap-2" variant="outline"
                                                        disabled={isSaving || !canReview}
                                                >
                                                    <NotebookPenIcon className="w-4 h-4"/>
                                                    <div className="">Review</div>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <CardTitle>Review task {task.id}. {task.title}</CardTitle>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Review the
                                                        task
                                                        to
                                                        earn extra points</p>
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

                                    <Button className="flex px-4 py-2 gap-2"
                                            onClick={() => completeTask(task)}
                                            disabled={disabled || isSaving}
                                    >
                                        <CheckIcon className="w-4 h-4"/>
                                        <div className="">Complete</div>
                                    </Button>

                                </div>

                            </div>


                            {/*    Your review for this task */}
                            {taskToUserTaskMap.has(task.id!) && taskToUserTaskMap.get(task.id!)?.review && (
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold text-sm">Your review</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        {taskToUserTaskMap.get(task.id!)?.review}
                                    </p>
                                    <p className="text-sm">Result:</p> {reviewContainsAllKeywords(taskToUserTaskMap.get(task.id!)?.review || "", task.review_keywords || [])
                                    ? <p className="text-sm text-emerald-300">You earned {task.review_points} extra
                                        points!</p>
                                    : <p className="text-sm text-red-300">You did not earn the extra points</p>}
                                </div>
                            )}


                        </div>

                        <Separator/>
                    </>
                );
            })}
        </div>
    )
}

function reviewContainsAllKeywords(review: string, keywords: string[]) {
    return keywords.every(keyword => review.includes(keyword))
}