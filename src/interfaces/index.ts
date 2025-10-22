interface JwtPayloadShape {
  sub: string; // user id
  iat?: number;
  exp?: number;
}

export { JwtPayloadShape };
