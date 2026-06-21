const isBrowser = typeof window !== "undefined";

export const getToken = (): string | null => {
  try {
    if (!isBrowser) return null;
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    if (!isBrowser) return;
    localStorage.setItem("token", token);
  } catch {
    console.error("Failed to save token to localStorage");
  }
};

export const removeToken = (): void => {
  try {
    if (!isBrowser) return;
    localStorage.removeItem("token");
  } catch {
    console.error("Failed to remove token from localStorage");
  }
};
