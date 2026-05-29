import { hasAgentPinSetup } from "@/app/auth-actions";
import PinClient from "./PinClient";
import { createClient } from "@/utils/supabase/server";
import { config } from "@/lib/config";

export default async function PinPage() {
  const isSetup = await hasAgentPinSetup();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let agentName = config.agentName;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.full_name) {
      agentName = profile.full_name;
    } else if (user.user_metadata?.full_name) {
      agentName = user.user_metadata.full_name;
    } else if (user.email) {
      agentName = user.email.split('@')[0];
      agentName = agentName.charAt(0).toUpperCase() + agentName.slice(1);
    }
  }
  
  return <PinClient isSetup={isSetup} agentName={agentName} />;
}
