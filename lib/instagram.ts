export function parseInstagram(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Instagram input is required");
  }

  if (trimmed.startsWith("http")) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split("/").filter(Boolean);
      const username = parts[0]?.replace("@", "");
      if (!username) throw new Error("Invalid Instagram URL");
      return {
        instagramUsername: username.toLowerCase(),
        instagramUrl: `https://instagram.com/${username.toLowerCase()}`,
      };
    } catch {
      throw new Error("Invalid Instagram URL format");
    }
  }

  const username = trimmed.replace("@", "").toLowerCase();
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    throw new Error("Invalid Instagram username");
  }
  return {
    instagramUsername: username,
    instagramUrl: `https://instagram.com/${username}`,
  };
}
