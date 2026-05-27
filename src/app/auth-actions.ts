"use server";

import { cookies } from "next/headers";

// Define the valid agent PIN for the prototype
const AGENT_PIN = "1234";

export async function loginWithPin(pin: string) {
  if (pin === AGENT_PIN) {
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

export async function logout() {
  (await cookies()).delete("agent_session");
  return { success: true };
}
