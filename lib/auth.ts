import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { getToken } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextRequest } from "next/server";
import { cache } from "react";
import { db } from "@/lib/db";
import { AUTH_REDIRECT_PATH } from "@/features/auth/constants";

type PrismaAdapterClient = Parameters<typeof PrismaAdapter>[0];

export const PUBLIC_PAGE_PATHS = ["/", "/login", "/register"] as const;
export const PUBLIC_API_PREFIXES = ["/api/auth", "/api/articles", "/api/stories"] as const;

export function isPublicPagePath(pathname: string) {
  return PUBLIC_PAGE_PATHS.includes(pathname as (typeof PUBLIC_PAGE_PATHS)[number]);
}

export function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as PrismaAdapterClient),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isPasswordValid = await compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}${AUTH_REDIRECT_PATH}`;
    },
  },
};

export const getCurrentUser = cache(async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
});

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return typeof token?.sub === "string" ? token.sub : null;
}
