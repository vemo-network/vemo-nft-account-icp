import { jwtDecode } from "jwt-decode";

export function parseJwt(token: string) {
  const decoded = jwtDecode(token);
  return decoded;
}
