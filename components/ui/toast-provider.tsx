"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "celebration";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<Toast, "id">;

const ToastContext = createContext<{
  pushToast: (toast: ToastInput) => void;
} | null>(null);

const toneStyles: Record<ToastTone, { icon: ReactNode; accent: string }> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    accent: "bg-moss/10 text-moss"
  },
  info: {
    icon: <AlertCircle className="h-4 w-4" />,
    accent: "bg-lake/15 text-lake"
  },
  celebration: {
    icon: <Sparkles className="h-4 w-4" />,
    accent: "bg-amber/20 text-amber-800"
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const pushToast = useCallback(
    ({ title, description, tone }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, title, description, tone }]);
      timers.current[id] = window.setTimeout(() => removeToast(id), 3200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => {
            const tone = toneStyles[toast.tone];
            return (
              <div
                key={toast.id}
                className="pointer-events-auto animate-toast-in rounded-3xl border border-white/70 bg-white/90 p-4 shadow-panel backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl", tone.accent)}>
                    {tone.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{toast.title}</p>
                    {toast.description ? (
                      <p className="mt-1 text-sm leading-5 text-ink/80">{toast.description}</p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-xl px-2 text-ink/55"
                    onClick={() => removeToast(toast.id)}
                    aria-label="Dismiss notification"
                  >
                    Close
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
