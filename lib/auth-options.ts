import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import type { User, Account, Profile } from "next-auth";
import { prismaClient } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) {
      if (!user.email) return false;

      try {
        await prismaClient.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            provider: "Google",
          },
        });
      } catch (e) {
        console.error("Error in signIn callback:", e);
        return false;
      }

      return true;
    },
  },
};
