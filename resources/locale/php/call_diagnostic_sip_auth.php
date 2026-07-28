<?php

/**
 * English fallback for the fixed-IP SIP authentication Call Check.
 *
 * Locale catalogs can override these keys while every supported language
 * continues to receive a complete, versioned diagnostic response.
 */
return [
    'SIP IP authentication' => 'SIP IP authentication',
    'The SIP driver could not be checked safely for this account.' => 'The SIP driver could not be checked safely for this account.',
    'Verify the SIP account name and run Call Check again.' => 'Verify the SIP account name and run Call Check again.',
    'Not determined' => 'Not determined',
    'This fixed-IP account is loaded by PJSIP, which identifies the endpoint by IP without using the chan_sip insecure option.' => 'This fixed-IP account is loaded by PJSIP, which identifies the endpoint by IP without using the chan_sip insecure option.',
    'No insecure change is required. If the endpoint still receives a 401 response, verify its PJSIP identify match and the source IP of the INVITE.' => 'No insecure change is required. If the endpoint still receives a 401 response, verify its PJSIP identify match and the source IP of the INVITE.',
    'Not applicable' => 'Not applicable',
    'The fixed-IP account appears in both chan_sip and PJSIP, so Call Check cannot determine which driver received the INVITE.' => 'The fixed-IP account appears in both chan_sip and PJSIP, so Call Check cannot determine which driver received the INVITE.',
    'Confirm the SIP driver and listening port used by the client before changing insecure.' => 'Confirm the SIP driver and listening port used by the client before changing insecure.',
    'Multiple drivers' => 'Multiple drivers',
    'The account uses a fixed IP, but Call Check could not confirm whether it is loaded by chan_sip or PJSIP.' => 'The account uses a fixed IP, but Call Check could not confirm whether it is loaded by chan_sip or PJSIP.',
    'Reload the SIP configuration and run Call Check again. Do not change insecure until the active SIP driver is confirmed.' => 'Reload the SIP configuration and run Call Check again. Do not change insecure until the active SIP driver is confirmed.',
    'This fixed-IP chan_sip account accepts INVITEs from a different source port without requesting digest authentication.' => 'This fixed-IP chan_sip account accepts INVITEs from a different source port without requesting digest authentication.',
    'No insecure change is required.' => 'No insecure change is required.',
    'This fixed-IP chan_sip account may answer with 401 when an INVITE arrives from the configured IP but uses a different source port.' => 'This fixed-IP chan_sip account may answer with 401 when an INVITE arrives from the configured IP but uses a different source port.',
    'After confirming that the configured IP belongs to this trusted client or provider, set insecure to port,invite and reload the SIP configuration.' => 'After confirming that the configured IP belongs to this trusted client or provider, set insecure to port,invite and reload the SIP configuration.',
    'Not configured' => 'Not configured',
    'The account uses a fixed IP, but Asterisk did not provide enough information to check its authentication behavior.' => 'The account uses a fixed IP, but Asterisk did not provide enough information to check its authentication behavior.',
    'Verify that Asterisk Manager is available, then run Call Check again. Do not change insecure without confirming the active SIP driver.' => 'Verify that Asterisk Manager is available, then run Call Check again. Do not change insecure without confirming the active SIP driver.',
    'Authentication method' => 'Authentication method',
    'Fixed IP' => 'Fixed IP',
    'Configured host' => 'Configured host',
    'Active SIP driver' => 'Active SIP driver',
    'Loaded insecure value' => 'Loaded insecure value',
    'A fixed-IP SIP authentication risk was found before the route check.' => 'A fixed-IP SIP authentication risk was found before the route check.',
];
