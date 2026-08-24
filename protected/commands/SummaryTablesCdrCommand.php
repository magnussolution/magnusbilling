<?php
/**
 * Incremental CDR summary maintenance.
 */
class SummaryTablesCdrCommand extends CConsoleCommand
{
    const DAY_USER = 'pkg_cdr_summary_day_user';
    const DAY_TRUNK = 'pkg_cdr_summary_day_trunk';
    const DAY_AGENT = 'pkg_cdr_summary_day_agent';
    const MONTH_DID = 'pkg_cdr_summary_month_did';

    private $day;
    private $isBackfill = false;
    private $affectedDays = [];
    private $affectedUserIds = [];
    private $affectedTrunkIds = [];

    public function run($args)
    {
        $this->isBackfill = isset($args[0]);
        $this->day = $this->isBackfill ? $args[0] : date('Y-m-d');
        if (!$this->validateDate($this->day)) {
            echo "Date is invalid, use today\n";
            $this->day = date('Y-m-d');
            $this->isBackfill = false;
        }
        if ($this->isBackfill) {
            $this->addAffectedDay($this->day);
        }

        $this->perDayUser();
        $this->perDayTrunk();
        $this->perDayAgent();
        $this->collectAffectedDimensions();
        $this->perDay();
        $this->perMonth();
        $this->perMonthUser();
        $this->perMonthTrunk();
        $this->perUser();
        $this->perTrunk();
        $this->perMonthDid();
    }

