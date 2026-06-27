"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateStudent, validateTeacher, validateAdmin } from "@/lib/api";

const TOKEN_KEY = "jwt_token";
const ROLE_KEY = "user_role";
const USER_ID_KEY = "user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function loginStudentAction(credentials: { id: number; password: string }) {
    try {
        const response = await validateStudent(credentials);

        if (response && response.token) {
            const userId = response.id || credentials.id;

            const cookieStore = await cookies();
            cookieStore.set(TOKEN_KEY, response.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });
            cookieStore.set(ROLE_KEY, response.role, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });
            cookieStore.set(USER_ID_KEY, userId.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });

            // Redirect server-side
            redirect(`/students/${userId}/dashboard`);
        } else {
            return {
                error: (response as any)?.message || "Login failed: Invalid response from server",
            };
        }
    } catch (error: any) {
        console.error("Student login error:", error);
        // Redirect throws an error, so we need to catch it and rethrow it
        if (error.message && error.message.includes('NEXT_REDIRECT')) {
            throw error;
        }
        return {
            error: error.message || "Invalid credentials. Please try again.",
        };
    }
}

export async function loginTeacherAction(credentials: { id: number; password: string }) {
    try {
        const response = await validateTeacher(credentials);

        if (response && response.token) {
            const userId = response.id || credentials.id;

            const cookieStore = await cookies();
            cookieStore.set(TOKEN_KEY, response.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });
            cookieStore.set(ROLE_KEY, response.role, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });
            cookieStore.set(USER_ID_KEY, userId.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });

            redirect(`/teachers/${userId}/dashboard`);
        } else {
            return {
                error: (response as any)?.message || "Login failed: Invalid response from server",
            };
        }
    } catch (error: any) {
        console.error("Teacher login error:", error);
        if (error.message && error.message.includes('NEXT_REDIRECT')) {
            throw error;
        }
        return {
            error: error.message || "Invalid credentials. Please try again.",
        };
    }
}

export async function loginAdminAction(credentials: { id: number; password: string }) {
    try {
        const response = await validateAdmin(credentials);

        if (response && response.token) {
            const userId = response.id || credentials.id;

            const cookieStore = await cookies();
            cookieStore.set(TOKEN_KEY, response.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });
            cookieStore.set(ROLE_KEY, response.role, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });
            cookieStore.set(USER_ID_KEY, userId.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: COOKIE_MAX_AGE,
            });

            redirect(`/admin/${userId}/dashboard`);
        } else {
            return {
                error: (response as any)?.message || "Login failed: Invalid response from server",
            };
        }
    } catch (error: any) {
        console.error("Admin login error:", error);
        if (error.message && error.message.includes('NEXT_REDIRECT')) {
            throw error;
        }
        return {
            error: error.message || "Invalid credentials. Please try again.",
        };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_KEY);
    cookieStore.delete(ROLE_KEY);
    cookieStore.delete(USER_ID_KEY);
    redirect("/");
}
