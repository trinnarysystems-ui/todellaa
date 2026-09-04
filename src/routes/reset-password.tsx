import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Todellaa" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Listen for recovery session state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsRecoveryMode(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSuccess(true);
    toast.success("Your password has been successfully updated!");
    setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#faf9f6] font-sans selection:bg-[#e8562a] selection:text-white">
      <div className="w-full max-w-md bg-white border border-[#e6e4dc] rounded-3xl shadow-xl p-8 sm:p-10 space-y-6">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Todellaa Logo" className="h-10 w-auto object-contain" />
            <span className="text-2xl font-bold tracking-tight text-[#010101] font-sans">
              Todellaa
            </span>
          </Link>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 mt-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-[#010101] tracking-tight mt-1">
            Reset Password
          </h1>
          <p className="text-xs text-neutral-500 max-w-xs">
            Enter your new password below to update your account credentials.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold">Password Changed!</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your password has been successfully updated. Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  {...form.register("password")}
                  className="rounded-xl border-neutral-300 pr-10 focus:ring-2 focus:ring-primary h-11 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  {...form.register("confirmPassword")}
                  className="rounded-xl border-neutral-300 pr-10 focus:ring-2 focus:ring-primary h-11 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e8562a] hover:bg-[#d44820] text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all h-11 mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Password
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-neutral-100 text-center">
          <Link
            to="/login"
            className="text-xs font-bold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
