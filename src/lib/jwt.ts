import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export function signJwtAccessToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET || 'default-secret-key-for-development';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
}

export function verifyJwtAccessToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key-for-development';
    const payload = jwt.verify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}