export class Credentials {
  username: string;
  plainPassword: string;
}

export class AuthResponse {
  token: string;
  permissions: string[];
}
