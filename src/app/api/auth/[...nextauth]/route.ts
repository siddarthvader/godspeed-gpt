import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken, refreshAccessToken } from "next-auth/jwt";

export const jwt = async ({ token, user }: { token: JWT; user?: User }) => {
  // first call of jwt function just user object is provided
  if (user?.email) {
    return { ...token, ...user };
  }

  // on subsequent calls, token is provided and we need to check if it's expired
  if (token?.accessTokenExpires) {
    if (Date.now() / 1000 < token?.accessTokenExpires)
      return { ...token, ...user };
  } else if (token?.refreshToken) return refreshAccessToken(token);

  return { ...token, ...user };
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log({ credentials });
        // Add logic here to look up the user from the credentials supplied
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (email !== "admin@godspeed.systems" || password !== "godspeed@123") {
          // Any object returned will be saved in `user` property of the JWT
          // throw new Error("Invalid credentials");
          return null as any;
        }

        // If you return null then an error will be displayed advising the user to check their details.
        return { email, password };

        // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
      },
    }),

    // ...add more providers here
  ],
  callbacks: {
    jwt,
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
