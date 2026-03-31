const SESSION_STORAGE_KEY = "assistant.sessionId";

const fallbackSessionId = (): string => {
    return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const createSessionId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return fallbackSessionId();
};

export const persistSessionId = (sessionId: string): void => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch {
        // Ignore storage errors and continue with in-memory session state.
    }
};

export const getOrCreateSessionId = (): string => {
    if (typeof window === "undefined") {
        return createSessionId();
    }

    try {
        const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (existing && existing.trim() !== "") {
            return existing.trim();
        }
    } catch {
        // Fall back to generating a new ID when storage is unavailable.
    }

    const nextSessionId = createSessionId();
    persistSessionId(nextSessionId);
    return nextSessionId;
};