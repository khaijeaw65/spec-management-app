import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type BackendLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          },
        );

        if (!res.ok) return null;

        const json = (await res.json()) as {
          status: number;
          message: string;
          data: BackendLoginResponse;
        };

        const { accessToken, refreshToken, user } = json.data;

        // Return an object that NextAuth will store in the JWT via callbacks.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          accessToken,
          refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      if (trigger === "update" && session && typeof session === "object") {
        const next = session as {
          accessToken?: string;
          refreshToken?: string;
        };
        if (next.accessToken) {
          token.accessToken = next.accessToken;
        }
        if (next.refreshToken) {
          token.refreshToken = next.refreshToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };