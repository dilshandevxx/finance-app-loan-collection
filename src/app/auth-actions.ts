"use server";

import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

// Define the valid agent PIN for the client instance, falling back to a default
const AGENT_PIN = process.env.AGENT_PIN || "1234";

export async function getAgentPin(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "agent_pin")
      .maybeSingle();

    if (data?.value) {
      return data.value;
    }
  } catch (err) {
    console.error("Failed to fetch agent pin from DB, using fallback", err);
  }
  return AGENT_PIN;
}

export async function loginWithPin(pin: string) {
  const activePin = await getAgentPin();
  if (pin === activePin) {
    // Set a secure HTTP-only cookie to keep the agent logged in
    (await cookies()).set({
      name: "agent_session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Invalid PIN" };
}

export async function updateAgentPin(currentPin: string, newPin: string) {
  const activePin = await getAgentPin();
  if (currentPin !== activePin) {
    return { success: false, error: "Current PIN is incorrect" };
  }
  
  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "New PIN must be exactly 4 digits" };
  }

  try {
    const { error } = await supabase
      .from("system_settings")
      .upsert({ key: "agent_pin", value: newPin }, { onConflict: "key" });

    if (error) {
      console.error("Failed to upsert agent pin:", error);
      return { success: false, error: `Failed to save new PIN: ${error.message}` };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Error updating agent pin:", err);
    return { success: false, error: err?.message || "An unexpected error occurred" };
  }
}

export async function logout() {
  (await cookies()).delete("agent_session");
  return { success: true };
}
