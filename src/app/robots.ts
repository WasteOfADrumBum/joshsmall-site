import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { robotsForHost } from "@/lib/robots-policy";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  return robotsForHost(host);
}
