export const getToken = (): string | null => {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem("token", token);
  } catch {
    console.error("Failed to save token to localStorage");
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem("token");
  } catch {
    console.error("Failed to remove token from localStorage");
  }
};
