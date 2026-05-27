# SIP Authentication by IP

## Problem
How to authenticate a SIP account using IP instead of username/password.

## MagnusBilling Default Behavior
Each client can have one or multiple SIP accounts.
Authentication is normally done via username and password.

When creating a client, Magnus automatically creates a SIP account.

## Correct Magnus Method

To authenticate by IP:

1. Edit existing SIP account or create a new one.
2. Leave the following fields blank:
   - SIP Username
   - Password
3. Set:
   - HOST = client public IP
4. In the "Additional" tab:
   - insecure = port,invite

## Important Notes

- The SIP account remains linked to the client accountcode.
- Billing logic remains intact.
- Credit control remains active.
- This method preserves Magnus internal architecture.

## What NOT to Do

Do not create manual peers directly in sip.conf.
This bypasses Magnus control and breaks internal billing logic.