import { readFileSync } from "node:fs";

export type AuthMethod = "bearer" | "x-api-key";

export interface LeantimeConfig {
  url: string;
  authMethod: AuthMethod;
  token: string;
}

function expandPath(p: string): string {
  return process.env[p] || p;
}

export function loadConfig(): LeantimeConfig {
  const envFile = process.env["LEANTIME_MCP_CONFIG"] ?? ".env";
  let url = "";
  let authMethod: AuthMethod = "bearer";
  let token = "";

  try {
    const content = readFileSync(expandPath(envFile), "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [k, v] = trimmed.split("=", 2);
      if (!k || !v) continue;
      const key = k.trim().toLowerCase();
      const value = v.trim().replace(/^["']|["']$/g, "");
      switch (key) {
        case "url":
          url = value;
          break;
        case "auth":
          authMethod = value as AuthMethod;
          break;
        case "token":
        case "api_key":
          token = value;
          break;
      }
    }
  } catch {
    // file not found is okay — fall back to env
  }

  if (!url) throw new Error("Leantime URL not configured. Set LEANTIME_URL or .env file.");
  if (!token) throw new Error("Leantime token not configured. Set LEANTIME_TOKEN or .env file.");

  return { url: url.replace(/\/+$/, "") || "https://default.leantime.io", authMethod, token };
}
