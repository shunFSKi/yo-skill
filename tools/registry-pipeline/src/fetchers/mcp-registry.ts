/**
 * 官方 MCP Registry 拉取器：/v0/servers 免认证，cursor 分页，全量拉取。
 * 同一 server 多版本返回，按 isLatest + active 去重过滤；
 * 入选门槛 = 有 packages 或 remotes（装得了）；repository 缺失也保留（不可审计但不影响安装）。
 */

import type { RegistryItem, EnvVar, InstallRecipe } from "../schema.ts";

const API = "https://registry.modelcontextprotocol.io/v0/servers";

interface McpEnv {
  name: string;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
}

interface McpPackage {
  registryType?: string;
  identifier?: string;
  environmentVariables?: McpEnv[];
}

interface McpRemote {
  type?: string;
  url?: string;
  headers?: McpEnv[];
}

interface McpServer {
  name: string;
  title?: string;
  description?: string;
  version?: string;
  repository?: { url?: string; source?: string };
  packages?: McpPackage[];
  remotes?: McpRemote[];
}

interface McpEntry {
  server: McpServer;
  _meta?: {
    "io.modelcontextprotocol.registry/official"?: {
      isLatest?: boolean;
      updatedAt?: string;
      status?: string;
    };
  };
}

interface McpResponse {
  servers: McpEntry[];
  metadata?: { nextCursor?: string; count?: number };
}

function repoFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(/github\.com[/:]([^/]+\/[^/.#?]+)/);
  return m ? (m[1] ?? null) : null;
}

function toEnv(list: McpEnv[] | undefined): EnvVar[] | undefined {
  if (!list || list.length === 0) return undefined;
  return list.map((e) => ({
    name: e.name,
    required: e.isRequired ?? false,
    secret: e.isSecret ?? false,
  }));
}

function buildInstall(s: McpServer): InstallRecipe | null {
  const pkg = s.packages?.[0];
  if (pkg?.registryType && pkg.identifier) {
    const env = toEnv(pkg.environmentVariables);
    if (pkg.registryType === "npm") {
      return { kind: "npm", command: "npx", args: ["-y", pkg.identifier], env };
    }
    if (pkg.registryType === "pypi") {
      return { kind: "pypi", command: "uvx", args: [pkg.identifier], env };
    }
    return { kind: pkg.registryType === "oci" ? "npm" : "npm", command: "npx", args: ["-y", pkg.identifier], env };
  }
  const remote = s.remotes?.find((r) => r.url);
  if (remote?.url) {
    return {
      kind: "remote",
      remote_url: remote.url,
      env: toEnv(remote.headers),
    };
  }
  return null;
}

function normalize(entry: McpEntry): RegistryItem | null {
  const s = entry.server;
  const install = buildInstall(s);
  if (!install) return null;

  const repo = repoFromUrl(s.repository?.url);
  const namespace = s.name.split("/")[0] ?? "unknown";
  return {
    id: `mcp:official/${s.name}`,
    type: "mcp",
    name: s.title?.trim() || s.name.split("/").pop() || s.name,
    description: s.description ?? "",
    author: namespace,
    source: {
      registry: "mcp-official",
      url:
        s.repository?.url ??
        s.remotes?.find((r) => r.url)?.url ??
        `https://registry.modelcontextprotocol.io/v0/servers/${encodeURIComponent(s.name)}`,
      repo,
    },
    license: null,
    install,
    quality: {
      stars: null,
      pushed_at:
        entry._meta?.["io.modelcontextprotocol.registry/official"]
          ?.updatedAt ?? null,
      score: null,
    },
    security: { score: 0, scanned: false, checks: [] },
    tags: { category: null, featured: false },
    readme: null,
    status: "curated",
  };
}

export async function fetchMcpRegistry(): Promise<RegistryItem[]> {
  const latest = new Map<string, McpEntry>();
  let cursor: string | undefined;
  for (let page = 0; ; page++) {
    const url = cursor
      ? `${API}?limit=100&cursor=${encodeURIComponent(cursor)}`
      : `${API}?limit=100`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`mcp-registry HTTP ${res.status}`);
    const data = (await res.json()) as McpResponse;
    for (const entry of data.servers) {
      const official =
        entry._meta?.["io.modelcontextprotocol.registry/official"];
      if (official?.isLatest === false) continue;
      if (official?.status && official.status !== "active") continue;
      latest.set(entry.server.name, entry);
    }
    if (page % 20 === 0 || !data.metadata?.nextCursor) {
      console.log(`  mcp-registry: page ${page + 1}, latest 累计 ${latest.size}`);
    }
    cursor = data.metadata?.nextCursor;
    if (!cursor || data.servers.length === 0) break;
  }

  const out: RegistryItem[] = [];
  for (const entry of latest.values()) {
    const item = normalize(entry);
    if (item) out.push(item);
  }
  return out;
}
