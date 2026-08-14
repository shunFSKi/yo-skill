/**
 * 让全局 fetch 走环境变量代理（HTTP_PROXY / HTTPS_PROXY / NO_PROXY）。
 * Node 的 undici fetch 默认无视代理；本机开发环境 raw.githubusercontent.com
 * 必须走代理（DNS 被污染），而 curl 会自动读 env，行为差异靠这里补齐。
 * 未设置代理时 EnvHttpProxyAgent 退化为直连，无副作用。
 */

import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

export function setupProxy(): void {
  setGlobalDispatcher(new EnvHttpProxyAgent());
}
