export type AuthUser = {
  id: string;
  username: string;
  passwordHash: string;
};

export interface AuthUsersRepo {
  findByUsername(username: string): Promise<AuthUser | null>;
}

export interface PasswordVerifier {
  verify(params: { hash: string; password: string }): Promise<boolean>;
}
