const fs = require('fs');
const assert = require('assert');

const list = fs.readFileSync('classic/src/view/magnusSentinel/List.js', 'utf8');
const controller = fs.readFileSync('classic/src/view/magnusSentinel/Controller.js', 'utf8');
const api = fs.readFileSync('protected/components/MagnusSentinelIncidentApiV1.php', 'utf8');
const en = fs.readFileSync('resources/locale/en.js', 'utf8');
const pt = fs.readFileSync('resources/locale/pt_BR.js', 'utf8');

[
    'dns_resolution_degradation',
    'pjsip_dns_search_suffix_risk',
    'pjsip_trunk_dns_failure'
].forEach(type => assert(list.includes(type), type + ' must be filterable'));

[
    'resolver', 'query_type', 'query', 'duration_ms', 'timed_out',
    'dns_status', 'configured_search_domains', 'resolver_options', 'inferred_search_domain',
    'affected_trunk_hosts', 'trunk_host', 'probe_limits'
].forEach(key => {
    assert(api.includes("'" + key + "'"), key + ' must pass API projection');
    assert(controller.includes(key + ':'), key + ' must have a localized label');
});

['DNS resolution degradation', 'PJSIP DNS search suffix risk',
 'PJSIP trunk DNS failure'].forEach(key => {
    assert(en.includes("'" + key + "'"), key + ' must exist in English');
    assert(pt.includes("'" + key + "'"), key + ' must exist in Portuguese');
});

console.log('magnusSentinelDnsPanel.test.js OK');
