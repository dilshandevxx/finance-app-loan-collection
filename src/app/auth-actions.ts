"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";

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

export async function adminCreateAgent(fullName: string, companyName: string, email: string, tempPassword: string) {
  try {
    const supabase = await createClient();
    
    // 1. Verify caller is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in as admin" };

    // 2. Instantiate Admin Client
    const adminSupabase = getSupabaseClient();

    // 3. Create the user
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm
      user_metadata: {
        full_name: fullName,
        company_name: companyName
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
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

  const { data } = await supabase
    .from("user_profiles")
    .select(`
      hashed_pin,
      tenants!inner (
        name
      )
    `)
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

export async function updateAuthPassword(newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { success: false, error: `Failed to update password: ${error.message}` };
  }

  return { success: true };
}

export async function updateUserProfileImage(avatarUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(`
      full_name, 
      email, 
      hashed_pin,
      tenants (
        name
      )
    `)
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

  // Always prefer the confirmed email from Supabase Auth
  const displayEmail = user.email || profile?.email || "No email";
  const avatarUrl = user.user_metadata?.avatar_url || "";
  
  // Type assertion since PostgREST can return an array or object for joins
  const tenantData = profile?.tenants as unknown as { name?: string };
  const userMetadataCompany = user.user_metadata?.company_name;

  return {
    id: user.id,
    name: displayName,
    email: displayEmail,
    pin: profile?.hashed_pin || "Not set",
    avatarUrl,
    companyName: userMetadataCompany || tenantData?.name || "My Loan Company"
  };
}

export async function inviteAgent(email: string, fullName: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get the current user's profile to retrieve their tenant_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };
    
    const { data: currentProfile } = await supabase
      .from("user_profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
      
    if (!currentProfile?.tenant_id) {
      return { success: false, error: "Could not determine organization/tenant ID" };
    }
    
    // 2. Instantiate the Admin/Service-Role Supabase client to call inviteUserByEmail
    const adminSupabase = getSupabaseClient();
    
    // 3. Detect host to set correct redirection URL
    const { headers } = await import("next/headers");
    const host = (await headers()).get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const redirectUrl = `${protocol}://${host}/login/pin`;

    // 4. Invite the user and store tenant_id & full_name in metadata
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: fullName,
          tenant_id: currentProfile.tenant_id
        },
        redirectTo: redirectUrl
      }
    );
    
    if (inviteError) {
      return { success: false, error: inviteError.message };
    }

    // 5. In case database triggers don't copy the profile automatically, upsert manually
    if (inviteData?.user) {
      await adminSupabase
        .from("user_profiles")
        .upsert({
          id: inviteData.user.id,
          tenant_id: currentProfile.tenant_id,
          email: email,
          full_name: fullName
        });
    }
    
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    const { headers } = await import("next/headers");
    const host = (await headers()).get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const redirectUrl = `${protocol}://${host}/login/reset-password`;

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
