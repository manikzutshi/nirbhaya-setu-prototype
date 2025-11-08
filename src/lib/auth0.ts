import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Central Auth0 client for server/middleware usage
export const auth0 = new Auth0Client();
