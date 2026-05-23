"use client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://api.guri24.com:8000";

// Client-side JWT Decoder (Zero library dependency)
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("local-access-token") || getCookie("sb-access-token");
}

function getLocalUser(): any {
  const token = getAccessToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  if (!decoded) return null;
  
  return {
    id: decoded.sub,
    email: decoded.email,
    user_metadata: decoded.user_metadata || {},
    aud: decoded.aud,
    role: decoded.role || "authenticated",
    app_metadata: {},
    created_at: new Date().toISOString(),
  };
}

// Thenable Promise Builder for Chainable Queries
function createQueryPromise(fetchFn: () => Promise<any>) {
  const promise = fetchFn();
  
  (promise as any).single = async () => {
    const res = await promise;
    const data = Array.isArray(res.data) ? res.data[0] : res.data;
    return { data, error: res.error };
  };

  return promise;
}

export function createClient(): any {
  return {
    auth: {
      async signUp({ email, password, options }: any) {
        try {
          const name = options?.data?.name || "";
          const phone = options?.data?.phone || "";
          const role = options?.data?.role || "user";
          
          const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name, phone, role }),
          });
          
          const json = await res.json();
          if (json.error) {
            return { data: { user: null, session: null }, error: { message: json.error } as any };
          }
          
          const token = json.data.session.access_token;
          if (typeof window !== "undefined") {
            localStorage.setItem("local-access-token", token);
            setCookie("sb-access-token", token, 30);
          }
          
          return { data: json.data, error: null };
        } catch (e: any) {
          return { data: { user: null, session: null }, error: { message: e.message || "Failed to fetch" } as any };
        }
      },

      async signInWithPassword({ email, password }: any) {
        try {
          const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          
          const json = await res.json();
          if (json.error) {
            return { data: { user: null, session: null }, error: { message: json.error } as any };
          }
          
          const token = json.data.session.access_token;
          if (typeof window !== "undefined") {
            localStorage.setItem("local-access-token", token);
            setCookie("sb-access-token", token, 30);
          }
          
          return { data: json.data, error: null };
        } catch (e: any) {
          return { data: { user: null, session: null }, error: { message: e.message || "Failed to fetch" } as any };
        }
      },

      async signOut() {
        if (typeof window !== "undefined") {
          localStorage.removeItem("local-access-token");
          eraseCookie("sb-access-token");
        }
        return { error: null };
      },

      async getUser() {
        const user = getLocalUser();
        return { data: { user }, error: null };
      },

      async getSession() {
        const token = getAccessToken();
        const user = getLocalUser();
        if (token && user) {
          return { data: { session: { access_token: token, user } }, error: null };
        }
        return { data: { session: null }, error: null };
      },

      onAuthStateChange(callback: any) {
        const token = getAccessToken();
        const user = getLocalUser();
        const session = token && user ? { access_token: token, user } : null;
        
        setTimeout(() => {
          callback("SIGNED_IN", session);
        }, 0);
        
        return {
          data: {
            subscription: {
              unsubscribe() {
                // Mock subscription release
              },
            },
          },
        };
      },

      async resetPasswordForEmail(email: string, options?: any) {
        console.log(`Password reset mock for ${email}`);
        return { data: {}, error: null as { message: string } | null };
      },
    },

    from(tableName: string) {
      return {
        select(columns?: string) {
          return {
            eq(col: string, val: any) {
              return createQueryPromise(async () => {
                try {
                  const token = getAccessToken();
                  const headers: any = {};
                  if (token) headers["Authorization"] = `Bearer ${token}`;

                  if (tableName === "users") {
                    const res = await fetch(`${BASE_URL}/api/users/${val}`, { headers });
                    const json = await res.json();
                    return { data: json.data, error: json.error ? { message: json.error } : null };
                  } else if (tableName === "favorites") {
                    const res = await fetch(`${BASE_URL}/api/favorites/`, { headers });
                    const json = await res.json();
                    return { data: json.data || [], error: json.error ? { message: json.error } : null };
                  }
                  return { data: [], error: null };
                } catch (e: any) {
                  return { data: [], error: { message: e.message } };
                }
              });
            },
          };
        },

        insert(row: any) {
          const runInsert = async () => {
            try {
              const token = getAccessToken();
              const headers: any = { "Content-Type": "application/json" };
              if (token) headers["Authorization"] = `Bearer ${token}`;

              if (tableName === "messages") {
                const res = await fetch(`${BASE_URL}/api/messages/`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify(row),
                });
                const json = await res.json();
                return { data: json.data, error: json.error ? { message: json.error } : null };
              } else if (tableName === "favorites") {
                const res = await fetch(`${BASE_URL}/api/favorites/${row.listing_id}`, {
                  method: "POST",
                  headers,
                });
                const json = await res.json();
                return { data: json.data, error: json.error ? { message: json.error } : null };
              }
              return { data: null, error: null };
            } catch (e: any) {
              return { data: null, error: { message: e.message } };
            }
          };

          const promise = runInsert();
          (promise as any).select = () => {
            return {
              single: async () => {
                return await promise;
              },
            };
          };

          return promise;
        },

        delete() {
          const eq1 = (col1: string, val1: any) => {
            const eq2 = (col2: string, val2: any) => {
              const runDelete = async () => {
                try {
                  const token = getAccessToken();
                  const headers: any = { "Content-Type": "application/json" };
                  if (token) headers["Authorization"] = `Bearer ${token}`;

                  if (tableName === "favorites") {
                    const listingId = col1 === "listing_id" ? val1 : val2;
                    const res = await fetch(`${BASE_URL}/api/favorites/${listingId}`, {
                      method: "POST",
                      headers,
                    });
                    const json = await res.json();
                    return { data: json.data, error: json.error ? { message: json.error } : null };
                  } else if (tableName === "users") {
                    const res = await fetch(`${BASE_URL}/api/users/${val1}`, {
                      method: "DELETE",
                      headers,
                    });
                    const json = await res.json();
                    return { data: json.data, error: json.error ? { message: json.error } : null };
                  }
                  return { data: null, error: null };
                } catch (e: any) {
                  return { data: null, error: { message: e.message } };
                }
              };

              return runDelete();
            };

            const promise = Promise.resolve({ data: null, error: null });
            (promise as any).eq = eq2;
            return promise;
          };

          return { eq: eq1 };
        },
      };
    },

    channel(name: string) {
      return {
        on(event: string, config: any, callback: any) {
          return this;
        },
        subscribe() {
          return this;
        },
      };
    },

    removeChannel(channel: any) {
      // Safe no-op
    },
  };
}
