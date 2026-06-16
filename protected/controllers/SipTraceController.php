<?php

/**
 * Acoes do modulo "SipTrace".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/02/2018
 */

class SipTraceController extends Controller
{
    public $attributeOrder = 't.id ASC';
    private $log_name      = 'resources/reports/siptrace.log';
    public function init()
    {
        $this->instanceModel = new SipTrace;
        $this->abstractModel = SipTrace::model();
        $this->titleReport   = Yii::t('zii', 'SipTrace');
        parent::init();
    }

    public function actionDetails()
    {
        // -------- Query params --------
        $callIdParam = Yii::app()->request->getParam('callId', null);
        if ($callIdParam === null) $callIdParam = Yii::app()->request->getParam('callid', null);
        if ($callIdParam === null) $callIdParam = Yii::app()->request->getParam('call_id', null);

        $tailLines = (int)Yii::app()->request->getParam('tail', 20000);

        // Log path (as requested)
        $path = $this->log_name;

        // -------- Local IPs (Servers::host) --------
        $localIps = [];
        try {
            $modelServers = Servers::model()->findAll('status = 1');
            foreach ((array)$modelServers as $srv) {
                $host = isset($srv->host) ? (string)$srv->host : '';
                if ($host === '') continue;
                foreach (preg_split('/[,\s;]+/', $host, -1, PREG_SPLIT_NO_EMPTY) as $p) {
                    if (preg_match('/^\[?([0-9a-f\.:]+)\]?/i', $p, $mm)) {
                        $localIps[$mm[1]] = true;
                    }
                }
            }
            $localIps = array_keys($localIps);
        } catch (Exception $e) {
            $localIps = [];
        }

        // -------- Helpers --------
        $hostOnly = function ($addr) {
            if (preg_match('/^\[?([0-9a-f\.:]+)\]?:(\d+)$/i', $addr, $m)) return $m[1];
            if (preg_match('/^\[?([0-9a-f\.:]+)\]?$/i', $addr, $m)) return $m[1];
            return $addr;
        };
        $isLocal = function ($addr) use ($localIps, $hostOnly) {
            if (!$localIps) return false;
            return in_array($hostOnly($addr), $localIps, true);
        };
        $canonId = function ($s) {
            $s = trim((string)$s);
            $s = trim($s, "<>");   // strip angle brackets if present
            $s = rtrim($s, ".");   // accept trailing dot or not
            return $s;
        };

        // -------- Build wanted call-id sets (raw + canonical) with LIMIT=3 --------
        $wantedRaw   = null;   // exact raw values
        $wantedCanon = null;   // canonical values (for robust match)
        $orderedCanon = [];    // preserve input order of canon IDs

        if ($callIdParam !== null) {
            $setR = [];
            $setC = [];

            $pushOne = function ($v) use (&$setR, &$setC, &$orderedCanon, $canonId) {
                if (!is_string($v) || $v === '') return;
                $c = $canonId($v);
                // preserve insertion order for canonical values
                if (!isset($setC[$c])) $orderedCanon[] = $c;
                $setR[$v] = true;
                $setC[$c] = true;
            };

            if (is_array($callIdParam)) {
                foreach ($callIdParam as $v) $pushOne($v);
            } else {
                $s = trim((string)$callIdParam);
                if ($s !== '') {
                    $dec = json_decode($s, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $walk = function ($val) use (&$walk, $pushOne) {
                            if (is_string($val)) $pushOne($val);
                            elseif (is_array($val)) {
                                foreach ($val as $vv) $walk($vv);
                            } elseif (is_object($val)) {
                                foreach (get_object_vars($val) as $vv) $walk($vv);
                            }
                        };
                        $walk($dec);
                    } else {
                        $s2 = trim($s, " \t\n\r\0\x0B[]");
                        foreach (preg_split('/[,\s]+/', $s2, -1, PREG_SPLIT_NO_EMPTY) as $id) $pushOne($id);
                    }
                }
            }

            // ---- Enforce LIMIT=3 on canonical IDs ----
            if (!empty($setC)) {
                if (count($orderedCanon) > 3) {
                    $orderedCanon = array_slice($orderedCanon, 0, 3);
                }
                // rebuild allowed canonical set
                $allowedCanon = array_fill_keys($orderedCanon, true);

                // filter raw set to those whose canonical is allowed
                $filteredR = [];
                foreach ($setR as $raw => $_) {
                    if (isset($allowedCanon[$canonId($raw)])) {
                        $filteredR[$raw] = true;
                    }
                }

                $wantedCanon = $allowedCanon;
                $wantedRaw   = $filteredR;
            }
        }

        // -------- Parser (reusable for tail and full file) --------
        $parseNgrep = function (string $text) use ($isLocal, $wantedRaw, $wantedCanon, $canonId) {
            $events = [];
            $buf = [];
            $lines = preg_split("/\r?\n/", $text);

            $flush = function () use (&$buf, &$events, $isLocal, $wantedRaw, $wantedCanon, $canonId) {
                if (!$buf) return;
                $block = implode("\n", $buf);
                $buf = [];

                // Header: "U 2025/08/08 17:19:19.354066 45.231.169.50:5060 -> 8.28.231.171:5060 #21"
                if (!preg_match('/^[A-Z]\s+(\d{4}\/\d{2}\/\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d+)\s+([0-9a-f\.:]+:\d+)\s+->\s+([0-9a-f\.:]+:\d+)/m', $block, $m)) {
                    return;
                }
                $date = $m[1] . ' ' . $m[2];
                $src  = $m[3];
                $dst  = $m[4];

                // Call-ID (raw + canonical)
                preg_match('/^Call-ID:\s*([^\s]+).*$/mi', $block, $cidm);
                $cidRaw   = isset($cidm[1]) ? trim($cidm[1]) : '';
                $cidCanon = $canonId($cidRaw);

                // If filtering, keep only allowed (by canonical or raw)
                if ($wantedCanon) {
                    if ($cidRaw === '' && $cidCanon === '') return;
                    if (!isset($wantedCanon[$cidCanon]) && !isset($wantedRaw[$cidRaw])) return;
                }

                // Method/Status/Summary
                $summary = null;
                $method = null;
                $status = null;
                if (preg_match('/^\s*(INVITE|ACK|BYE|CANCEL|OPTIONS|REGISTER|PRACK|UPDATE|INFO|SUBSCRIBE|NOTIFY|MESSAGE)\b.*SIP\/2\.0/im', $block, $mm)) {
                    $method  = strtoupper($mm[1]);
                    $summary = $method;
                } elseif (preg_match('/^\s*SIP\/2\.0\s+(\d{3})\s+([^\r\n]+)/im', $block, $mm)) {
                    $status  = (int)$mm[1];
                    $summary = $mm[1] . ' ' . trim($mm[2]);
                } else {
                    if (preg_match('/^\s*(SIP\/2\.0\s+\d{3}\s+[^\r\n]+|[A-Z]+ .* SIP\/2\.0)/mi', $block, $mm)) {
                        $summary = trim($mm[1]);
                    }
                }

                // SDP presence
                $hasSdp = (bool)(
                    preg_match('/^Content-Type:\s*application\/sdp\b/mi', $block) ||
                    preg_match('/^\s*v=0\b/mi', $block) ||
                    preg_match('/^\s*m=audio\b/mi', $block)
                );

                // Timestamp
                $dt = DateTime::createFromFormat('Y/m/d H:i:s.u', $date, new DateTimeZone('UTC'));
                $tsFloat = $dt ? (float)$dt->format('U.u') : microtime(true);

                $events[] = [
                    'call_id'  => $cidRaw !== '' ? $cidRaw : $cidCanon,
                    'ts'       => $dt,
                    'ts_float' => $tsFloat,
                    'dir'      => ($isLocal($dst) && !$isLocal($src)) ? 'RX' : 'TX',
                    'src'      => $src,
                    'dst'      => $dst,
                    'summary'  => $summary ?: 'SIP',
                    'method'   => $method,
                    'status'   => $status,
                    'has_sdp'  => $hasSdp,
                    'payload'  => $block,
                ];
            };

            foreach ($lines as $ln) {
                if (preg_match('/^[A-Z]\s+\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+\s+[0-9a-f\.:]+:\d+\s+->\s+[0-9a-f\.:]+:\d+/', $ln)) {
                    $flush();
                }
                $buf[] = $ln;
            }
            $flush();

            usort($events, function ($a, $b) {
                return $a['ts_float'] <=> $b['ts_float'];
            });
            return $events;
        };

        // -------- Read tail --------
        $textTail = '';
        if (is_string($path) && $path !== '' && is_file($path) && is_readable($path)) {
            $arr = @file($path, FILE_IGNORE_NEW_LINES);
            if ($arr !== false && !empty($arr)) {
                $textTail = implode("\n", array_slice($arr, -$tailLines));
            }
        }
        $events = $parseNgrep($textTail);

        // -------- Fallback: full file when filtering and not found in tail --------
        if ($wantedCanon && empty($events) && is_file($path) && is_readable($path)) {
            $full = @file_get_contents($path);
            if ($full !== false) {
                $events = $parseNgrep($full);
            }
        }

        // -------- Build dialogs array for the view --------
        // Group by Call-ID
        $grouped = [];
        foreach ($events as $e) {
            $grouped[$e['call_id']][] = $e;
        }

        $dialogs = [];
        foreach ($grouped as $cid => $list) {
            usort($list, function ($a, $b) {
                if ($a['ts_float'] == $b['ts_float']) {
                    return 0;
                }
                return ($a['ts_float'] < $b['ts_float']) ? -1 : 1;
            });

            $t0    = $list[0]['ts_float'];
            $t0Str = $list[0]['ts'] ? $list[0]['ts']->format('Y/m/d H:i:s') : '';

            // Distinct endpoints seen (for summary/headers)
            $seen = [];
            foreach ($list as $ev) {
                $seen[$hostOnly($ev['src'])] = true;
                $seen[$hostOnly($ev['dst'])] = true;
            }
            $hosts = array_keys($seen);

            // Prefer a local host on the left; otherwise the first seen
            $leftHost = null;
            foreach ($hosts as $h) if (in_array($h, $localIps, true)) {
                $leftHost = $h;
                break;
            }
            if (!$leftHost) $leftHost = $hostOnly($list[0]['src']);
            $rightHost = null;
            foreach ($hosts as $h) if ($h !== $leftHost) {
                $rightHost = $h;
                break;
            }
            if (!$rightHost) $rightHost = $hostOnly($list[0]['dst']);

            $dialogs[] = [
                'call_id'        => $cid,
                'leftH'          => $leftHost,
                'rightH'         => $rightHost,
                'start_ts_float' => $t0,
                'start_ts_str'   => $t0Str,
                'events_count'   => count($list),
                'events'         => array_map(function ($ev) use ($t0) {
                    $tsStr  = $ev['ts'] ? $ev['ts']->format('Y/m/d H:i:s') : '';
                    $tsHmsu = $ev['ts'] ? $ev['ts']->format('H:i:s.u') : '';
                    return [
                        't'        => round($ev['ts_float'] - $t0, 6),
                        'ts_str'   => $tsStr,
                        'ts_hmsu'  => $tsHmsu,
                        'summary'  => $ev['summary'],
                        'status'   => $ev['status'],
                        'method'   => $ev['method'],
                        'src'      => $ev['src'],
                        'dst'      => $ev['dst'],
                        'has_sdp'  => $ev['has_sdp'],
                        'payload'  => $ev['payload'],
                    ];
                }, $list),
            ];
        }

        // Render
        $this->render('index', [
            'dialogs'    => $dialogs,
            // reflect the limited (max 3) canonical IDs back to the input box
            'callIdJson' => ($wantedCanon ? json_encode(array_keys($wantedCanon)) : (is_string($callIdParam) ? $callIdParam : '')),
            'tailLines'  => $tailLines,
            'logPath'    => $path,
        ]);
    }


