import AuthButton from "@/components/AuthButton";
import {redirect} from "next/navigation";
import {TaskItem} from "@/app/protected/task";
import {ModeToggle} from "@/components/mode-toggle";
import {ARSAHUB_API_KEY, ARSAHUB_API_URL} from "@/lib/arsahub";

import {supabaseServer} from "@/app/clients/supabaseServer";
import {Task} from "@/types";
import {supabaseAdmin} from "@/app/clients/supabaseAdmin";

export interface ToastUser {
  id: string;
  user_id: string;
  user_role: "admin" | undefined;
  arsahub_onboarded_at: string;
}


export default async function ProtectedPage() {

  const {
    data: {user},
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const {data: linkedUser} = await supabaseAdmin.from('users').select().eq('user_id', user.id).maybeSingle<ToastUser>()
  if (!linkedUser) {
    // create arsahub user
    const arsahubResponse = await fetch(`${ARSAHUB_API_URL}/apps/users`, {
      method: "POST",
      headers: {
        "X-Api-Key": ARSAHUB_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "uniqueId": user.id,
        "displayName": user.email,
      }),
    });

    const text = await arsahubResponse.text()
    if (!arsahubResponse.ok) {
      console.error("Failed to create user in arsahub", arsahubResponse.status, text);
    }

    const {data: newUser, error} = await supabaseAdmin.from('users').insert({
      user_id: user.id,
      arsahub_onboarded_at: new Date(),
    }).maybeSingle<ToastUser>()

    if (error) {
      console.error("Failed to create user in supabase", error);
      return redirect("/");
    } else {
      console.log("Created new user", newUser);
    }
  }

  const {data: tasks} = await supabaseServer.from('tasks').select();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-primary-foreground text-center">
          This is a protected page that you can only see as an authenticated
          user
        </div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <AuthButton/>
            <ModeToggle/>
          </div>
        </nav>
      </div>

      <div className="flex gap-4 w-[1000px]">
        <iframe
          className="w-1/2 h-96 border-2 border-primary-foreground rounded-lg overflow-hidden shadow-lg"
          src="http://localhost:3000/embed/apps/43/leaderboard"
          frameBorder="0"
        />

        <iframe
          className="w-1/2 h-96 border-2 border-primary-foreground rounded-lg overflow-hidden shadow-lg"
          src={`http://localhost:3000/embed/apps/43/users/${user.id}`}
          frameBorder="0"
        />
      </div>

      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          {tasks ? (
            <div>
              <h2 className="font-bold text-4xl mb-4">Tasks</h2>
              <ul>
                {tasks.map((task: Task) => (
                  <li key={task.id} className="flex justify-between">
                    <TaskItem task={task}/>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>
              No tasks found
            </p>
          )}
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
