import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const ADMIN_USERNAME = "jayszrs";
const ADMIN_PASSWORD = "SZRS86";
const ADMIN_EMAILS = [
  "jayszrs@admin.local",
  "jaelanisuryasaputra@gmail.com",
  "jaelanisurya.akademicrypto@gmail.com",
] as const;

type BootstrapResult =
  | { ok: true; email: string }
  | {
      ok: false;
      reason:
        | "invalid_credentials"
        | "missing_service_role"
        | "admin_already_exists"
        | "database_error";
      message: string;
    };

function readBootstrapInput(input: unknown) {
  if (!input || typeof input !== "object") {
    return { username: "", password: "" };
  }

  const fields = input as Record<string, unknown>;
  return {
    username: String(fields.username ?? "").trim().toLowerCase(),
    password: String(fields.password ?? ""),
  };
}

export const bootstrapAdminLogin = createServerFn({ method: "POST" })
  .inputValidator(readBootstrapInput)
  .handler(async ({ data }): Promise<BootstrapResult> => {
    if (data.username !== ADMIN_USERNAME || data.password !== ADMIN_PASSWORD) {
      return {
        ok: false,
        reason: "invalid_credentials",
        message: "Credential admin tidak sesuai.",
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        ok: false,
        reason: "missing_service_role",
        message:
          "SUPABASE_SERVICE_ROLE_KEY belum ada di environment server, jadi akun admin belum bisa dibetulkan otomatis.",
      };
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { count: adminCount, error: adminCountError } = await admin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");

    if (adminCountError) {
      return { ok: false, reason: "database_error", message: adminCountError.message };
    }

    const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return { ok: false, reason: "database_error", message: listError.message };
    }

    const existingTarget = usersPage.users.find((user) =>
      ADMIN_EMAILS.some((email) => user.email?.toLowerCase() === email),
    );

    if ((adminCount ?? 0) > 0 && !existingTarget) {
      return {
        ok: false,
        reason: "admin_already_exists",
        message: "Sudah ada admin lain, bootstrap otomatis dihentikan demi keamanan.",
      };
    }

    const primaryEmail = existingTarget?.email || ADMIN_EMAILS[0];
    const authResult = existingTarget
      ? await admin.auth.admin.updateUserById(existingTarget.id, {
          email: primaryEmail,
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { username: ADMIN_USERNAME, full_name: "JAY SZRS" },
        })
      : await admin.auth.admin.createUser({
          email: primaryEmail,
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { username: ADMIN_USERNAME, full_name: "JAY SZRS" },
        });

    if (authResult.error || !authResult.data.user) {
      return {
        ok: false,
        reason: "database_error",
        message: authResult.error?.message || "Gagal membuat akun admin.",
      };
    }

    const userId = authResult.data.user.id;
    const { error: roleDeleteError } = await admin.from("user_roles").delete().eq("user_id", userId);
    if (roleDeleteError) {
      return { ok: false, reason: "database_error", message: roleDeleteError.message };
    }

    const { error: roleInsertError } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleInsertError) {
      return { ok: false, reason: "database_error", message: roleInsertError.message };
    }

    return { ok: true, email: primaryEmail };
  });
