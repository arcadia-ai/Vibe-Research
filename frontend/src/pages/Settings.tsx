import { useState } from "react";
import { KeyRound, Sparkles, ShieldCheck, Check, Trash2, Terminal } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";
import { loadLlm, saveLlm, clearLlm } from "@/lib/llm";
import { subscriptionModels, apiModels, PROVIDER_BASE, isCliProvider, aiModels, type ProviderId } from "@/lib/ai-models";

export function Settings() {
  const existing = loadLlm();
  const existingIsCli = existing ? isCliProvider(existing.provider) : false;

  const [mode, setMode] = useState<"api" | "subscription">(existing && existingIsCli ? "subscription" : "api");
  // 订阅：选中的 CLI model id
  const [cliId, setCliId] = useState(existing && existingIsCli ? existing.model : "");
  // API：选中的模型 id + 可编辑的 baseURL / model / key
  const firstApi = apiModels[0];
  const [apiId, setApiId] = useState(existing && !existingIsCli ? existing.model : firstApi.id);
  const [baseURL, setBaseURL] = useState(existing && !existingIsCli ? existing.baseURL : (PROVIDER_BASE[firstApi.provider] || ""));
  const [modelName, setModelName] = useState(existing && !existingIsCli ? existing.model : firstApi.id);
  const [apiKey, setApiKey] = useState(existing && !existingIsCli ? existing.apiKey : "");

  const providerOf = (id: string): ProviderId => aiModels.find((m) => m.id === id)?.provider ?? "openai-compatible";

  const pickApiModel = (id: string) => {
    const m = apiModels.find((x) => x.id === id);
    if (!m) return;
    setApiId(id);
    setModelName(id);
    setBaseURL(PROVIDER_BASE[m.provider] || "");
  };

  const saveApi = () => {
    if (!baseURL.trim() || !apiKey.trim() || !modelName.trim()) {
      toast.error("请填完 Base URL、API Key、Model");
      return;
    }
    saveLlm({ provider: providerOf(apiId), baseURL: baseURL.trim(), apiKey: apiKey.trim(), model: modelName.trim() });
    toast.success("已保存到本地，全站「问 AI / 复盘」现在可用");
  };

  const saveSubscription = () => {
    const m = subscriptionModels.find((x) => x.id === cliId);
    if (!m || m.comingSoon) {
      toast.error("请选择一个可用的订阅（暂不支持标「即将支持」的）");
      return;
    }
    saveLlm({ provider: m.provider, baseURL: "", apiKey: "", model: m.id });
    toast.success(`已选「${m.name}」订阅，全站「问 AI / 复盘」将调用本机 ${m.name}`);
  };

  const forget = () => {
    clearLlm();
    setApiKey("");
    setCliId("");
    toast.success("已清除本地配置");
  };


  return (
    <div>
      <PageHeader title="接入 AI" subtitle="配置一次，全站的「问 AI」「复盘」都能用你自己的模型" />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-success/25 bg-success/5 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <span>API key <b className="text-foreground">只存在你本地浏览器</b>，仅在你提问时发给你自己的后端去调模型，不上传、不进仓库。所有分析由你的模型给出，本产品不校准。</span>
      </div>

      {/* 两种接入方式 */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <GlassCard glow={mode === "subscription"} onClick={() => setMode("subscription")}
          className={mode === "subscription" ? "ring-1 ring-primary/40" : "opacity-80"}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">订阅接入</h3>
            {mode === "subscription" && <Check className="ml-auto h-4 w-4 text-primary" />}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">调本机已登录的 AI CLI（Claude Code / Qwen / DeepSeek / Codex…），用订阅额度，<b className="text-foreground">免 API key</b>。需后端在本机跑。</p>
        </GlassCard>

        <GlassCard glow={mode === "api"} onClick={() => setMode("api")}
          className={mode === "api" ? "ring-1 ring-primary/40" : "opacity-80"}>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">API 接入</h3>
            {mode === "api" && <Check className="ml-auto h-4 w-4 text-primary" />}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">粘贴 API key，支持 DeepSeek / 豆包 / MiniMax / OpenAI / OpenRouter / 任意兼容端点。<b className="text-foreground">现已可用。</b></p>
        </GlassCard>
      </div>

      <GlassCard>
        {mode === "subscription" ? (
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              选一个你本机已安装并登录的 CLI。Vibe-Research 后端会用它以你的订阅额度作答，<b className="text-foreground">不用填 key</b>。
              <span className="text-muted-foreground/60">（仅当后端跑在你本机时可用；复盘 / 今日要点 / 个股问 AI 等场景。）</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {subscriptionModels.map((m) => {
                const on = cliId === m.id;
                return (
                  <button key={m.id} disabled={m.comingSoon} onClick={() => setCliId(m.id)}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      m.comingSoon
                        ? "cursor-not-allowed border-border/50 opacity-40"
                        : on
                        ? "border-primary/50 bg-primary/10"
                        : "border-border hover:bg-muted/40"
                    }`}>
                    <Terminal className={`h-4 w-4 shrink-0 ${on ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium">
                        {m.name}
                        {m.comingSoon && <span className="rounded bg-muted/60 px-1 py-0.5 text-[9px] text-muted-foreground">即将支持</span>}
                        {on && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">{m.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={saveSubscription} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-4 py-2 text-sm font-medium text-primary shadow-glow hover:bg-primary/25">
                保存
              </button>
              {existing && (
                <button onClick={forget} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> 清除
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">选择模型</label>
              <select value={apiId} onChange={(e) => pickApiModel(e.target.value)}
                className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-sm outline-none focus:border-primary/50">
                {apiModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} —— {m.description}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Base URL</label>
              <input value={baseURL} onChange={(e) => setBaseURL(e.target.value)} placeholder="https://api.deepseek.com"
                className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Model</label>
              <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="模型名称（豆包填 ep-… 接入点 ID）"
                className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-…"
                className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={saveApi} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-4 py-2 text-sm font-medium text-primary shadow-glow hover:bg-primary/25">
                保存（存本地）
              </button>
              {existing && (
                <button onClick={forget} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> 清除
                </button>
              )}
            </div>
          </div>
        )}
      </GlassCard>

    </div>
  );
}
