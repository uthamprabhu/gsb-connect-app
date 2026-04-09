import crypto from "crypto";

const SECRET = process.env.APP_SESSION_SECRET || "gsb-connect-dev-secret";

export function createSessionToken(userId: string) {
  const payload = `${userId}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifySessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, ts, sig] = decoded.split(":");
    if (!userId || !ts || !sig) return null;
    const payload = `${userId}:${ts}`;
    const validSig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== validSig) return null;
    return userId;
  } catch {
    return null;
  }
}
