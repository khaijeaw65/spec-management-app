import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthUserDto } from '@spec-app/schemas';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        })
        const data = await res.json()
        if (res.ok) {
          return data.data
        }
        return null
      }
    })
  ]
})