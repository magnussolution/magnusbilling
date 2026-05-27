# Multiple SIP Accounts Not Registering from Same Network

## Scenario
Client reports that more than one SIP account cannot authenticate from the same home network.

## Important Clarification
This issue is typically NOT related to MagnusBilling runtime or database logic.

MagnusBilling handles SIP authentication per account normally.
If one account authenticates and another does not, the problem is likely at SIP protocol level.

## Correct Diagnostic Approach

The issue must be analyzed on the server using SIP packet inspection.

Recommended tool:

- sngrep

## Procedure

1. Run:
   sngrep
2. Filter by client IP.
3. Observe REGISTER attempts.
4. Verify:
   - Is second REGISTER reaching server?
   - Is authentication challenge sent?
   - Is client responding correctly?
   - Is there port conflict?

## Possible Causes

- Client router issue
- SIP ALG on client router
- Device misconfiguration
- Same SIP account used twice
- Client using same local SIP port
- Firewall blocking second registration

## Conclusion

This type of issue must be diagnosed via SIP packet analysis.
It is not a MagnusBilling runtime issue.