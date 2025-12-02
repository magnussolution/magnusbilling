<?php
/* @var $dialogs array */
/* @var $callIdJson string */
/* @var $tailLines int */
/* @var $logPath string */

$this->pageTitle = 'SIPTRACE – sngrep-like (multi-call in one grid)';

// Guards
$dialogs    = is_array($dialogs) ? $dialogs : [];
$callIdJson = isset($callIdJson) ? (string)$callIdJson : '';
$tailLines  = isset($tailLines) ? (int)$tailLines : 0;
$logPath    = isset($logPath) ? (string)$logPath : '';

// Safe anchor from Call-ID
$anchorId = function ($cid) {
	$id = preg_replace('/[^A-Za-z0-9\-\_\.:@]/', '_', (string)$cid);
	return 'dlg_' . $id;
};

// Build absolute float timestamp from "Y/m/d H:i:s" + "H:i:s.u"
$absTs = function ($tsStr, $hmsu) {
	if (!$tsStr) return 0.0;
	$date = substr($tsStr, 0, 10); // Y/m/d
	$hms  = $hmsu ? explode('.', $hmsu, 2)[0] : substr($tsStr, 11, 8);
	$us   = 0;
	if ($hmsu && strpos($hmsu, '.') !== false) {
		$parts = explode('.', $hmsu, 2);
		$us    = (int)preg_replace('/\D/', '', $parts[1]);
	}
	$base = strtotime($date . ' ' . $hms);
	return $base + ($us / 1000000.0);
};
?>
<style>
	/* page fills with theme background */
	html,
	body {
		height: 100%;
		background: #0b1721;
		/* fallback in case :root not parsed early */
		margin: 0;
	}

	/* ---- sngrep-like dark theme ---- */
	:root {
		--bg: #0b1721;
		--bg2: #0e1d29;
		--grid: #1e2c3a;
		--fg: #d7e1ea;
		--muted: #93a4b3;
		--green: #65d46e;
		--red: #ff5f56;
		--amber: #f4c542;
		--blue: #3aa0ff33;
	}

	.wrap {
		min-height: 100vh;
		/* full viewport height */
		width: 100%;
		padding: 10px;
		background: var(--bg);
		color: var(--fg);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace;
		overflow-x: auto;
		/* horizontal scroll for many columns */
	}

	.toolsbar {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		margin: 0 0 12px
	}

	.toolsbar label {
		font-size: 12px;
		color: var(--muted);
		margin-right: 4px
	}

	.toolsbar input[type=text],
	.toolsbar input[type=number] {
		padding: 6px 8px;
		border: 1px solid var(--grid);
		border-radius: 6px;
		background: var(--bg2);
		color: var(--fg)
	}

	.toolsbar .btn {
		padding: 6px 10px;
		border: 1px solid var(--grid);
		border-radius: 6px;
		background: var(--bg2);
		color: var(--fg);
		cursor: pointer
	}

	.toolsbar .btn:hover {
		filter: brightness(1.15)
	}

	.toolsbar .sep {
		flex: 1
	}

	.toolsbar small.mono {
		font-family: inherit;
		color: var(--muted)
	}

	/* unified sngrep grid */
	table.sng {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		table-layout: fixed;
		background: var(--bg2);
		border: 1px solid var(--grid)
	}

	table.sng th,
	table.sng td {
		border-bottom: 1px solid var(--grid);
		padding: 2px 6px;
		vertical-align: middle
	}

	table.sng th {
		background: var(--bg2);
		color: var(--muted)
	}

	table.sng td.time {
		width: 150px;
		white-space: nowrap
	}

	.time .abs {
		color: var(--fg)
	}

	.time .rel {
		color: var(--muted);
		font-size: 12px
	}

	/* group header (Call-ID above its endpoints) */
	th.group {
		background: var(--bg2);
		color: #a6c8ff;
		text-align: center;
		font-weight: 600;
		border-left: 1px solid var(--grid);
		border-right: 1px solid var(--grid)
	}

	th.endpoint {
		border-left: 1px solid var(--grid);
		border-right: 1px solid var(--grid);
		text-align: center;
		white-space: nowrap
	}

	td.empty {
		border-left: 1px solid var(--grid);
		border-right: 1px solid var(--grid);
		height: 24px;
		background: transparent
	}

	/* message span cell crosses only inside its group (colspan) */
	td.msgspan {
		position: relative;
		padding: 0;
		border-left: 1px solid var(--grid);
		border-right: 1px solid var(--grid);
		overflow: visible
	}

	.msgbar {
		position: relative;
		height: 32px;
		display: flex;
		align-items: center;
		padding: 0 6px
	}

	.msgbar::before {
		content: "";
		position: absolute;
		left: 6px;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		height: 0;
		border-top: 2px solid var(--muted);
		opacity: .5
	}

	/* colors by type */
	.req .msgbar {
		color: var(--red)
	}

	.req .msgbar::before {
		border-color: var(--red)
	}

	.resp1xx .msgbar,
	.resp2xx .msgbar {
		color: var(--green)
	}

	.resp1xx .msgbar::before,
	.resp2xx .msgbar::before {
		border-color: var(--green)
	}

	.respErr .msgbar {
		color: var(--amber)
	}

	.respErr .msgbar::before {
		border-color: var(--amber)
	}

	/* arrow at the edge (direction) */
	.msgbar .arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-weight: 700
	}

	.dir-right .arrow {
		right: 8px
	}

	.dir-left .arrow {
		left: 8px
	}

	/* centered label above the line */
	.msgbar .label {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -100%);
		/* you asked for -100% */
		background: rgba(255, 255, 255, 0.06);
		padding: 0 6px;
		border-radius: 4px;
		line-height: 14px;
		font-size: 12px;
		color: var(--fg);
		white-space: nowrap;
		pointer-events: none;
		max-width: calc(100% - 24px);
		overflow: hidden;
		text-overflow: ellipsis;
		z-index: 2;
	}

	/* click affordance + selected state */
	tr.evt {
		cursor: pointer;
	}

	tr.evt.selected td,
	tr.evt.selected td * {
		color: #fff !important;
	}

	tr.evt.selected .msgbar::before {
		opacity: .8;
	}

	tr.evt.selected .msgbar .label {
		background: rgba(255, 255, 255, 0.12);
	}

	.payload {
		background: #fafafa;
	}
