# Multiple SIP Accounts Behind Same NAT

## Scenario
I have no audio in all calls

## Default Magnus Behavior
Probably the server use local ip, to fix it, is necessary configure Asterisk NAT handling.

## Possible Causes
- SIP ALG enabled in router
- NAT misconfiguration in Asterisk
- Incorrect externip/localnet settings

## Correct Procedure

1. Disable SIP ALG in router.
2. Configure Asterisk:
   externip = your_public_ip
   localnet = your_local_network
   nat = force_rport,comedia
3. If using PJSIP (MagnusBilling8):
   rewrite_contact = yes
   force_rport = yes

## Expected Result
Calls with audio in bouth side.

## Common Mistakes
- Not configuring Asterisk NAT properly.