import * as jose from "jose"
import {cookies} from 'next/headers'

// Ensure secret is exactly 32 bytes (256 bits) for A128CBC-HS256
function getSecret() {
    const secretKey = process.env.JOSE_SESSION_KEY;
    if (!secretKey) {
        throw new Error('JOSE_SESSION_KEY environment variable is not set');
    }
    
    // Try to decode as base64url first (recommended - should be 32 bytes when decoded)
    try {
        const decoded = jose.base64url.decode(secretKey);
        if (decoded.length === 32) {
            return decoded;
        }
        // If decoded length is not 32, pad or truncate
        const secret = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            secret[i] = decoded[i % decoded.length];
        }
        return secret;
    } catch (e) {
        // If base64url decode fails, use TextEncoder and ensure 32 bytes
        const encoded = new TextEncoder().encode(secretKey);
        const secret = new Uint8Array(32);
        // Repeat the bytes to fill exactly 32 bytes
        for (let i = 0; i < 32; i++) {
            secret[i] = encoded[i % encoded.length];
        }
        return secret;
    }
}

// Lazy initialization - only get secret when needed, not at module load time
let secretCache = null;
function getSecretLazy() {
    if (!secretCache) {
        secretCache = getSecret();
    }
    return secretCache;
}
const issuer = 'urn:danalexitraining:issuer'
const audience = 'urn:danalexitraining:audience'
const expiresAt = '2h'

export const encodeUserSession = async (userId) => {
    const secret = getSecretLazy();
    const jwt = await new jose.EncryptJWT({ 'user': userId })
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
        .setIssuedAt()
        .setIssuer(issuer)
        .setAudience(audience)
        .setExpirationTime(expiresAt)
        .encrypt(secret)
    return jwt
}


export const decodeUserSession = async (jwt) => {
    try {
        const secret = getSecretLazy();
        const { payload } = await jose.jwtDecrypt(jwt, secret, {
            issuer: issuer,
            audience: audience,
        })
        const {user} = payload
        return user
    } catch (error) {
        
    }
    return null

} 


export const setSessionUser = async (userId) => {
    const newSessionValue = await encodeUserSession(userId)
    // call in routes.js
    const cookieStore = await cookies()
    cookieStore.set("session_id", newSessionValue)
}

export const getSessionUser = async () => {
    const cookieStore = await cookies()
    const cookieSessionValue = cookieStore.get("session_id")
    if (!cookieSessionValue) {
        return null
    }
    const extractedUserId = await decodeUserSession(cookieSessionValue.value)
    if (!extractedUserId) {
        return null
    }
    return extractedUserId
}

export const endSessionForUser = async () => {
    const cookieStore = await cookies()
    cookieStore.delete("session_id")
}