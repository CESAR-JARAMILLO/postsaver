"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useNotification } from "../../components/NotificationContext";

export default function LoginPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    showNotification("Logging in...", "info", 2000);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      showNotification("Login failed: " + error.message, "error");
    } else {
      showNotification("Login successful! Redirecting...", "success");
      router.push("/dashboard");
    }
  };

  return (
    <div className="auth auth--login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="auth__field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="auth__field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <p style={{ margin: "0.5rem 0", color: "#666" }}>
          Don&apos;t have an account?{" "}
          <a
            href="/auth/signup"
            style={{ color: "#2563eb", textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              showNotification("Navigating to signup...", "info", 1500);
              router.push("/auth/signup");
            }}
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}
