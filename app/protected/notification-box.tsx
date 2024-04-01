"use client"
import Image from 'next/image'
import {WebhookEvent} from "@/types";
import {useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {createClientClient} from "@/utils/supabase/client";
import {User} from "@supabase/gotrue-js/src/lib/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {toast} from "sonner";

dayjs.extend(relativeTime)

let socket: Socket;
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

export function getImageUrlFromKey(key: string) {
  const url = new URL(key, IMAGE_BASE_URL);
  return url.toString();
}

export function NotificationBox() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
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

    // init events history
    (async () => {
      console.log("Fetching events")
      const {
        data: events,
        error
      } = await supabaseClientClient.from("webhook_events").select().order("created_at", {ascending: false}).limit(10).returns<WebhookEvent[]>();
      if (error) {
        console.error("Failed to fetch events", error);
      } else {
        console.log("Fetched events", events)
        setEvents(events);
      }
    })()
  }, []);

  useEffect(() => {
    if (user && socket) {
      socket.emit("join", user.id);
      socket.on("webhookEvent", (newEvent: WebhookEvent) => {
        console.log("Webhook event", newEvent);
        setEvents(events => {
          const webhookIds = new Set(events.map(event => event.webhook_id));
          console.log("Webhook IDs", webhookIds)
          console.log("Event webhook ID", newEvent.webhook_id)

          if (!("event" in newEvent.raw)) {
            console.log("Invalid event", newEvent)
            if (newEvent.raw.event === "points_updated") {
              toast.success(`You earned ${newEvent.raw.payload.pointsChange} points!`);
            }
            if (newEvent.raw.event === "achievement_unlocked") {
              const achievement = newEvent.raw.payload.achievement;
              toast.success(`You unlocked the achievement: ${achievement.title}`);
            }
          }


          if (!webhookIds.has(newEvent.webhook_id)) {
            const latestTenEvents = [...events, newEvent]
              .sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              })
              .slice(0, 10);
            return latestTenEvents;
          }
          return events;
        })
      });
    }
  }, [user, socket]);

  console.log("Events", events)
  // const descendingEvents = events.sort((a, b) => {
  //   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  // })
  const descendingEvents = events

  return (
    <div>
      <h1 className="text-lg font-medium">10 Latest Notifications</h1>
      <ul>
        {descendingEvents.map((event, index) => {
          if (!("event" in event.raw)) {
            console.log("Invalid event", event)
            return null;
          }

          const timeAgo = dayjs(event.created_at).fromNow();

          if (event.raw.event === "points_updated") {
            return (
              <li key={index} className="flex items-center gap-4 p-1">
                <span
                  className="text-sm text-muted-foreground">{timeAgo}</span>
                <p>You earned {event.raw.payload.pointsChange} points!</p>
              </li>
            )
          }

          if (event.raw.event === "achievement_unlocked") {
            const achievement = event.raw.payload.achievement;
            return (
              <li key={index} className="flex items-center gap-4 p-1">
                        <span
                          className="text-sm text-muted-foreground">{timeAgo}</span>
                <p>You unlocked the achievement: {achievement.title}</p>
                <Image
                  src={getImageUrlFromKey(achievement.imageKey)}
                  alt={achievement.title!.toString()}
                  width={50}
                  height={50}
                />
              </li>
            )
          }

          return null;
        })}
      </ul>
    </div>
  )
}