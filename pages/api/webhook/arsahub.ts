import {createHmac} from 'crypto';
import {NextApiRequest} from 'next';
import {createClient} from '@supabase/supabase-js';
import {ExtendedNextApiResponse, WebhookEvent} from "@/types";

export default async function handler(req: NextApiRequest, res: ExtendedNextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  console.log("ArsaHub webhook request", req.headers);
  const body = req.body;
  console.log("ArsaHub webhook json", body);
  const signature = req.headers['x-webhook-signature'];
  if (!signature) {
    return res.status(400).send("Missing signature");
  }

  // Validate the signature
  const webhookSecret = process.env.ARSAHUB_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).send("Missing webhook secret");
  }
  const expectedSignature = createHmac("sha256", webhookSecret).update(JSON.stringify(body)).digest("base64");
  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  } else {
    console.log("Valid signature");
  }

  // Process the webhook
  // For example, send a notification to the user
  // {"id":"814debce-d3da-4349-8ad2-68eda40d3524","event":"points_updated","appUserId":"4962e3db-37a8-4cc1-aabe-2c4f4b39025d","payload":{"points":349,"pointsChange":20}}
  console.log("Processing ArsaHub webhook");
  // Store webhook_event in the database to prevent duplicate processing
  const webhookEvent: WebhookEvent = {
    webhook_id: body.id,
    user_id: body.appUserId,
    raw: body,
    created_at: new Date().toISOString()
  };
  console.log("Webhook event", webhookEvent);

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const {data: newWebhookEvents, error} = await supabaseAdmin
    .from('webhook_events')
    .insert(webhookEvent)
    .select()
    .returns<WebhookEvent[]>();

  const newWebhookEventElement = newWebhookEvents?.[0];
  if (error || !newWebhookEventElement) {
    console.error("Failed to create webhook event", error);
    return res.status(500).send("Failed to create webhook event");
  } else {
    console.log("Created new webhook event", newWebhookEventElement);
    console.log("Emitting to user", webhookEvent.user_id);
    res.socket?.server?.io?.to(webhookEvent.user_id).emit("webhookEvent", newWebhookEventElement);
  }

  return res.status(200).send("OK");
}