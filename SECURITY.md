# Security Policy

## Supported versions

MagnusBilling 8 is the active development line and receives security fixes.
MagnusBilling 7 follows the dates and limitations in the
[lifecycle policy](wiki/en/lifecycle.rst). Older releases are unsupported.

Operators should remain on the latest available update for their supported
release line. A supported application version does not replace security updates
for Linux, PHP, MariaDB, Apache, Asterisk, or other dependencies.

## Reporting a vulnerability

Do **not** open a public issue, discussion, or pull request for a suspected
vulnerability.

Report it privately to `info@magnussolution.com` with:

- a clear description and affected component;
- affected version or commit;
- prerequisites and reproducible steps;
- impact and a proof of concept, if safe to share;
- suggested mitigation, if known;
- your preferred contact and disclosure attribution.

Remove customer data, credentials, call records, and other unnecessary
sensitive material. Encrypt especially sensitive details before sending and
coordinate the transfer method with the maintainers.

## What to expect

The maintainers will validate the report, assess affected releases, and
coordinate remediation and disclosure according to severity and project
capacity. Please allow time for analysis before publishing details. If the
report is not a vulnerability, you may be directed to a support channel or
public issue.

## Operator responsibilities

- change all default credentials immediately;
- restrict SSH, the administration panel, AMI, database, and SIP management
  access to trusted networks;
- use TLS where the deployment supports it;
- apply operating-system and dependency security updates;
- keep verified off-host backups and test restoration;
- review accounts, permissions, firewall rules, Fail2ban, and logs regularly;
- never expose database or Asterisk management credentials in public reports.

Security-sensitive deployment guidance is also available under
`wiki/en/security/`.
