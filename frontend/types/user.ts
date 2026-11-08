/** Mirror of the `POST /auth/guest-register` response (serialized User entity). */
export interface Role {
  role_id: number;
  roleName: string | null;
  description: string | null;
}

export interface GuestUser {
  userId: string;
  username: string;
  emailId: string | null;
  passwordHash: string | null;
  /** Serializes as "tempUser" (Lombok getter strips the leading "is"). */
  tempUser: boolean | null;
  createdAt: string;
  lastLogin: string | null;
  status: string | null;
  roles: Role[] | null;
}
