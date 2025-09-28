import argon2 from "argon2";
import bcrypt from "bcrypt";

export function toE164(phone, country = "+84") {
  const raw = String(phone || "").replace(/\D/g, "");
  if (!raw) return "";
  
  if (raw.length === 10 && raw.startsWith("0")) {
    return country + raw.slice(1); 
  }
  
  if (raw.startsWith("84") && raw.length === 11) {
    return "+" + raw; 
  }
  
  return "";
}


export async function verifyPassword(hash, plain) {
  if (!hash || !plain) return false;
  try {
    if (hash.startsWith("$argon2")) {
      return await argon2.verify(hash, plain);
    }
    if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
      return await bcrypt.compare(plain, hash);
    }
    if (await argon2.verify(hash, plain)) return true;
    if (await bcrypt.compare(plain, hash)) return true;
    return false;
  } catch {
    return false;
  }
}
