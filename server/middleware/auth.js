import { auth } from 'express-oauth2-jwt-bearer';
import db from '../db.js';

// Validates the Auth0 JWT on every protected request
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

// Looks up (or creates) the matching row in our own users table,
// and attaches it to req.dbUser so routes know the role.
export async function syncUser(req, res, next) {
  try {
    const auth0Id = req.auth.payload.sub;              // e.g. "auth0|abc123"
    const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`]
                || req.auth.payload.email
                || null;
    const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`]
               || req.auth.payload.name
               || email
               || 'Customer';

    const [existing] = await db.query('SELECT * FROM users WHERE auth0_id = ?', [auth0Id]);

    if (existing.length > 0) {
      req.dbUser = existing[0];
      return next();
    }

    // First time we've seen this Auth0 user — create their row
    await db.query(
      'INSERT INTO users (auth0_id, name, email, role) VALUES (?, ?, ?, ?)',
      [auth0Id, name, email, 'customer']
    );
    const [created] = await db.query('SELECT * FROM users WHERE auth0_id = ?', [auth0Id]);
    req.dbUser = created[0];
    next();
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Database query error' });
  }
}

// Use after checkJwt + syncUser on any admin-only route
export function requireRole(role) {
  return (req, res, next) => {
    if (req.dbUser?.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}