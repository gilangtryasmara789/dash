# Security Specification & Test Payloads

## 1. Data Invariants
- Each document in `/vehicles/{vehicleId}` represents an operational Light Vehicle (LV) unit.
- The document ID must match `isValidId(vehicleId)`: string <= 128 chars, regex `^[a-zA-Z0-9_\\-]+$`.
- Vehicle records must contain valid identification: `noLambung`, `noPolisi`, `tipeKendaraan`, `department`, `statusOperasi`, `lastPmDate`, `nextPmDueDate`, `pmStatus`.
- Status fields must be within bounded string lengths.
- Admins (`gilangtryasmara789@gmail.com` or users in `/admins/{uid}`) have full management privileges (create, update, delete).
- Authenticated team members can update vehicle inspection records (PM completions, odometer/hourmeter updates, notes).
- Unauthenticated users have read-only access to view the live dashboard.
- Unauthenticated or non-admin users cannot delete vehicle records.

## 2. The "Dirty Dozen" Payloads (Must be Denied)
1. **Unauthenticated Delete**: Unauthenticated request attempting to delete `/vehicles/lv-001`.
2. **Invalid Document ID Creation**: Writing to `/vehicles/../../bad_path` or using junk non-alphanumeric IDs > 128 chars.
3. **Missing Required Fields**: Creating a vehicle without `noLambung` or `pmStatus`.
4. **Oversized String Injection**: Attempting to write a 1MB payload string to `noLambung` to cause denial of wallet.
5. **Non-Admin Deletion**: Regular authenticated user attempting to delete a vehicle.
6. **Non-Admin Deletion of Admin Record**: Regular user trying to delete an admin record in `/admins/{uid}`.
7. **Privilege Escalation on User Role**: Creating or modifying `/admins/{uid}` directly without existing admin credentials.
8. **Invalid Status String Overflow**: Setting `statusOperasi` to an arbitrarily large 50KB string.
9. **Junk Field Pollution**: Sending unexpected arbitrary root fields like `__proto__` or massive binary payloads.
10. **Unauthenticated Vehicle Creation**: Trying to register a new vehicle asset without being logged in.
11. **Negative KM/HM reading corruption**: Writing corrupt invalid types (e.g. array instead of number or string) into required scalar fields.
12. **Blanket Query Scraping on Restricted Paths**: Querying system configuration or admin lists without admin privileges.