</style>

<div class="wrap">
	<?php if (empty($dialogs)): ?>
		<p>No dialogs found.</p>
	<?php endif; ?>

	<?php
	// --- Build groups (one per dialog), sorted left→right by start time ASC ---
	$groups = []; // each: ['cid','endpoints'=>[],'map'=>[],'orig'=>idx,'start_abs'=>float]
	foreach ($dialogs as $idx => $d) {
		$cols   = [];
		$events = (isset($d['events']) && is_array($d['events'])) ? $d['events'] : [];
		foreach ($events as $ev) {
			$s = isset($ev['src']) ? $ev['src'] : '';
			$t = isset($ev['dst']) ? $ev['dst'] : '';
			if ($s !== '' && !isset($cols[$s])) $cols[$s] = count($cols);
			if ($t !== '' && !isset($cols[$t])) $cols[$t] = count($cols);
		}
		$first    = isset($events[0]) ? $events[0] : null;
		$startAbs = $first ? $absTs(isset($first['ts_str']) ? $first['ts_str'] : '', isset($first['ts_hmsu']) ? $first['ts_hmsu'] : '') : PHP_INT_MAX;

		$groups[] = [
			'cid'       => isset($d['call_id']) ? $d['call_id'] : ('call_' . $idx),
			'endpoints' => array_keys($cols),
			'map'       => $cols,
			'orig'      => $idx,
			'start_abs' => $startAbs,
		];
	}
	usort($groups, function ($a, $b) {
		return $a['start_abs'] <=> $b['start_abs'];
	});

	// Map original dialog index -> new group index
	$gMap = [];
	foreach ($groups as $newIdx => $g) {
		$gMap[$g['orig']] = $newIdx;
	}

	// --- Flatten all events across dialogs (global time order) ---
	$all = [];
	foreach ($dialogs as $origIdx => $d) {
		$events = (isset($d['events']) && is_array($d['events'])) ? $d['events'] : [];
		foreach ($events as $ev) {
			$tsStr = isset($ev['ts_str']) ? $ev['ts_str'] : '';
			$hmsu  = isset($ev['ts_hmsu']) ? $ev['ts_hmsu'] : '';
			$abs   = $absTs($tsStr, $hmsu);

			// Build label + CSS class (request/response)
			$status  = array_key_exists('status', $ev) ? $ev['status'] : null;
			$method  = isset($ev['method']) ? strtoupper($ev['method']) : null;
			$summary = isset($ev['summary']) ? $ev['summary'] : '';
			$hasSdp  = !empty($ev['has_sdp']);

			if (!is_null($status)) {
				$label = rtrim($summary, " .\t") . ($hasSdp ? ' (SDP)' : '');
			} else {
				if ($method === 'INVITE') $label = 'INVITE' . ($hasSdp ? ' (SDP)' : '');
				elseif ($method === 'ACK')    $label = 'ACK'    . ($hasSdp ? ' (SDP)' : '');
				else                          $label = ($method ?: $summary) . ($hasSdp ? ' (SDP)' : '');
			}

			if (is_null($status))         $cls = 'req';
			elseif ($status < 200)        $cls = 'resp1xx';
			elseif ($status < 300)        $cls = 'resp2xx';
			else                          $cls = 'respErr';

			$all[] = [
				'abs'     => $abs,
				'hmsu'    => $hmsu ? $hmsu : (substr($tsStr, 11, 8) . '.000000'),
				'dialog'  => isset($gMap[$origIdx]) ? $gMap[$origIdx] : 0, // group index after left→right sort
				'src'     => isset($ev['src']) ? $ev['src'] : '',
				'dst'     => isset($ev['dst']) ? $ev['dst'] : '',
				'label'   => $label,
				'cls'     => $cls,
				'payload' => isset($ev['payload']) ? $ev['payload'] : '',
			];
		}
	}
	usort($all, function ($a, $b) {
		return $a['abs'] <=> $b['abs'];
	});
	?>

	<?php if (!empty($groups)): ?>
		<!-- Unified multi-call grid -->
		<table class="sng">
			<thead>
				<!-- Row 1: group titles (Call-ID) -->
				<tr>
					<th rowspan="2" style="width:150px">Time</th>

				</tr>
				<!-- Row 2: endpoints -->
				<tr>
					<?php foreach ($groups as $g): ?>
						<?php foreach ($g['endpoints'] as $ep): ?>
							<th class="endpoint"><?= CHtml::encode($ep) ?></th>
						<?php endforeach; ?>
					<?php endforeach; ?>
				</tr>
			</thead>
			<tbody>
				<?php
				$prevAbs = null; // global delta across all messages
				foreach ($all as $row):
					$abs   = $row['abs'];
					$hmsu  = $row['hmsu'];
					$delta = ($prevAbs === null) ? '' : number_format(max(0, $abs - $prevAbs), 6, '.', '') . 's';
					$prevAbs = $abs;
				?>
					<tr class="evt" onclick="togglePayload(this)">
						<td class="time">
							<div class="abs"><?= CHtml::encode($hmsu) ?></div>
							<div class="rel"><?= $delta ? '+' . CHtml::encode($delta) : '' ?></div>
						</td>

						<?php
						// Render group blocks left→right; only the owning group has the msgspan
						foreach ($groups as $gIdx => $g) {
							$cols  = $g['map'];
							$nCols = count($g['endpoints']);

							if ($row['dialog'] === $gIdx) {
								// Defensive: if src/dst are not in the map, leave this group empty
								$si = isset($cols[$row['src']]) ? $cols[$row['src']] : null;
								$di = isset($cols[$row['dst']]) ? $cols[$row['dst']] : null;

								if ($si === null || $di === null) {
									for ($c = 0; $c < $nCols; $c++) echo '<td class="empty"></td>';
									continue;
								}

								$from = min($si, $di);
								$to   = max($si, $di);
								$span = max(1, $to - $from + 1);

								for ($c = 0; $c < $nCols; $c++) {
									if ($c === $from) {
										$right = ($si < $di);
						?>
										<td class="msgspan <?= CHtml::encode($row['cls']) ?> <?= $right ? 'dir-right' : 'dir-left' ?>" colspan="<?= (int)$span ?>">
											<div class="msgbar">
												<span class="label"><?= CHtml::encode($row['label']) ?></span>
												<span class="arrow"><?= $right ? '→' : '←' ?></span>
											</div>
										</td>
						<?php
										$c += ($span - 1);
									} else {
										echo '<td class="empty"></td>';
									}
								}
							} else {
								for ($c = 0; $c < $nCols; $c++) echo '<td class="empty"></td>';
							}
						}
						?>
					</tr>
					<tr class="pay" style="display:none">
						<td colspan="<?= 1 + array_sum(array_map(function ($gg) {
											return count($gg['endpoints']);
										}, $groups)) ?>">
							<pre class="payload"><?= CHtml::encode($row['payload']) ?></pre>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	<?php endif; ?>
</div>

<script>
	// Toggle one payload at a time within the unified table, and highlight selected row
	function togglePayload(tr) {
		const table = tr.closest('table');
		const payRow = tr.nextElementSibling;
		const isOpen = payRow && payRow.style.display === 'table-row';

		// close all payloads and remove selection
		table.querySelectorAll('tr.pay').forEach(r => r.style.display = 'none');
		table.querySelectorAll('tr.evt.selected').forEach(r => r.classList.remove('selected'));

		// open the clicked payload and mark selected
		if (!isOpen && payRow && payRow.classList.contains('pay')) {
			payRow.style.display = 'table-row';
			tr.classList.add('selected');
			payRow.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth'
			});
		}
	}
</script>