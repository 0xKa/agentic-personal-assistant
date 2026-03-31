export const requireEnv = (key: keyof NodeJS.ProcessEnv): string => {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(`Missing ${key}`);
  }

  return value;
};