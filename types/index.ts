import {NextApiResponse} from "next";
import {Server} from "socket.io";

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

export interface WebhookEvent {
  id?: number;
  webhook_id: string;
  user_id: string;
  raw: any;
  created_at: string;
}

export interface ExtendedNextApiResponse extends NextApiResponse {
  socket: NextApiResponse["socket"] & {
    server: {
      io?: Server;
    };
  };
}
