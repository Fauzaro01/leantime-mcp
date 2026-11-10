import { readFileSync } from "node:fs";

export interface LeantimeConfig {
  url: string;
  token: string;
}

export function loadConfig(): LeantimeConfig {
  const envFile = process.env["LEANTIME_MCP_CONFIG"] ?? ".env";
  let url = process.env["LEANTIME_URL"] ?? "";
  let token = process.env["LEANTIME_TOKEN"] ?? "";

  try {
    const content = readFileSync(envFile, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [k, v] = trimmed.split("=", 2);
      if (!k || !v) continue;
      const key = k.trim().toLowerCase();
      const val = v.trim().replace(/^["']|["']$/g, "");
      if (key === "url" || key === "leantime_url") url = val;
      if (key === "token" || key === "leantime_token") token = val;
    }
  } catch {
    // env vars fallback
  }

  if (!url) throw new Error("Leantime URL not configured. Set LEANTIME_URL or .env file.");
  if (!token) throw new Error("Leantime token not configured. Set LEANTIME_TOKEN or .env file.");

  return { url: url.replace(/\/+$/, ""), token };
}
