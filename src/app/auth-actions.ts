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

export async function getAgentPin(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("hashed_pin")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.hashed_pin) {
    return data.hashed_pin;
  }
  
  return null;
}

export async function hasAgentPinSetup(): Promise<boolean> {
  const pin = await getAgentPin();
  return pin !== null;
}

export async function setupAgentPin(newPin: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "New PIN must be exactly 4 digits" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ 
      hashed_pin: newPin 
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: `Failed to save PIN: ${error.message}` };
  }
  
  // Also log them in automatically
  const cookieStore = await cookies();
  cookieStore.set({
    name: "agent_session",
    value: "authenticated",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

export async function loginWithPin(pin: string) {
  const activePin = await getAgentPin();
  if (!activePin) return { success: false, error: "PIN not set up" };
  
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
  if (activePin && currentPin !== activePin) {
    return { success: false, error: "Current PIN is incorrect" };
  }
  
  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "New PIN must be exactly 4 digits" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ 
      hashed_pin: newPin 
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: `Failed to save new PIN: ${error.message}` };
  }
  return { success: true };
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, email, hashed_pin")
    .eq("id", user.id)
    .maybeSingle();

  let displayName = "Agent";
  if (profile?.full_name) {
    displayName = profile.full_name;
  } else if (user.user_metadata?.full_name) {
    displayName = user.user_metadata.full_name;
  } else if (profile?.email) {
    displayName = profile.email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  } else if (user.email) {
    displayName = user.email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }

  return {
    id: user.id,
    name: displayName,
    email: profile?.email || user.email || "No email",
    pin: profile?.hashed_pin || "Not set"
  };
}
