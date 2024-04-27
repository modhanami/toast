"use client"
import {useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {createClientClient} from "@/utils/supabase/client";
import {User} from "@supabase/gotrue-js/src/lib/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {toast} from "sonner";
import {AppUserPointsHistoryResponse} from "@/app";

dayjs.extend(relativeTime)

let socket: Socket;
export const IMAGE_BASE_URL = "https://ash-dev.modhanami.com";

export function getImageUrlFromKey(key: string) {
    const url = new URL(key, IMAGE_BASE_URL);
    return url.toString();
}

export function NotificationBox() {
    const [pointsHistory, setPointsHistory] = useState<AppUserPointsHistoryResponse[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const supabaseClientClient = createClientClient();

    useEffect(() => {
        (async () => {
            await fetch("/api/socket");

            socket = io({
                path: "/api/socket.io",
            });

            socket?.on("connect", () => {
                console.log("Connected", socket.id);
            });

        })();

        return () => {
            socket?.close();
        }
    }, []);

    useEffect(() => {
        supabaseClientClient.auth.getUser().then(({data}) => {
            if (data.user) {
                console.log("User", data.user);
                setUser(data.user);
            } else {
                console.log("Not logged in");
            }
        });

        // init pointsHistory history
        getPointsHistory().then((pointsHistory) => {
            if (pointsHistory) {
                setPointsHistory(pointsHistory);
            }
        })
    }, []);

    async function getPointsHistory(): Promise<AppUserPointsHistoryResponse[] | undefined> {
        const response = await fetch("/api/me/points/history");
        const json = await response.json();
        console.log("Points history", json);
        if (!response.ok) {
            toast.error("Failed to fetch points history");
            return undefined;
        }
        return json.slice(0, 10);
    }

    console.log("Events", pointsHistory)

    // refresh with interval of 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            getPointsHistory().then((pointsHistory) => {
                if (pointsHistory) {
                    setPointsHistory(pointsHistory);
                }
            })
        }, 2000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <div>
            <h1 className="text-lg font-medium mb-4">10 Latest Notifications</h1>
            <ul>
                {pointsHistory.map((event, index) => {
                    const timeAgo = datetimeFormatter.format(new Date(event.createdAt))

                    return (
                        <div key={index} className="flex flex-col items-start mb-4">
                            <div className="flex flex-col gap-1 text-sm">
                                <p className="text-emerald-300">You earned {event.pointsChange} points!</p> <span
                                className="text-muted-foreground text-xs">on {timeAgo}</span>
                                <p className="text-muted-foreground text-xs">from '{event.fromRule?.title}'
                                    (ID: {event.fromRule?.id})</p>
                            </div>
                        </div>
                    )
                })}
                {pointsHistory.length === 0 && (
                    <li className="text-muted-foreground">No notifications</li>
                )}
            </ul>
        </div>
    )
}

const datetimeFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
});