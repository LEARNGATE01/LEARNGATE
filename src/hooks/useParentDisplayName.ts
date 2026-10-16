import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";

function clean(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function useParentDisplayName() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabase) {
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) {
        return;
      }

      const metaName = clean(user?.user_metadata?.full_name);
      if (metaName) {
        setName(metaName);
        return;
      }
      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) {
        return;
      }

      setName(clean(profile?.full_name) ?? clean(user.email?.split("@")[0]));
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return name;
}
