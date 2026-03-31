import { randomUUID } from "node:crypto";

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export const createSessionId = (): string => {
    return randomUUID();
};

export const isValidSessionId = (sessionId: string): boolean => {
    return SESSION_ID_PATTERN.test(sessionId);
};