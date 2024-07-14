"use server";

import { cookies } from "next/headers";

export async function updateToken(params: {
  token: string;
  refreshToken: string;
}): Promise<void> {
  cookies().set({
    name: "token",
    value: params.token,
    httpOnly: true,
    path: "/",
  });
  cookies().set({
    name: "refreshToken",
    value: params.refreshToken,
    httpOnly: true,
    path: "/",
  });
}
