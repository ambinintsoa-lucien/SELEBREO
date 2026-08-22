import { apiClient } from "./client.js";

export async function loginRequest(emailOrUsername, password) {
  const { data } = await apiClient.post("/api/auth/login", {
    emailOrUsername,
    password,
  });

  return data;
}

export async function registerRequest(payload) {
  const { data } = await apiClient.post(
    "/api/auth/register",
    payload
  );

  return data;
}

export async function refreshRequest(refreshToken) {
  const { data } = await apiClient.post("/api/auth/refresh", {
    refreshToken,
  });

  return data;
}