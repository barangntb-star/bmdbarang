# Security Specification for SipLah NTB

## Data Invariants
- A User profile can only be created by the authenticated owner.
- Only Admins can modify the Item catalogue.
- Procurements can only be created by Principals.
- Admins can view all Procurements and modify their status.
- Principals can only view and modify their own Procurements.

## The Dirty Dozen Payloads
1. **Identity Theft**: Principals trying to update their role to `ADMIN`.
2. **Catalog Sabotage**: Anonymous users trying to delete items.
3. **Ghost Procurement**: User A trying to update Procurement belonging to User B.
4. **Shadow Field**: Adding `isVerified: true` to a procurement.
5. **ID Poisoning**: Using a 1MB string as a Document ID.
6. **Self-Promotion**: Non-admin user creating an entry in `/admins/`.
7. **Orphaned Record**: Creating a procurement with a non-existent item ID.
8. **PII Leak**: Reading a user's private info without being that user or an admin.
9. **State Shortcut**: Moving a Procurement from PENDING directly to COMPLETED without approval.
10. **Resource Exhaustion**: Writing a 1MB string into the `description` field.
11. **Spoofed Audit**: Setting `createdAt` to a date in the past instead of `request.time`.
12. **Blanket List**: Trying to list all procurements without being an ADMIN.

## Fortress Rules (draft_firestore.rules)
I will now generate the rules based on these invariants.
