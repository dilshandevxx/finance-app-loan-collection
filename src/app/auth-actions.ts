"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function loginWithEmail(email: string) {
  const supabase = await createClient();
  
  // We use OTP (Magic Link) or Password. Let's assume you set them up with a default password,
  // or they just use Magic Link. Magic link is easiest for manual onboarding.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // You manually create them in Supabase to collect payment
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function loginWithPassword(email: string, password: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Also clear the PIN session
  const cookieStore = await cookies();
  cookieStore.delete("agent_session");
  
  revalidatePath("/", "layout");
  return { success: true };
}

// ==========================================
// PIN Logic (Secondary Lock)
// ==========================================

export async function getAgentPin(): Promise<string> {
  const supabase = await createClient();
  // Fetch from user_profiles instead of system_settings for multi-tenant
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "1234";

  const { data, error } = await supabase
    .from("user_profiles")
    .select("hashed_pin")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.hashed_pin) {
    return data.hashed_pin;
  }
  
  return "1234"; // Default if not set
}

export async function loginWithPin(pin: string) {
  const activePin = await getAgentPin();
  if (pin === activePin) {
    const cookieStore = await cookies();
    cookieStore.set({
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const activePin = await getAgentPin();
  if (currentPin !== activePin) {
    return { success: false, error: "Current PIN is incorrect" };
  }
  
  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "New PIN must be exactly 4 digits" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .upsert({ 
      id: user.id,
      hashed_pin: newPin 
    });

  if (error) {
    return { success: false, error: `Failed to save new PIN: ${error.message}` };
  }
  return { success: true };
}
