# Security Specification - Vershante Lynn Skincare

## Data Invariants
1. An assessment must have a valid `email` and `fullName`.
2. `stressLevel` must be between 1 and 10.
3. `status` is immutable for clients after creation (defaults to 'pending').
4. `createdAt` must be the server time.
5. Users can only read their own assessments if authenticated (though currently, submitted assessments are for admin review).

## The Dirty Dozen Payloads (Target: /assessments)

1.  **Identity Spoofing**: `{"fullName": "Attacker", "ownerId": "victim_uid"}` - Attempting to set an owner ID not matching the auth UID. (N/A for public submission but relevant if auth added).
2.  **State Shortcutting**: `{"fullName": "User", "status": "reviewed"}` - Creating an assessment already marked as reviewed.
3.  **Resource Poisoning**: `{"fullName": "A".repeat(2000)}` - Injecting massive strings to bloat database costs.
4.  **Type Mismatch**: `{"stressLevel": "Very High"}` - Sending a string instead of an integer.
5.  **Boundary Break**: `{"stressLevel": 11}` - Sending a value outside the 1-10 range.
6.  **Shadow Field**: `{"fullName": "User", "isAdmin": true}` - Adding undocumented fields.
7.  **Timestamp Fraud**: `{"createdAt": "2020-01-01T00:00:00Z"}` - Providing a past timestamp instead of `request.time`.
8.  **Empty Concerns**: `{"concerns": []}` - Violating the requirement that concerns must be identified.
9.  **Email Format Bypass**: `{"email": "not-an-email"}` - Invalid email format.
10. **ID Injection**: Document ID set to a 2KB junk string.
11. **Malicious Enum**: `{"hormonalStage": "Vampire"}` - Using an invalid enum value.
12. **Public Read**: Attempting to list all assessments without being an admin.

## Test Runner Plan
- [ ] Verify `PERMISSION_DENIED` for all Dirty Dozen.
- [ ] Verify success for valid `create` with server timestamps.
