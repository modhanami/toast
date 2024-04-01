"use client";

import {toast} from "sonner";
import {Task} from "@/types";

export function TaskItem({task}: { task: Task }) {
  async function onTaskComplete() {
    toast(`Task ${task.title} (ID: ${task.id}) completed!`);

    // call the API to complete the task
    const response = await fetch(`/api/tasks/${task.id}/complete`, {
      method: "POST",
    });

    console.log("Task complete response", response);
    const data = await response.json();
    console.log("Task complete data", data)
  }

  return (
    <div className="flex gap-2">
      <span>{task.title}</span>
      <button
        onClick={() => onTaskComplete()}
        className="bg-primary-foreground px-3 py-1 rounded"
      >
        Complete
      </button>
    </div>
  )
}