    public function actionRead($asJson = true, $condition = null)
    {

        $modelServers = Servers::model()->findAll('status = 1');

        $start = $_GET['start'];

        $filter = isset($_GET['filter']) ? json_decode($_GET['filter']) : [];

        if (count($filter)) {

            foreach ($filter as $key => $value) {
                if ($value->field == 'method') {
                    $filterMethod            = strtoupper($value->value);
                    $filterMethodComparation = $value->comparison;
                }
                if ($value->field == 'callid') {
                    $filterCallid            = $value->value;
                    $filterCallidComparation = $value->comparison;
                }
                if ($value->field == 'fromip') {
                    $filterFromIp            = $value->value;
                    $filterFromIpComparation = $value->comparison;
                }
                if ($value->field == 'toip') {
                    $filterToIp            = $value->value;
                    $filterToIpComparation = $value->comparison;
                }
                if ($value->field == 'sipto') {
                    $filterSipTo            = $value->value;
                    $filterSipToComparation = $value->comparison;
                }
            }
        }
        try {
            $data = @file_get_contents($this->log_name)
                or die(json_encode([
                    'rows'  => [],
                    'count' => 0,
                    'sum'   => [],
                ]));
        } catch (Exception $e) {
            exit;
        }

        $result = htmlentities($data);

        $result = explode("U " . date('Y') . "", $result);

        $packet = [];
        $id     = 1;
        foreach ($result as $key => $value) {

            $callid = '';

            $lines = preg_split('/\r\n|\r|\n/', $value);

            if (count($lines) < 10) {
                continue;
            }
            if (preg_match('/Trying/', $lines[1])) {
                $method = '100 Trying';
            } else if (preg_match('/SIP\/2\.0 /', $lines[1])) {
                $method = explode('SIP/2.0 ', $lines[1]);
                $method = $method[1];
            } else {
                $method = explode(' ', $lines[1]);
                $method = $method[0];
            }

            $fromTo = explode(' ', $lines[0]);
            if (! isset($fromTo[2])) {
                continue;
            }
            $fromIp = strtok($fromTo[2], ':');

            if (! isset($fromTo[4])) {
                continue;
            }

            $toIp = strtok($fromTo[4], ':');

            foreach ($lines as $key => $line) {
                if (preg_match('/Call-ID:/', $line)) {
                    $callid = trim(substr($line, 8));
                }
                if (preg_match('/To:/', $line)) {
                    $sipto = trim(substr($line, 3));
                }
            }

            if (! isset($sipto)) {
                continue;
            }

            if (isset($filterMethod)) {
                //filter method
                if ($filterMethodComparation == 'st') {
                    if (! preg_match('/^' . $filterMethod . '/', $method)) {
                        continue;
                    }
                }
                if ($filterMethodComparation == 'ed') {
                    if (! preg_match('/' . $filterMethod . '$/', $method)) {
                        continue;
                    }
                }
                if ($filterMethodComparation == 'ct') {
                    if (! preg_match('/' . $filterMethod . '/', $method)) {
                        continue;
                    }
                }
                if ($filterMethodComparation == 'eq') {
                    if ($filterMethod != $method) {
                        continue;
                    }
                }
            }

            if (isset($filterFromIp)) {
                //filter callerid
                if ($filterFromIpComparation == 'st') {
                    if (! preg_match('/^' . $filterFromIp . '/', $fromIp)) {
                        continue;
                    }
                }
                if ($filterFromIpComparation == 'ed') {
                    if (! preg_match('/' . $filterFromIp . '$/', $fromIp)) {
                        continue;
                    }
                }
                if ($filterFromIpComparation == 'ct') {
                    if (! preg_match('/' . $filterFromIp . '/', $fromIp)) {
                        continue;
                    }
                }
                if ($filterFromIpComparation == 'eq') {
                    if ($filterFromIp != $fromIp) {
                        continue;
                    }
                }
            }

            if (isset($filterToIp)) {
                //filter callerid
                if ($filterToIpComparation == 'st') {
                    if (! preg_match('/^' . $filterToIp . '/', $toIp)) {
                        continue;
                    }
                }
                if ($filterToIpComparation == 'ed') {
                    if (! preg_match('/' . $filterToIp . '$/', $toIp)) {
                        continue;
                    }
                }
                if ($filterToIpComparation == 'ct') {
                    if (! preg_match('/' . $filterToIp . '/', $toIp)) {
                        continue;
                    }
                }
                if ($filterToIpComparation == 'eq') {
                    if ($filterToIp != $toIp) {
                        continue;
                    }
                }
            }

            if (isset($filterCallid)) {
                //filter callerid
                if ($filterCallidComparation == 'st') {
                    if (! preg_match('/^' . $filterCallid . '/', $callid)) {
                        continue;
                    }
                }
                if ($filterCallidComparation == 'ed') {
                    if (! preg_match('/' . $filterCallid . '$/', $callid)) {
                        continue;
                    }
                }
                if ($filterCallidComparation == 'ct') {
                    if (! preg_match('/' . $filterCallid . '/', $callid)) {
                        continue;
                    }
                }
                if ($filterCallidComparation == 'eq') {
                    if ($filterCallid != $callid) {
                        continue;
                    }
                }
            }

            if (isset($filterSipTo)) {
                //filter callerid
                if ($filterSipToComparation == 'st') {
                    if (! preg_match('/^' . $filterSipTo . '/', $sipto)) {
                        continue;
                    }
                }
                if ($filterSipToComparation == 'ed') {
                    if (! preg_match('/' . $filterSipTo . '$/', $sipto)) {
                        continue;
                    }
                }
                if ($filterSipToComparation == 'ct') {
                    if (! preg_match('/' . $filterSipTo . '/', $sipto)) {
                        continue;
                    }
                }
                if ($filterSipToComparation == 'eq') {
                    if ($filterSipTo != $sipto) {
                        continue;
                    }
                }
            }

            if ($id < $start) {
                $id++;
                continue;
            }
            if ($id > $start + 25) {
                break;
            }

            $server_id_from = array_search($fromIp, array_column($modelServers, 'host'));
            $server_id_to   = array_search($toIp, array_column($modelServers, 'host'));

            array_push($packet, [
                'id'     => $id,
                'method' => $method,
                'fromip' => $server_id_from !== false ? $modelServers[$server_id_from]->name . ' (' . $fromIp . ')' : $fromIp,
                'toip'   => $server_id_to !== false ? $modelServers[$server_id_to]->name . ' (' . $toIp . ')' : $toIp,
                'sipto'  => $sipto,
                'callid' => $callid,
                'head'   => date('Y') . html_entity_decode($value),
            ]);

            $id++;
        }

        echo json_encode([
            'rows'  => $packet,
            'count' => count($packet) < 25 ? count($packet) : count($result),
            'sum'   => [],
        ], JSON_UNESCAPED_SLASHES);
    }

