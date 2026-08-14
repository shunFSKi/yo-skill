import type { MetadataRoute } from "next";

import { getRegistryIndex, getRegistryMeta } from "@/lib/registry";
import { safeId } from "@/lib/safe-id";

const SITE_URL = "https://yo-skill.app";

/** 站点地图：主路由 + 市场详情头部 200 条（与 generateStaticParams 同一排序口径） */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [items, meta] = await Promise.all([getRegistryIndex(), getRegistryMeta()]);
  const updated = new Date(meta.generated_at);

  const head = [...items]
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.stars ?? -1) - (a.stars ?? -1);
    })
    .slice(0, 200)
    .map((i) => ({
      url: `${SITE_URL}/market/item/${safeId(i.id)}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [
    { url: SITE_URL, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/market`, lastModified: updated, changeFrequency: "daily", priority: 0.9 },
    ...head,
  ];
}
