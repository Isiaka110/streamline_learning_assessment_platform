// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth";

// This is the core NextAuth handler that uses the configuration we defined.
export default NextAuth(authOptions);