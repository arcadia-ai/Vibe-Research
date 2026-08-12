import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function Login() {
  const { authenticated, login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (authenticated) return <Navigate to="/portfolio" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(password);
      navigate("/portfolio", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center">
      <form onSubmit={submit} className="w-full rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-5 flex items-center gap-3">
          <LockKeyhole className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">管理员登录</h1>
        </div>
        <label className="mb-2 block text-sm text-muted-foreground">管理员密码</label>
        <input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          autoComplete="current-password" />
        <button disabled={submitting || !password} className="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
          {submitting ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}
