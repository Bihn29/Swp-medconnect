const BASE = import.meta.env.VITE_API_URL;

export async function requestPasswordOtp(email) {
  const r = await fetch(`${BASE}/api/auth/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function verifyPasswordOtp(email, otp) {
  const r = await fetch(`${BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, otp })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function resetPasswordWithToken(token, newPassword) {
  const r = await fetch(`${BASE}/api/auth/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
