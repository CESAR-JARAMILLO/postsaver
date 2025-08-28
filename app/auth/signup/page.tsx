"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useNotification } from "../../components/NotificationContext";

export default function SignupPage() {
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

    showNotification("Creating account...", "info", 2000);

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      showNotification("Signup failed: " + error.message, "error");
    } else {
      showNotification(
        "Account created successfully! Redirecting...",
        "success"
      );
      router.push("/dashboard");
    }
  };

  return (
    <div className="auth auth--signup">
      <h1>Sign Up</h1>
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <p style={{ margin: "0.5rem 0", color: "#666" }}>
          Already have an account?{" "}
          <a
            href="/auth/login"
            style={{ color: "#2563eb", textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              showNotification("Navigating to login...", "info", 1500);
              router.push("/auth/login");
            }}
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
