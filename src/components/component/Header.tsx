"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

export function Header() {
  const { user, supabase } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm">
      <h1 className="text-xl font-bold">GPT-3.5-turbo</h1>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm font-medium">{user.email}</span>}
        {user ? (
          <Button onClick={handleLogout} variant="default">
            Log out
          </Button>
        ) : (
          <Button onClick={handleLogin}>Log in</Button>
        )}
      </div>
    </header>
  );
}
