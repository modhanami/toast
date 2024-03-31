"use client"

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {JSX, SVGProps, useEffect, useState} from "react";

import {Task} from "@/app/api/tasks/route";
import {supabaseClient} from "@/app/clients/supabaseClient";

export function CreateTaskForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [points, setPoints] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])

  async function createTask() {
    // call the API to create the task
    console.log("Creating task", {title, description, points})

    const response = await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({title, description, points}),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const data = await response.json() as Task
    console.log("Task created", data)
    loadTasks()
  }

  async function getTasks() {
    const {data: tasks} = await supabaseClient.from('tasks').select().returns<Task[]>()
    console.log("[getTasks] Tasks", tasks)
    return tasks || []
  }

  function loadTasks() {
    getTasks().then(setTasks)
  }

  useEffect(loadTasks, [])

  return (
    <div className="flex flex-col max-w-xl gap-4 pt-16">
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
        <Textarea className="min-h-[100px]" id="description" placeholder="Enter the description" value={description}
                  onChange={(e) => setDescription(e.target.value)}/>
      </div>
      <div className="grid gap-2">
        <Label className="text-sm" htmlFor="points">
          Points for completion
        </Label>
        <Input id="points" placeholder="Enter the points" type="number" required value={points}
               onChange={(e) => setPoints(Number(e.target.value))}/>
      </div>
      <Button className="w-[150px]"
              onClick={createTask}>Add task</Button>

      <div className="border rounded-lg divide-y">
        <div className="grid grid-cols-[2fr_1fr] items-center p-4 gap-4">
          <div className="grid gap-1">
            <h2 className="font-semibold text-base">Wireframe the app</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a basic wireframe for the app layout</p>
          </div>
          <Button className="w-8 h-8 rounded-full ml-auto" size="icon" variant="outline">
            <TrashIcon className="w-4 h-4"/>
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        <div className="grid grid-cols-[2fr_1fr] items-center p-4 gap-4">
          <div className="grid gap-1">
            <h2 className="font-semibold text-base">Implement the sidebar</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add the sidebar with navigation links</p>
          </div>
          <Button className="w-8 h-8 rounded-full ml-auto" size="icon" variant="outline">
            <TrashIcon className="w-4 h-4"/>
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        <div className="grid grid-cols-[2fr_1fr] items-center p-4 gap-4">
          <div className="grid gap-1">
            <h2 className="font-semibold text-base">Write the documentation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create user documentation for the app</p>
          </div>
          <Button className="w-8 h-8 rounded-full ml-auto" size="icon" variant="outline">
            <TrashIcon className="w-4 h-4"/>
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        {tasks.map(task => (
          <div key={task.id} className="grid grid-cols-[2fr_1fr] items-center p-4 gap-4">
            <div className="grid gap-1">
              <h2 className="font-semibold text-base">{task.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{task.points || 0} points</p>
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

function TrashIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
