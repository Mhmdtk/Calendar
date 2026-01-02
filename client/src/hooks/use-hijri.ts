import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertHijriOverride } from "@shared/schema";

export function useHijriOverrides() {
  return useQuery({
    queryKey: [api.hijri.listOverrides.path],
    queryFn: async () => {
      const res = await fetch(api.hijri.listOverrides.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch overrides");
      return api.hijri.listOverrides.responses[200].parse(await res.json());
    },
  });
}

export function useSaveHijriOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHijriOverride) => {
      const payload = {
        ...data,
        gregorianDate: new Date(data.gregorianDate).toISOString(),
      };
      
      const res = await fetch(api.hijri.saveOverride.path, {
        method: api.hijri.saveOverride.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to save override");
      return api.hijri.saveOverride.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.hijri.listOverrides.path] }),
  });
}

export function useDeleteHijriOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.hijri.deleteOverride.path, { id });
      const res = await fetch(url, { method: api.hijri.deleteOverride.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete override");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.hijri.listOverrides.path] }),
  });
}
