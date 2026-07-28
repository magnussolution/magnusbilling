<?php

require_once dirname(__DIR__)
    . '/components/MagnusSentinelIncidentApiV1.php';

function assertFleetValue($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new RuntimeException(
            $message . ': expected ' . var_export($expected, true)
            . ', got ' . var_export($actual, true)
        );
    }
}

$fleet = MagnusSentinelIncidentApiV1::parseListParams([
    'state' => 'active',
    'entity_kind' => 'fleet',
    'entity_id' => 1,
]);
assertFleetValue('fleet', $fleet['entity_kind'], 'fleet filter kind');
assertFleetValue(1, $fleet['entity_id'], 'fleet stable id');

foreach (['trunk', 'server', 'proxy'] as $legacyKind) {
    $legacy = MagnusSentinelIncidentApiV1::parseListParams([
        'entity_kind' => $legacyKind,
    ]);
    assertFleetValue(
        $legacyKind,
        $legacy['entity_kind'],
        'legacy entity compatibility'
    );
}

$contract = [
    'schema_version' => 'magnus-sentinel.incident/v1',
    'fingerprint' => str_repeat('a', 64),
    'type' => 'server_activity_drop',
    'detector' => ['id' => 'server_activity_drop', 'version' => 2],
    'severity' => 'critical',
    'detected_at' => '2026-07-26T12:00:00+00:00',
    'window' => [
        'start' => '2026-07-26T11:40:00+00:00',
        'end' => '2026-07-26T11:55:00+00:00',
    ],
    'entity' => ['kind' => 'fleet', 'id' => '1', 'name' => 'Frota'],
    'title' => 'Global traffic drop',
    'summary' => 'Global event volume dropped.',
    'impact' => ['priority' => 'immediate', 'description' => 'Impact'],
    'probable_cause' => [
        'description' => 'Unknown',
        'confidence' => 'medium',
        'hypothesis' => true,
    ],
    'recommended_action' => [
        'description' => 'Check demand.',
        'automatic' => false,
        'operator_steps' => [],
        'technical_steps' => [],
    ],
    'evidence' => [[
        'key' => 'drop_percentage',
        'kind' => 'derived',
        'description' => 'Drop',
        'value' => 75.0,
    ]],
];
$row = MagnusSentinelIncidentApiV1::projectListRow([
    'id' => 47,
    'incident_type' => 'server_activity_drop',
    'detector_version' => 2,
    'state' => 'new',
    'severity' => 'critical',
    'entity_kind' => 'fleet',
    'entity_id' => 1,
    'first_seen' => '2026-07-26 12:00:00',
    'last_seen' => '2026-07-26 12:00:00',
    'occurrence_count' => 1,
    'state_changed_at' => '2026-07-26 12:00:00',
    'incident_json' => json_encode($contract),
]);
assertFleetValue('fleet', $row['entity_kind'], 'fleet list projection');
assertFleetValue('Frota', $row['entity_name'], 'fleet name projection');
$decoded = MagnusSentinelIncidentApiV1::decodeContract(
    json_encode($contract)
);
assertFleetValue(
    'fleet',
    $decoded['entity']['kind'],
    'fleet detail projection'
);
assertFleetValue(
    'drop_percentage',
    $decoded['evidence'][0]['key'],
    'fleet evidence projection'
);

echo "MagnusSentinelFleetApiTest OK\n";