    public function actionDestroy()
    {
        SipTrace::model()->deleteAll();
        unlink('/var/www/html/mbilling/resources/reports/siptrace.log');
    }

    public function actionExport()
    {
        header('Content-type: application/csv; charset=utf-8');
        header('Content-Disposition: inline; filename="MagnusBilling_siptrace_' . time() . '.log"');
        header('Content-Transfer-Encoding: binary');

        header('Accept-Ranges: bytes');
        ob_clean();
        flush();
        readfile($this->log_name);
    }

    public function actionStart()
    {

        $filter     = isset($_POST['filter']) ? trim((string) $_POST['filter']) : '';
        $timeoutRaw = isset($_POST['timeout']) ? trim((string) $_POST['timeout']) : '60';
        $portRaw    = isset($_POST['port']) ? trim((string) $_POST['port']) : '5060';
        $timeout    = ctype_digit($timeoutRaw) ? (int) $timeoutRaw : 0;
        $port       = ctype_digit($portRaw) ? (int) $portRaw : 0;

        $error = null;
        if ($filter === '' || strlen($filter) > 50 || preg_match('/[\x00-\x1F\x7F]/', $filter)) {
            $error = Yii::t('zii', 'Invalid filter');
        } else if (! ctype_digit($timeoutRaw) || $timeout < 5 || $timeout > 300) {
            $error = Yii::t('zii', 'Invalid timeout');
        } else if (! ctype_digit($portRaw) || $port < 1 || $port > 65535) {
            $error = Yii::t('zii', 'Invalid port');
        }

        if ($error !== null) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => $error,
                'errors'           => $error,
            ]);
            exit;
        }

        $modelTrace = SipTrace::model()->find();

        if (isset($modelTrace->id)) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => Yii::t('zii', 'Exist a filter active or in use. Wait or click in Stop Capture button.'),
            ]);
            exit;
        }
        $modelTrace          = new SipTrace();
        $modelTrace->filter  = $filter;
        $modelTrace->timeout = $timeout;
        $modelTrace->port    = $port;
        $modelTrace->status  = 1;
        $modelTrace->in_use  = 0;
        if (! $modelTrace->save()) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => Yii::t('zii', 'Error'),
                'errors'           => $modelTrace->getErrors(),
            ]);
            exit;
        }

        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => Yii::t('zii', 'Reload this module to see the packets'),
        ]);
    }

    public function actionClearAll()
    {
        try {
            SipTrace::model()->deleteAll();
        } catch (Exception $e) {
            print_r($e);
        }
    }
}
