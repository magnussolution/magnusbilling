<?php

require_once dirname(__DIR__)
    . '/components/MagnusSentinelIncidentApiV1.php';

function assertTimezoneValue($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new RuntimeException(
            $message . ': expected ' . var_export($expected, true)
            . ', got ' . var_export($actual, true)
        );
    }
}

$previousTimezone = date_default_timezone_get();
date_default_timezone_set('America/Sao_Paulo');

$contract = [
    'window' => [
        'start' => '2026-07-27T18:29:41.338105+00:00',
        'end' => '2026-07-27T18:44:41.338105+00:00',
    ],
];
$row = [
    'first_seen' => '2026-07-24 22:14:07.351070',
    'last_seen' => '2026-07-27 18:49:41.338105',
    'state_changed_at' => '2026-07-27 18:49:41.338105',
];
$method = new ReflectionMethod(
    'MagnusSentinelIncidentApiV1',
    'incidentDisplay'
);
$method->setAccessible(true);
$display = $method->invoke(null, $row, $contract);

assertTimezoneValue(
    'America/Sao_Paulo',
    $display['timezone'],
    'server timezone'
);
assertTimezoneValue(
    '2026-07-24 19:14:07',
    $display['first_seen'],
    'first detection conversion'
);
assertTimezoneValue(
    '2026-07-27 15:49:41',
    $display['last_seen'],
    'last detection conversion'
);
assertTimezoneValue(
    '2026-07-27 15:29:41',
    $display['window_start'],
    'window start conversion'
);
assertTimezoneValue(
    '2026-07-27 15:44:41',
    $display['window_end'],
    'window end conversion'
);
assertTimezoneValue(15.0, $display['window_minutes'], 'window duration');

$listContract = [
    'schema_version' => 'magnus-sentinel.incident/v1',
    'fingerprint' => str_repeat('a', 64),
    'type' => 'server_activity_drop',
    'detector' => ['id' => 'server_activity_drop', 'version' => 1],
    'severity' => 'critical',
    'detected_at' => '2026-07-27T18:49:41.338105+00:00',
    'window' => $contract['window'],
    'entity' => ['kind' => 'server', 'id' => '9', 'name' => '5'],
    'title' => 'Activity drop',
    'summary' => 'Summary',
    'impact' => ['priority' => 'immediate', 'description' => 'Impact'],
    'probable_cause' => [
        'description' => 'Unknown',
        'confidence' => 'medium',
        'hypothesis' => true,
    ],
    'recommended_action' => [
        'description' => 'Review.',
        'automatic' => false,
    ],
    'evidence' => [],
];
$list = MagnusSentinelIncidentApiV1::projectListRow([
    'id' => 1624,
    'incident_type' => 'server_activity_drop',
    'detector_version' => 1,
    'state' => 'new',
    'severity' => 'critical',
    'entity_kind' => 'server',
    'entity_id' => 9,
    'first_seen' => '2026-07-24 22:14:07.351070',
    'last_seen' => '2026-07-27 18:49:41.338105',
    'occurrence_count' => 14,
    'state_changed_at' => '2026-07-24 22:14:07.351070',
    'incident_json' => json_encode($listContract),
]);
assertTimezoneValue(
    '2026-07-27 15:49:41',
    $list['last_seen_display'],
    'list timestamp conversion'
);
assertTimezoneValue(
    'America/Sao_Paulo',
    $list['display_timezone'],
    'list timezone'
);

date_default_timezone_set($previousTimezone);
echo "MagnusSentinelTimezoneApiTest OK\n";