    public function perDayUser()
    {
        $checkpoint = $this->getCheckpoint(self::DAY_USER);
        $maxCdrId = $this->maxId('pkg_cdr');
        $maxFailedId = $this->maxId('pkg_cdr_failed');
        if ($this->isBackfill || $checkpoint === false) {
            $this->addAffectedDay($this->day);
            $this->collectExistingIds(self::DAY_USER, 'id_user', $this->day, 'user');
            $tx = Yii::app()->db->beginTransaction();
            try {
                $this->deleteDay(self::DAY_USER, $this->day);
                $this->upsertDayUser(0, $maxCdrId, 0, $maxFailedId, $this->day, $this->nextDay($this->day));
                $this->finalizeDayUser([$this->day]);
                if (!$this->isBackfill) {
                    $this->saveCheckpoint(self::DAY_USER, $maxCdrId, $maxFailedId);
                }
                $tx->commit();
            } catch (Exception $e) {
                $this->rollback($tx);
                throw $e;
            }
            $this->log('perDayUser bootstrap');
            return;
        }
        $tx = Yii::app()->db->beginTransaction();
        try {
            $checkpoint = $this->getCheckpoint(self::DAY_USER, true);
            $maxCdrId = $this->maxId('pkg_cdr');
            $maxFailedId = $this->maxId('pkg_cdr_failed');
            $lastCdrId = (int) $checkpoint['cdr_id'];
            $lastFailedId = (int) $checkpoint['cdr_falide_id'];
            $this->collectSourceDays('pkg_cdr', $lastCdrId, $maxCdrId);
            $this->collectSourceDays('pkg_cdr_failed', $lastFailedId, $maxFailedId);
            $this->upsertDayUser($lastCdrId, $maxCdrId, $lastFailedId, $maxFailedId);
            $this->finalizeDayUser(array_keys($this->affectedDays));
            $this->saveCheckpoint(self::DAY_USER, $maxCdrId, $maxFailedId);
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perDayUser incremental');
    }

    public function perDayTrunk()
    {
        $checkpoint = $this->getCheckpoint(self::DAY_TRUNK);
        $maxCdrId = $this->maxId('pkg_cdr');
        $maxFailedId = $this->maxId('pkg_cdr_failed');
        if ($this->isBackfill || $checkpoint === false) {
            $this->addAffectedDay($this->day);
            $this->collectExistingIds(self::DAY_TRUNK, 'id_trunk', $this->day, 'trunk');
            $tx = Yii::app()->db->beginTransaction();
            try {
                $this->deleteDay(self::DAY_TRUNK, $this->day);
                $this->upsertDayTrunk(0, $maxCdrId, 0, $maxFailedId, $this->day, $this->nextDay($this->day));
                $this->finalizeDayTrunk([$this->day]);
                if (!$this->isBackfill) {
                    $this->saveCheckpoint(self::DAY_TRUNK, $maxCdrId, $maxFailedId);
                }
                $tx->commit();
            } catch (Exception $e) {
                $this->rollback($tx);
                throw $e;
            }
            $this->log('perDayTrunk bootstrap');
            return;
        }
        $tx = Yii::app()->db->beginTransaction();
        try {
            $checkpoint = $this->getCheckpoint(self::DAY_TRUNK, true);
            $maxCdrId = $this->maxId('pkg_cdr');
            $maxFailedId = $this->maxId('pkg_cdr_failed');
            $lastCdrId = (int) $checkpoint['cdr_id'];
            $lastFailedId = (int) $checkpoint['cdr_falide_id'];
            $this->collectSourceDays('pkg_cdr', $lastCdrId, $maxCdrId);
            $this->collectSourceDays('pkg_cdr_failed', $lastFailedId, $maxFailedId);
            $this->upsertDayTrunk($lastCdrId, $maxCdrId, $lastFailedId, $maxFailedId);
            $this->finalizeDayTrunk(array_keys($this->affectedDays));
            $this->saveCheckpoint(self::DAY_TRUNK, $maxCdrId, $maxFailedId);
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perDayTrunk incremental');
    }

    public function perDayAgent()
    {
        $checkpoint = $this->getCheckpoint(self::DAY_AGENT);
        $maxCdrId = $this->maxId('pkg_cdr');
        $maxFailedId = $this->maxId('pkg_cdr_failed');
        if ($this->isBackfill || $checkpoint === false) {
            $this->addAffectedDay($this->day);
            $tx = Yii::app()->db->beginTransaction();
            try {
                $this->deleteDay(self::DAY_AGENT, $this->day);
                $this->upsertDayAgent(0, $maxCdrId, $this->day, $this->nextDay($this->day));
                $this->finalizeDayAgent([$this->day]);
                if (!$this->isBackfill) {
                    $this->saveCheckpoint(self::DAY_AGENT, $maxCdrId, $maxFailedId);
                }
                $tx->commit();
            } catch (Exception $e) {
                $this->rollback($tx);
                throw $e;
            }
            $this->log('perDayAgent bootstrap');
            return;
        }
        $tx = Yii::app()->db->beginTransaction();
        try {
            $checkpoint = $this->getCheckpoint(self::DAY_AGENT, true);
            $maxCdrId = $this->maxId('pkg_cdr');
            $maxFailedId = $this->maxId('pkg_cdr_failed');
            $lastCdrId = (int) $checkpoint['cdr_id'];
            $this->collectSourceDays('pkg_cdr', $lastCdrId, $maxCdrId);
            $this->upsertDayAgent($lastCdrId, $maxCdrId);
            $this->finalizeDayAgent(array_keys($this->affectedDays));
            $this->saveCheckpoint(self::DAY_AGENT, $maxCdrId, $maxFailedId);
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perDayAgent incremental');
    }

    public function perDay()
    {
        $tx = Yii::app()->db->beginTransaction();
        try {
            foreach (array_keys($this->affectedDays) as $day) {
                $this->deleteDay('pkg_cdr_summary_day', $day);
                $sql = "INSERT INTO pkg_cdr_summary_day
                            (day, sessiontime, aloc_all_calls, nbcall, nbcall_fail,
                             buycost, sessionbill, lucro, asr)
                        SELECT :day, SUM(sessiontime), SUM(sessiontime) / NULLIF(SUM(nbcall), 0),
                               SUM(nbcall), SUM(nbcall_fail), SUM(buycost), SUM(sessionbill),
                               SUM(sessionbill) - SUM(buycost),
                               SUM(nbcall) / NULLIF(SUM(nbcall) + SUM(nbcall_fail), 0) * 100
                        FROM pkg_cdr_summary_day_user WHERE day = :source_day
                        HAVING COUNT(*) > 0";
                $this->execute($sql, [':day' => $day, ':source_day' => $day]);
            }
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perDay');
    }

    public function perMonth()
    {
        $tx = Yii::app()->db->beginTransaction();
        try {
            foreach ($this->affectedMonths() as $month => $range) {
                $this->execute('DELETE FROM pkg_cdr_summary_month WHERE month = :month', [':month' => $month]);
                $sql = "INSERT INTO pkg_cdr_summary_month
                            (month, sessiontime, aloc_all_calls, nbcall, nbcall_fail,
                             buycost, sessionbill, lucro, asr)
                        SELECT :month, SUM(sessiontime), SUM(sessiontime) / NULLIF(SUM(nbcall), 0),
                               SUM(nbcall), SUM(nbcall_fail), SUM(buycost), SUM(sessionbill),
                               SUM(sessionbill) - SUM(buycost),
                               SUM(nbcall) / NULLIF(SUM(nbcall) + SUM(nbcall_fail), 0) * 100
                        FROM pkg_cdr_summary_day
                        WHERE day >= :first_day AND day < :next_month
                        HAVING COUNT(*) > 0";
                $this->execute($sql, [':month' => $month, ':first_day' => $range[0], ':next_month' => $range[1]]);
            }
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perMonth');
    }

    public function perMonthUser()
    {
        if (!$this->affectedUserIds) {
            return;
        }
        $idParams = [];
        $in = $this->inClause(array_keys($this->affectedUserIds), 'month_user', $idParams);
        $tx = Yii::app()->db->beginTransaction();
        try {
            foreach ($this->affectedMonths() as $month => $range) {
                $deleteParams = array_merge($idParams, [':month' => $month]);
                $params = array_merge($idParams, [
                    ':month' => $month,
                    ':first_day' => $range[0],
                    ':next_month' => $range[1],
                ]);
                $this->execute(
                    "DELETE FROM pkg_cdr_summary_month_user
                     WHERE month = :month AND id_user IN ({$in})",
                    $deleteParams
                );
                $sql = "INSERT INTO pkg_cdr_summary_month_user
                            (month, id_user, sessiontime, aloc_all_calls, nbcall,
                             nbcall_fail, buycost, sessionbill, lucro, isAgent, agent_bill, asr)
                        SELECT :month, id_user, SUM(sessiontime),
                               SUM(sessiontime) / NULLIF(SUM(nbcall), 0), SUM(nbcall),
                               SUM(nbcall_fail), SUM(buycost), SUM(sessionbill),
                               IF(MAX(COALESCE(isAgent, 0)) = 1,
                                  SUM(agent_bill) - SUM(sessionbill),
                                  SUM(sessionbill) - SUM(buycost)),
                               MAX(COALESCE(isAgent, 0)), SUM(agent_bill),
                               SUM(nbcall) / NULLIF(SUM(nbcall) + SUM(nbcall_fail), 0) * 100
                        FROM pkg_cdr_summary_day_user
                        WHERE day >= :first_day AND day < :next_month
                          AND id_user IN ({$in}) GROUP BY id_user";
                $this->execute($sql, $params);
            }
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perMonthUser');
    }

    public function perMonthTrunk()
    {
        if (!$this->affectedTrunkIds) {
            return;
        }
        $idParams = [];
        $in = $this->inClause(array_keys($this->affectedTrunkIds), 'month_trunk', $idParams);
        $tx = Yii::app()->db->beginTransaction();
        try {
            foreach ($this->affectedMonths() as $month => $range) {
                $deleteParams = array_merge($idParams, [':month' => $month]);
                $params = array_merge($idParams, [
                    ':month' => $month,
                    ':first_day' => $range[0],
                    ':next_month' => $range[1],
                ]);
                $this->execute(
                    "DELETE FROM pkg_cdr_summary_month_trunk
                     WHERE month = :month AND id_trunk IN ({$in})",
                    $deleteParams
                );
                $sql = "INSERT INTO pkg_cdr_summary_month_trunk
                            (month, id_trunk, sessiontime, aloc_all_calls, nbcall,
                             nbcall_fail, buycost, sessionbill, lucro, asr)
                        SELECT :month, id_trunk, SUM(sessiontime),
                               SUM(sessiontime) / NULLIF(SUM(nbcall), 0), SUM(nbcall),
                               SUM(nbcall_fail), SUM(buycost), SUM(sessionbill),
                               SUM(sessionbill) - SUM(buycost),
                               SUM(nbcall) / NULLIF(SUM(nbcall) + SUM(nbcall_fail), 0) * 100
                        FROM pkg_cdr_summary_day_trunk
                        WHERE day >= :first_day AND day < :next_month
                          AND id_trunk IN ({$in}) GROUP BY id_trunk";
                $this->execute($sql, $params);
            }
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perMonthTrunk');
    }

    public function perUser()
    {
        if (!$this->affectedUserIds) {
            return;
        }
        $params = [];
        $in = $this->inClause(array_keys($this->affectedUserIds), 'user', $params);
        $tx = Yii::app()->db->beginTransaction();
        try {
            $this->execute("DELETE FROM pkg_cdr_summary_user WHERE id_user IN ({$in})", $params);
            $sql = "INSERT INTO pkg_cdr_summary_user
                        (id_user, sessiontime, aloc_all_calls, nbcall, nbcall_fail,
                         buycost, sessionbill, lucro, asr, isAgent, agent_bill)
                    SELECT id_user, SUM(sessiontime), SUM(sessiontime) / NULLIF(SUM(nbcall), 0),
                           SUM(nbcall), SUM(nbcall_fail), SUM(buycost), SUM(sessionbill),
                           IF(MAX(COALESCE(isAgent, 0)) = 1,
                              SUM(agent_bill) - SUM(sessionbill),
                              SUM(sessionbill) - SUM(buycost)),
                           SUM(nbcall) / NULLIF(SUM(nbcall) + SUM(nbcall_fail), 0) * 100,
                           MAX(COALESCE(isAgent, 0)), SUM(agent_bill)
                    FROM pkg_cdr_summary_day_user WHERE id_user IN ({$in}) GROUP BY id_user";
            $this->execute($sql, $params);
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perUser');
    }

    public function perTrunk()
    {
        if (!$this->affectedTrunkIds) {
            return;
        }
        $params = [];
        $in = $this->inClause(array_keys($this->affectedTrunkIds), 'trunk', $params);
        $tx = Yii::app()->db->beginTransaction();
        try {
            $this->execute("DELETE FROM pkg_cdr_summary_trunk WHERE id_trunk IN ({$in})", $params);
            $sql = "INSERT INTO pkg_cdr_summary_trunk
                        (id_trunk, sessiontime, aloc_all_calls, nbcall, nbcall_fail,
                         buycost, sessionbill, lucro, asr)
                    SELECT id_trunk, SUM(sessiontime), SUM(sessiontime) / NULLIF(SUM(nbcall), 0),
                           SUM(nbcall), SUM(nbcall_fail), SUM(buycost), SUM(sessionbill),
                           SUM(sessionbill) - SUM(buycost),
                           SUM(nbcall) / NULLIF(SUM(nbcall) + SUM(nbcall_fail), 0) * 100
                    FROM pkg_cdr_summary_day_trunk WHERE id_trunk IN ({$in}) GROUP BY id_trunk";
            $this->execute($sql, $params);
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perTrunk');
    }

    public function perMonthDid()
    {
        $checkpoint = $this->getCheckpoint(self::MONTH_DID);
        $maxCdrId = $this->maxId('pkg_cdr');
        $firstDay = date('Y-m-01', strtotime($this->day));
        $nextMonth = date('Y-m-01', strtotime($firstDay . ' +1 month'));
        $month = date('Ym', strtotime($this->day));
        if ($this->isBackfill || $checkpoint === false) {
            $this->rebuildMonthDid($month, $firstDay, $nextMonth, $maxCdrId);
            if (!$this->isBackfill) {
                $this->saveCheckpoint(self::MONTH_DID, $maxCdrId, 0);
            }
            $this->log('perMonthDid bootstrap');
            return;
        }
        $tx = Yii::app()->db->beginTransaction();
        try {
            $checkpoint = $this->getCheckpoint(self::MONTH_DID, true);
            $maxCdrId = $this->maxId('pkg_cdr');
            $lastCdrId = (int) $checkpoint['cdr_id'];
            if ($maxCdrId > $lastCdrId) {
                $sql = "INSERT INTO pkg_cdr_summary_month_did
                            (month, id_did, sessiontime, aloc_all_calls, nbcall, sessionbill)
                        SELECT DATE_FORMAT(c.starttime, '%Y%m'), d.id,
                               COALESCE(SUM(c.sessiontime), 0),
                               COALESCE(SUM(c.sessiontime), 0) / COUNT(*), COUNT(*),
                               COALESCE(SUM(c.sessionbill), 0)
                        FROM pkg_cdr c INNER JOIN pkg_did d ON d.did = c.calledstation
                        WHERE c.id > :last_id AND c.id <= :max_id
                          AND c.sipiax IN (2,3) AND d.activated = 1 AND d.reserved = 1
                        GROUP BY DATE_FORMAT(c.starttime, '%Y%m'), d.id
                        ON DUPLICATE KEY UPDATE
                            aloc_all_calls = (sessiontime + VALUES(sessiontime)) /
                                NULLIF(nbcall + VALUES(nbcall), 0),
                            sessiontime = sessiontime + VALUES(sessiontime),
                            nbcall = nbcall + VALUES(nbcall),
                            sessionbill = sessionbill + VALUES(sessionbill)";
                $this->execute($sql, [':last_id' => $lastCdrId, ':max_id' => $maxCdrId]);
                $this->saveCheckpoint(self::MONTH_DID, $maxCdrId, 0);
            }
            $tx->commit();
        } catch (Exception $e) {
            $this->rollback($tx);
            throw $e;
        }
        $this->log('perMonthDid incremental');
    }

    private function upsertDayUser($lastCdr, $maxCdr, $lastFailed, $maxFailed, $first = null, $next = null)
    {
        $date = $first === null ? '' : ' AND t.starttime >= :first AND t.starttime < :next';
        if ($maxCdr > $lastCdr) {
            $params = [':last' => $lastCdr, ':max' => $maxCdr];
            if ($first !== null) { $params[':first'] = $first; $params[':next'] = $next; }
            $sql = "INSERT INTO pkg_cdr_summary_day_user
                        (day,id_user,sessiontime,aloc_all_calls,nbcall,buycost,sessionbill,agent_bill)
                    SELECT DATE(t.starttime),t.id_user,COALESCE(SUM(t.sessiontime),0),
                           COALESCE(SUM(t.sessiontime),0)/COUNT(*),COUNT(*),
                           COALESCE(SUM(t.buycost),0),COALESCE(SUM(t.sessionbill),0),
                           COALESCE(SUM(t.agent_bill),0)
                    FROM pkg_cdr t WHERE t.id>:last AND t.id<=:max AND t.id_user>0 {$date}
                    GROUP BY DATE(t.starttime),t.id_user
                    ON DUPLICATE KEY UPDATE
                        aloc_all_calls=(sessiontime+VALUES(sessiontime))/NULLIF(nbcall+VALUES(nbcall),0),
                        sessiontime=sessiontime+VALUES(sessiontime),nbcall=nbcall+VALUES(nbcall),
                        buycost=buycost+VALUES(buycost),sessionbill=sessionbill+VALUES(sessionbill),
                        agent_bill=agent_bill+VALUES(agent_bill)";
            $this->execute($sql, $params);
        }
        if ($maxFailed > $lastFailed) {
            $params = [':last' => $lastFailed, ':max' => $maxFailed];
            if ($first !== null) { $params[':first'] = $first; $params[':next'] = $next; }
            $sql = "INSERT INTO pkg_cdr_summary_day_user
                        (day,id_user,sessiontime,aloc_all_calls,nbcall,nbcall_fail,buycost,sessionbill,agent_bill)
                    SELECT DATE(t.starttime),t.id_user,0,0,0,COUNT(*),0,0,0
                    FROM pkg_cdr_failed t WHERE t.id>:last AND t.id<=:max AND t.id_user>0 {$date}
                    GROUP BY DATE(t.starttime),t.id_user
                    ON DUPLICATE KEY UPDATE nbcall_fail=nbcall_fail+VALUES(nbcall_fail)";
            $this->execute($sql, $params);
        }
    }

    private function upsertDayTrunk($lastCdr, $maxCdr, $lastFailed, $maxFailed, $first = null, $next = null)
    {
        $date = $first === null ? '' : ' AND t.starttime >= :first AND t.starttime < :next';
        if ($maxCdr > $lastCdr) {
            $params = [':last' => $lastCdr, ':max' => $maxCdr];
            if ($first !== null) { $params[':first'] = $first; $params[':next'] = $next; }
            $sql = "INSERT INTO pkg_cdr_summary_day_trunk
                        (day,id_trunk,sessiontime,aloc_all_calls,nbcall,buycost,sessionbill)
                    SELECT DATE(t.starttime),t.id_trunk,COALESCE(SUM(t.real_sessiontime),0),
                           COALESCE(SUM(t.sessiontime),0)/COUNT(*),COUNT(*),
                           COALESCE(SUM(t.buycost),0),COALESCE(SUM(t.sessionbill),0)
                    FROM pkg_cdr t WHERE t.id>:last AND t.id<=:max AND t.id_trunk>0 {$date}
                    GROUP BY DATE(t.starttime),t.id_trunk
                    ON DUPLICATE KEY UPDATE
                        aloc_all_calls=(aloc_all_calls*nbcall+VALUES(aloc_all_calls)*VALUES(nbcall))
                            /NULLIF(nbcall+VALUES(nbcall),0),
                        sessiontime=sessiontime+VALUES(sessiontime),nbcall=nbcall+VALUES(nbcall),
                        buycost=buycost+VALUES(buycost),sessionbill=sessionbill+VALUES(sessionbill)";
            $this->execute($sql, $params);
        }
        if ($maxFailed > $lastFailed) {
            $params = [':last' => $lastFailed, ':max' => $maxFailed];
            if ($first !== null) { $params[':first'] = $first; $params[':next'] = $next; }
            $sql = "INSERT INTO pkg_cdr_summary_day_trunk
                        (day,id_trunk,sessiontime,aloc_all_calls,nbcall,nbcall_fail,buycost,sessionbill)
                    SELECT DATE(t.starttime),t.id_trunk,0,0,0,COUNT(*),0,0
                    FROM pkg_cdr_failed t WHERE t.id>:last AND t.id<=:max AND t.id_trunk>0 {$date}
                    GROUP BY DATE(t.starttime),t.id_trunk
                    ON DUPLICATE KEY UPDATE nbcall_fail=nbcall_fail+VALUES(nbcall_fail)";
            $this->execute($sql, $params);
        }
    }

    private function upsertDayAgent($last, $max, $first = null, $next = null)
    {
        if ($max <= $last) { return; }
        $date = $first === null ? '' : ' AND t.starttime >= :first AND t.starttime < :next';
        $params = [':last' => $last, ':max' => $max];
        if ($first !== null) { $params[':first'] = $first; $params[':next'] = $next; }
        $sql = "INSERT INTO pkg_cdr_summary_day_agent
                    (day,id_user,sessiontime,aloc_all_calls,nbcall,buycost,sessionbill,agent_bill)
                SELECT DATE(t.starttime),u.id_user,COALESCE(SUM(t.sessiontime),0),
                       COALESCE(SUM(t.sessiontime),0)/COUNT(*),COUNT(*),
                       COALESCE(SUM(t.buycost),0),COALESCE(SUM(t.sessionbill),0),
                       COALESCE(SUM(t.agent_bill),0)
                FROM pkg_cdr t INNER JOIN pkg_user u ON u.id=t.id_user
                WHERE t.id>:last AND t.id<=:max AND u.id_user>1 {$date}
                GROUP BY DATE(t.starttime),u.id_user
                ON DUPLICATE KEY UPDATE
                    aloc_all_calls=(sessiontime+VALUES(sessiontime))/NULLIF(nbcall+VALUES(nbcall),0),
                    sessiontime=sessiontime+VALUES(sessiontime),nbcall=nbcall+VALUES(nbcall),
                    buycost=buycost+VALUES(buycost),sessionbill=sessionbill+VALUES(sessionbill),
                    agent_bill=agent_bill+VALUES(agent_bill)";
        $this->execute($sql, $params);
    }

    private function finalizeDayUser($days)
    {
        foreach ($days as $day) {
            $sql = "UPDATE pkg_cdr_summary_day_user t LEFT JOIN pkg_user u ON u.id=t.id_user
                    SET t.isAgent=IF(COALESCE(u.id_user,0)>1,1,0),
                        t.aloc_all_calls=IF(t.nbcall>0,t.sessiontime/t.nbcall,0),
                        t.asr=IF(t.nbcall+t.nbcall_fail>0,t.nbcall/(t.nbcall+t.nbcall_fail)*100,0),
                        t.lucro=IF(COALESCE(u.id_user,0)>1,
                                   t.agent_bill-t.sessionbill,t.sessionbill-t.buycost)
                    WHERE t.day=:day";
            $this->execute($sql, [':day' => $day]);
        }
    }

    private function finalizeDayTrunk($days)
    {
        foreach ($days as $day) {
            $this->execute("UPDATE pkg_cdr_summary_day_trunk
                            SET asr=IF(nbcall+nbcall_fail>0,nbcall/(nbcall+nbcall_fail)*100,0),
                                lucro=sessionbill-buycost WHERE day=:day", [':day' => $day]);
        }
    }

    private function finalizeDayAgent($days)
    {
        foreach ($days as $day) {
            $this->execute("UPDATE pkg_cdr_summary_day_agent
                            SET aloc_all_calls=IF(nbcall>0,sessiontime/nbcall,0),
                                lucro=sessionbill-buycost,agent_lucro=agent_bill-sessionbill
                            WHERE day=:day", [':day' => $day]);
        }
    }

    private function rebuildMonthDid($month, $firstDay, $nextMonth, $maxCdrId)
    {
        $this->execute('DELETE FROM pkg_cdr_summary_month_did_stage WHERE month=:month', [':month' => $month]);
        $lastDidId = 0;
        do {
            $didIds = Yii::app()->db->createCommand(
                'SELECT id FROM pkg_did WHERE activated=1 AND reserved=1 AND id>:last ORDER BY id LIMIT 250'
            )->queryColumn([':last' => $lastDidId]);
            if (!$didIds) { break; }
            $maxDidId = (int) end($didIds);
            $sql = "INSERT INTO pkg_cdr_summary_month_did_stage
                        (month,id_did,sessiontime,aloc_all_calls,nbcall,sessionbill)
                    SELECT :month,d.id,COALESCE(SUM(c.sessiontime),0),
                           COALESCE(SUM(c.sessiontime),0)/COUNT(*),COUNT(*),
                           COALESCE(SUM(c.sessionbill),0)
                    FROM pkg_did d INNER JOIN pkg_cdr c ON c.calledstation=d.did
                    WHERE d.activated=1 AND d.reserved=1 AND d.id>:last_did AND d.id<=:max_did
                      AND c.starttime>=:first_day AND c.starttime<:next_month
                      AND c.id<=:max_cdr AND c.sipiax IN(2,3) GROUP BY d.id";
            $this->execute($sql, [':month'=>$month, ':last_did'=>$lastDidId, ':max_did'=>$maxDidId,
                ':first_day'=>$firstDay, ':next_month'=>$nextMonth, ':max_cdr'=>$maxCdrId]);
            $lastDidId = $maxDidId;
        } while (count($didIds) === 250);
        $tx = Yii::app()->db->beginTransaction();
        try {
            $this->execute('DELETE FROM pkg_cdr_summary_month_did WHERE month=:month', [':month'=>$month]);
            $this->execute("INSERT INTO pkg_cdr_summary_month_did
                (month,id_did,sessiontime,aloc_all_calls,nbcall,sessionbill)
                SELECT month,id_did,sessiontime,aloc_all_calls,nbcall,sessionbill
                FROM pkg_cdr_summary_month_did_stage WHERE month=:month", [':month'=>$month]);
            $tx->commit();
        } catch (Exception $e) { $this->rollback($tx); throw $e; }
    }

    private function getCheckpoint($name, $lock = false)
    {
        $sql = 'SELECT cdr_id,cdr_falide_id FROM pkg_cdr_summary_ids WHERE summary_name=:name'
            . ($lock ? ' FOR UPDATE' : '');
        return Yii::app()->db->createCommand($sql)->queryRow(true, [':name'=>$name]);
    }

    private function saveCheckpoint($name, $cdrId, $failedId)
    {
        $sql = "INSERT INTO pkg_cdr_summary_ids
                    (summary_name,day,cdr_id,cdr_falide_id,updated_at)
                VALUES (:name,:day,:cdr,:failed,NOW())
                ON DUPLICATE KEY UPDATE day=VALUES(day),cdr_id=VALUES(cdr_id),
                    cdr_falide_id=VALUES(cdr_falide_id),updated_at=NOW()";
        $this->execute($sql, [':name'=>$name, ':day'=>$this->day, ':cdr'=>$cdrId, ':failed'=>$failedId]);
    }

    private function maxId($table)
    {
        if (!in_array($table, ['pkg_cdr','pkg_cdr_failed'], true)) {
            throw new InvalidArgumentException('Unsupported CDR source table');
        }
        return (int) Yii::app()->db->createCommand("SELECT COALESCE(MAX(id),0) FROM {$table}")->queryScalar();
    }

    private function collectSourceDays($table, $lastId, $maxId)
    {
        if ($maxId <= $lastId) { return; }
        if (!in_array($table, ['pkg_cdr','pkg_cdr_failed'], true)) {
            throw new InvalidArgumentException('Unsupported CDR source table');
        }
        $days = Yii::app()->db->createCommand(
            "SELECT DISTINCT DATE(starttime) FROM {$table} WHERE id>:last AND id<=:max"
        )->queryColumn([':last'=>$lastId, ':max'=>$maxId]);
        foreach ($days as $day) { $this->addAffectedDay($day); }
    }

    private function collectExistingIds($table, $column, $day, $type)
    {
        $allowed = [self::DAY_USER.'.id_user'=>'user', self::DAY_TRUNK.'.id_trunk'=>'trunk'];
        if (!isset($allowed[$table.'.'.$column]) || $allowed[$table.'.'.$column] !== $type) {
            throw new InvalidArgumentException('Unsupported summary dimension');
        }
        $ids = Yii::app()->db->createCommand(
            "SELECT {$column} FROM {$table} WHERE day=:day"
        )->queryColumn([':day'=>$day]);
        foreach ($ids as $id) {
            if ($type === 'user') { $this->affectedUserIds[(int)$id] = true; }
            else { $this->affectedTrunkIds[(int)$id] = true; }
        }
    }

    private function collectAffectedDimensions()
    {
        foreach (array_keys($this->affectedDays) as $day) {
            $users = Yii::app()->db->createCommand(
                'SELECT id_user FROM pkg_cdr_summary_day_user WHERE day=:day'
            )->queryColumn([':day'=>$day]);
            foreach ($users as $id) { $this->affectedUserIds[(int)$id] = true; }
            $trunks = Yii::app()->db->createCommand(
                'SELECT id_trunk FROM pkg_cdr_summary_day_trunk WHERE day=:day'
            )->queryColumn([':day'=>$day]);
            foreach ($trunks as $id) { $this->affectedTrunkIds[(int)$id] = true; }
        }
    }

    private function affectedMonths()
    {
        $months = [];
        foreach (array_keys($this->affectedDays) as $day) {
            $first = date('Y-m-01', strtotime($day));
            $months[date('Ym', strtotime($day))] = [$first, date('Y-m-01', strtotime($first.' +1 month'))];
        }
        return $months;
    }

    private function addAffectedDay($day)
    {
        if ($this->validateDate($day)) { $this->affectedDays[$day] = true; }
    }

    private function deleteDay($table, $day)
    {
        $allowed = ['pkg_cdr_summary_day', self::DAY_USER, self::DAY_TRUNK, self::DAY_AGENT];
        if (!in_array($table, $allowed, true)) { throw new InvalidArgumentException('Unsupported daily table'); }
        $this->execute("DELETE FROM {$table} WHERE day=:day", [':day'=>$day]);
    }

    private function nextDay($day) { return date('Y-m-d', strtotime($day.' +1 day')); }

    private function inClause($values, $prefix, &$params)
    {
        $result = [];
        foreach (array_values($values) as $index=>$value) {
            $key = ':'.$prefix.$index;
            $result[] = $key;
            $params[$key] = (int)$value;
        }
        return implode(',', $result);
    }

    private function execute($sql, $params = [])
    {
        return Yii::app()->db->createCommand($sql)->execute($params);
    }

    private function rollback($tx)
    {
        if ($tx !== null && $tx->active) { $tx->rollback(); }
    }

    private function log($name) { echo $name.' '.date('H:i:s')."\n"; }

    public function validateDate($date, $format = 'Y-m-d')
    {
        $parsed = DateTime::createFromFormat($format, $date);
        return $parsed && $parsed->format($format) === $date;
    }
}
