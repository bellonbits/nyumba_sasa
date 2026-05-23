import { cookies } from "next/headers";

// Server-side JWT Decoder
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

async function getAccessToken() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("sb-access-token")?.value || null;
  } catch {
    return null;
  }
}

async function getLocalUser() {
  const token = await getAccessToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  if (!decoded) return null;
  
  return {
    id: decoded.sub,
    email: decoded.email,
    user_metadata: decoded.user_metadata || {},
    aud: decoded.aud,
    role: decoded.role || "authenticated",
  };
}

export async function createClient() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://api.guri24.com:8000";

  return {
    auth: {
      async getUser() {
        const user = await getLocalUser();
        return { data: { user }, error: null };
      },

      async getSession() {
        const token = await getAccessToken();
        const user = await getLocalUser();
        if (token && user) {
          return { data: { session: { access_token: token, user } }, error: null };
        }
        return { data: { session: null }, error: null };
      },

      async signOut() {
        try {
          const cookieStore = await cookies();
          cookieStore.delete("sb-access-token");
        } catch {
          // Ignore if called from context where cookies cannot be deleted
        }
        return { error: null };
      },
    },

    from(tableName: string) {
      return {
        select(columns?: string) {
          return {
            eq(col: string, val: any) {
              return {
                async single() {
                  try {
                    if (tableName === "users") {
                      const token = await getAccessToken();
                      const headers: any = {};
                      if (token) headers["Authorization"] = `Bearer ${token}`;
                      
                      const res = await fetch(`${BASE_URL}/api/users/${val}`, { headers });
                      const json = await res.json();
                      return { data: json.data, error: json.error ? { message: json.error } : null };
                    }
                    return { data: null, error: null };
                  } catch (e: any) {
                    return { data: null, error: { message: e.message } };
                  }
                },
              };
            },
          };
        },
      };
    },
  };
}

export async function createServiceClient() {
  return createClient();
}
