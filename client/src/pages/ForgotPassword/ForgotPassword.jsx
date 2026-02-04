import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import {
  Mail,
  Shield,
  LockKeyhole,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.data;

      if (!response.status === 200 && response.data?.success) {
        throw new Error(data.message || "Failed to send reset email");
      }

      // Start countdown for resend
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.data;

      if (!response.status === 200 && response.data?.success) {
        throw new Error(data.message || "Failed to resend email");
      }

      // Restart countdown
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-300/10 dark:bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Back to Login */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/login">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md">
        {/* Animated Progress Indicator */}
        {loading && (
          <div className="absolute -top-8 left-0 right-0">
            <Progress
              value={100}
              className="h-1 bg-slate-200 dark:bg-slate-800"
            />
          </div>
        )}

        <Card className="shadow-2xl border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 overflow-hidden">
          {/* Card Header */}
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900/30 dark:to-emerald-900/30 flex items-center justify-center border border-sky-200 dark:border-sky-800">
                  <LockKeyhole className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                </div>
                <KeyRound className="absolute -bottom-2 -right-2 w-7 h-7 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  Reset Your Password
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  ASES — Advanced Safety and Efficiency Systems
                </p>
              </div>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="animate-in fade-in duration-300"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {!submitted && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter your work email to receive password reset instructions
              </p>
            )}
          </CardHeader>

          {/* Card Content */}
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Work Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter the email associated with your ASES account
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 transition-all duration-300"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Reset Link...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Send Reset Instructions
                    </span>
                  )}
                </Button>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Secure Password Reset
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Your reset link is encrypted and expires in 15 minutes for
                      security.
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Check Your Email
                  </h3>

                  <div className="space-y-3 mt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      We've sent password reset instructions to:
                    </p>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="font-medium text-slate-900 dark:text-white break-all">
                        {email}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Follow the instructions in the email to reset your
                      password.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      Didn't receive the email?{" "}
                      {countdown > 0 && (
                        <span className="font-medium text-sky-600 dark:text-sky-400">
                          Resend in {countdown}s
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResend}
                      disabled={countdown > 0 || loading}
                      className="flex-1"
                    >
                      {loading ? "Resending..." : "Resend Email"}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Use Different Email
                    </Button>
                  </div>
                </div>

                <Alert className="bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800">
                  <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <AlertDescription className="text-xs">
                    <span className="font-medium">Security Tip:</span> The reset
                    link expires in 15 minutes. Check your spam folder if you
                    don't see it in your inbox.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>

          {/* Card Footer */}
          <CardFooter className="flex flex-col space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-center text-muted-foreground">
              <Shield className="inline w-3 h-3 mr-1" />
              Protected by enterprise-grade security protocols
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Need help? Contact{" "}
              <a
                href="mailto:support@ases.com"
                className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
              >
                security@ases.com
              </a>
            </p>
          </CardFooter>
        </Card>

        {/* Mobile Info Section */}
        <div className="mt-8 text-center space-y-4 md:hidden">
          <div className="flex items-center justify-center gap-3">
            <img src="/only_logo.png" className="w-10 h-10" alt="ASES Logo" />
            <div className="text-left">
              <h2 className="text-lg font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                ASES Security
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Password reset powered by military-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Shield className="w-3 h-3" />
        <span>
          End-to-end encrypted • Time-limited reset links • Audit logged
        </span>
      </div>
    </div>
  );
}
