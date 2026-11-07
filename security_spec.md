# Security Specification - Polar Bear Rescue Leaderboard

## 1. Data Invariants
- Each document in `/leaderboard/{entryId}` represents an immutable record of a player completing missions.
- `name`: string between 1 and 20 characters (strictly checked for length and type).
- `code`: string between 1 and 20 characters (strictly checked for length and type).
- `score`: integer between 0 and 100,000.
- `stars`: integer between 0 and 30.
- `avatar`: string restricted to `'a'`, `'b'`, or `'c'`.
- `createdAt`: timestamp strictly matching `request.time`.
- No additional ghost fields or arbitrary keys allowed (`hasAll` & `hasOnly`).
- Updates are forbidden (scores are write-once to prevent score modification).
- Deletion is only allowed for the verified administrator (`jjojjang1985@gmail.com`).
- Public read allows students in classroom environments to view real-time rankings without requiring login hurdles.

## 2. Test Payloads (Dirty Dozen)
1. Negative score: `{ score: -10 }` -> Rejected.
2. Excessive score: `{ score: 999999 }` -> Rejected.
3. Huge string injection in name: `{ name: "A".repeat(500) }` -> Rejected.
4. Missing required field (stars): `{ name: "대원", code: "바다", score: 500 }` -> Rejected.
5. Ghost field injection (admin rights): `{ name: "대원", isAdmin: true }` -> Rejected.
6. Client-forged timestamp: `{ createdAt: timestamp("2020-01-01T00:00:00Z") }` -> Rejected.
7. Invalid avatar identifier: `{ avatar: "hacker" }` -> Rejected.
8. Update existing score: Attempt `update` on existing document -> Rejected.
9. Delete by non-admin: Attempt `delete` without admin auth -> Rejected.
10. Junk document ID injection: `{entryId}` with invalid characters -> Rejected.
11. Array field poisoning -> Rejected (no arrays allowed).
12. Attempt to write to arbitrary unmapped collection: `/secrets/{doc}` -> Denied by global safety net.
