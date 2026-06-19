import { createClient } from "@/lib/supabase/server";
import { MessageList } from "@/components/admin/MessageList";

export const metadata = { title: "Messages" };

export default async function MessagesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Messages</h1>
      <MessageList messages={data ?? []} />
    </div>
  );
}
