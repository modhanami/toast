import AuthButton from "@/components/AuthButton";
import {redirect} from "next/navigation";
import {ModeToggle} from "@/components/mode-toggle";
import {ARSAHUB_API_KEY, ARSAHUB_API_URL, ARSAHUB_URL} from "@/lib/arsahub";
import {TaskList} from "./task-list";
import {ToastUser} from "@/types";
import {createClient} from "@supabase/supabase-js";
import {createServerClient} from "@/utils/supabase/server";
import {NotificationBox} from "@/app/protected/notification-box";

export default async function ProtectedPage() {
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const supabaseServerClient = createServerClient();

    const {
        data: {user},
    } = await supabaseServerClient.auth.getUser();

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

        // send trigger user_registered
        const response = await fetch(`${ARSAHUB_API_URL}/apps/trigger`, {
            method: "POST",
            headers: {
                "X-Api-Key": ARSAHUB_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "key": "user_registered",
                "userId": user.id,
                "params": {}
            }),
        });

        const triggerRegisteredResponse = await response.text()
        console.log("triggerRegisteredResponse", response.status, triggerRegisteredResponse);

        const {
            data: newUser,
            error
        } = await supabaseAdmin.from('users').insert({
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

            <div className="flex gap-12 w-full p-4">
                <div className="flex flex-col gap-8 items-end">

                    <iframe
                        className="h-[600px] w-[400px] border-2 border-primary-foreground rounded-lg overflow-hidden shadow-lg"
                        src={`${ARSAHUB_URL}/embed/apps/${process.env.ARSAHUB_APP_ID}/users/${user.id}`}
                        frameBorder="0"
                    />

                    <iframe
                        className="h-[500px] w-[500px] border-2 border-primary-foreground rounded-lg overflow-hidden shadow-lg"
                        src={`${ARSAHUB_URL}/embed/apps/${process.env.ARSAHUB_APP_ID}/leaderboard`}
                        frameBorder="0"
                    />

                </div>

                <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
                    <main className="flex-1 flex flex-col gap-6">
                        <h2 className="font-bold text-4xl mb-2">Task List</h2>
                        <p className="text-muted-foreground">
                            You earn points by completing tasks. The more tasks you complete, the more points you earn.
                            <br/>
                            Some tasks also allow you to earn extra points by sharing your review <span
                            className="text-yellow-300">(all keywords must be
                            included.)</span>
                        </p>
                        <TaskList/>
                    </main>
                </div>

                <NotificationBox/>
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
