export interface Task {
  id?: string;
  title: string;
  description: string;
  points: number;
  created_at: string;
}

export interface UserTask {
  user_id: string;
  task_id: string;
  completed_at: Date;
}

export interface ToastUser {
  id: string;
  user_id: string;
  user_role: "admin" | undefined;
  arsahub_onboarded_at: string;
}
