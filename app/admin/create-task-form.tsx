"use client"

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {JSX, SVGProps, useEffect, useState} from "react";

import {getTasks} from "@/app/clients/apiClient";
import {Task} from "@/types";
import {toast} from "sonner";
import {datetimeFormatter} from "@/app/protected/notification-box";

export function CreateTaskForm() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [points, setPoints] = useState(0)
    const [tasks, setTasks] = useState<Task[]>([])
    const [reviewKeywords, setReviewKeywords] = useState<string>("")
    const [reviewPoints, setReviewPoints] = useState(0)
    const [withReview, setWithReview] = useState(false)

    async function createTask() {
        if (withReview) {
            if (!reviewKeywords) {
                alert("Please enter review keywords")
                return
            }
            if (!reviewPoints) {
                alert("Please enter review points")
                return
            }
        }
        // call the API to create the task
        const processedReviewKeywords = processReviewKeywords(reviewKeywords);
        const payload: Task = {
            title,
            description, points,
            review_keywords: withReview ? processedReviewKeywords : undefined,
            review_points: withReview ? reviewPoints : undefined
        };
        console.log("Creating task", payload)

        const response = await fetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            const text = await response.text()
            console.error("Failed to create task", response)
            toast.error(`Failed to create task: ${response.statusText} ${text}`)
            return
        }

        const data = await response.json() as Task
        console.log("Task created", data)
        toast.success("Task created")
        loadTasks()
    }


    function loadTasks() {
        getTasks().then(setTasks)
    }

    function processReviewKeywords(reviewKeywords: string): string[] {
        return reviewKeywords.split(",")
            .map(keyword => keyword.trim())
            .filter(Boolean)

    }

    useEffect(loadTasks, [])

    return (
        <div className="flex flex-col min-w-[600px] max-w-xl gap-4 pt-16">
            <div className="grid gap-2">
                <Label className="text-sm" htmlFor="title">
                    Title
                </Label>
                <Input id="title" placeholder="Enter the title" required value={title}
                       onChange={(e) => setTitle(e.target.value)}/>
            </div>
            <div className="grid gap-2">
                <Label className="text-sm" htmlFor="description">
                    Description
                </Label>
                <Textarea className="min-h-[100px]" id="description" placeholder="Enter the description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}/>
            </div>
            <div className="grid gap-2">
                <Label className="text-sm" htmlFor="points">
                    Points for completion
                </Label>
                <Input id="points" placeholder="Enter the points" type="number" required value={points}
                       onChange={(e) => setPoints(Number(e.target.value))}/>
            </div>

            <div className="gap-2 flex items-center">
                <input id="withReview" type="checkbox" checked={withReview}
                       onChange={(e) => setWithReview(e.target.checked)}/>
                <Label className="text-sm" htmlFor="withReview">
                    With Review
                </Label>
            </div>

            {withReview && (
                <>
                    <div className="grid gap-2">
                        <Label className="text-sm" htmlFor="reviewKeywords">
                            Review Keywords
                        </Label>
                        <Textarea id="reviewKeywords" placeholder="Enter the comma-separated review keywords"
                                  value={reviewKeywords}
                                  onChange={(e) => setReviewKeywords(e.target.value)}
                                  onBlur={(e) => {
                                      setReviewKeywords(processReviewKeywords(e.target.value).join(","))
                                  }}/>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-sm" htmlFor="reviewPoints">
                            Points for review
                        </Label>
                        <Input id="reviewPoints" placeholder="Enter the points for a review" type="number" required
                               value={reviewPoints}
                               onChange={(e) => setReviewPoints(Number(e.target.value))}/>
                    </div>
                </>
            )}

            <Button className="w-[150px]"
                    onClick={createTask}>Add task</Button>

            <div className="border rounded-lg divide-y">
                {tasks.map(task => (
                    <div key={task.id} className="grid grid-cols-[2fr_1fr] items-center p-4 gap-4">
                        <div className="grid gap-1">
                            <h2 className="font-semibold">{task.id}. {task.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400"><span
                                className="text-lg font-medium text-amber-300">{task.points || 0}</span> points</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{datetimeFormatter.format(new Date(task.created_at!))}</p>
                        </div>
                        <Button className="w-8 h-8 rounded-full ml-auto" size="icon" variant="outline">
                            <TrashIcon className="w-4 h-4"/>
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )

}

export function TrashIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
    )
}
