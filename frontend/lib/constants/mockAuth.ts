// Mock authentication data for testing
// NOTE: In development, we use the AuthInitializer to set a valid token
// For testing purposes, this provides a fallback
// The token expires in 24 hours from generation (JWT standard)
export const MOCK_AUTH_DATA = {
  data: {
    // This is a sample JWT - in production, login to get a real one
    // Structure: { sub: user_id, type: "staff", iat, exp }
    access_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIyMjIyMi0yMjIyLTIyMjItMjIyMi0yMjIyMjIyMjIyMjIiwidHlwZSI6InN0YWZmIiwiaWF0IjoxNzMxMjM3NTU0LCJleHAiOjE3MzEzMjM5NTR9.sample",
    // Extended expiration for mock testing (Nov 15, 2025)
    expires_at: "2025-11-15T13:05:54.000Z",
    user: {
      id: "22222222-2222-2222-2222-222222222222",
      username: "manager1",
      email: "manager@spiceroute.com",
      role: "MANAGER",
      tenant_id: "11111111-1111-1111-1111-111111111111",
    },
  },
  meta: {
    timestamp: "2025-11-11T13:05:54.133Z",
    correlationId: "5d8021bb-b9a1-4936-af7c-559ca4b2e3dc",
  },
};
