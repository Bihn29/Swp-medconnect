import React from "react";
import Layout from "./core/Layout";
import { useQuery } from "@tanstack/react-query";

// API base can be configured via Vite env var VITE_API_BASE (e.g. http://localhost:3000)
// Optional prefix can be set via VITE_API_PREFIX (default '/api')
const apiBaseFromEnv = import.meta.env.VITE_API_BASE;
const apiPrefixFromEnv = import.meta.env.VITE_API_PREFIX || "/api";

const buildApiUrl = (path) => {
  // if VITE_API_BASE is provided, use it (no trailing slash assumptions)
  if (apiBaseFromEnv) {
    return `${apiBaseFromEnv.replace(/\/+$/, "")}${apiPrefixFromEnv}${
      path.startsWith("/") ? path : `/${path}`
    }`;
  }
  // fallback: assume backend on localhost:3000 (legacy default)
  return `http://localhost:3000${apiPrefixFromEnv}${
    path.startsWith("/") ? path : `/${path}`
  }`;
};

const App = () => {
  const { data, error, isError } = useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/users"), {
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }
      return res.json();
    },
    // short stale time for this demo
    staleTime: 1000 * 5,
  });

  // helpful debug logs in dev
  if (import.meta.env.DEV) {
    console.log(
      "API base:",
      apiBaseFromEnv ?? "(env not set, fallback to http://localhost:3000)"
    );
    console.log("Fetching users ->", buildApiUrl("/users"));
    if (isError) console.error("Fetch users error:", error);
    else console.log("Users:", data);
  }

  return <Layout />;
};

export default App;
