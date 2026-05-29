import { hasAgentPinSetup } from "@/app/auth-actions";
import PinClient from "./PinClient";

export default async function PinPage() {
  const isSetup = await hasAgentPinSetup();
  
  return <PinClient isSetup={isSetup} />;
}
