"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractiveLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string;
  children: React.ReactNode;
  loadingText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}

export function InteractiveLink({
  href,
  children,
  loadingText,
  variant = "default",
  className,
  ...props
}: InteractiveLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={isPending || props.disabled}
      {...props}
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2 shrink-0" />
          {loadingText || "Loading..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
