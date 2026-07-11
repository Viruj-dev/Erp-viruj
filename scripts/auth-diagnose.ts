import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env", quiet: true });
config({ override: false, path: "apps/server/.env", quiet: true });
config({ override: false, path: "apps/web/.env.local", quiet: true });

const email = process.argv[2]?.trim().toLowerCase();

function redactUrl(value?: string) {
  if (!value) {
    return "(missing)";
  }

  try {
    const url = new URL(value);
    const user = url.username ? `${url.username.slice(0, 3)}***` : "";
    const password = url.password ? ":***" : "";
    return `${url.protocol}//${user}${password}${user ? "@" : ""}${url.host}${url.pathname}`;
  } catch {
    return value.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
  }
}

function printEnv() {
  console.log("Auth environment diagnosis");
  console.log("--------------------------");
  console.log("NODE_ENV:", process.env.NODE_ENV || "(missing)");
  console.log("DATABASE_URL:", redactUrl(process.env.DATABASE_URL));
  console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL || "(missing)");
  console.log(
    "NEXT_PUBLIC_AUTH_URL:",
    process.env.NEXT_PUBLIC_AUTH_URL || "(missing)"
  );
  console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN || "(missing)");
  console.log(
    "NEXT_PUBLIC_SERVER_URL:",
    process.env.NEXT_PUBLIC_SERVER_URL || "(missing)"
  );
  console.log(
    "NEXT_PUBLIC_VIRUJ_BACKEND_URL:",
    process.env.NEXT_PUBLIC_VIRUJ_BACKEND_URL || "(missing)"
  );
  console.log();
}

async function checkEmail() {
  if (!email) {
    console.log("No email provided. To check one:");
    console.log("bun scripts/auth-diagnose.ts user@example.com");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.log("Cannot check email because DATABASE_URL is missing.");
    return;
  }

  const sql = postgres(process.env.DATABASE_URL, { prepare: false });

  try {
    const users = await sql`
      select id, email, name, created_at
      from users
      where lower(email) = ${email}
      limit 5
    `;

    if (users.length === 0) {
      console.log(`Email check: ${email} is NOT present in this DATABASE_URL.`);
      return;
    }

    console.log(`Email check: ${email} already exists in this DATABASE_URL.`);
    console.table(
      users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      }))
    );

    const memberships = await sql`
      select m.role, o.name as organization_name, o.slug, o.organization_type
      from members m
      join organizations o on o.id = m.organization_id
      join users u on u.id = m.user_id
      where lower(u.email) = ${email}
      order by o.created_at desc
    `;

    if (memberships.length > 0) {
      console.log("Existing memberships:");
      console.table(memberships);
    }
  } finally {
    await sql.end();
  }
}

printEnv();
await checkEmail();
