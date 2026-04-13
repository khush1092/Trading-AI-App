export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthenticatedRequestUser = {
  id: string;
  email: string;
};
