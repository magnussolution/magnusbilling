<?php

/**
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
 *
 */
class DidCheckCommand extends ConsoleCommand
{
    public function run($args)
    {
        $modelDidUse = DidUse::model()->findAll(
            [
                'condition' => '(releasedate IS NULL OR releasedate < :key) AND status = 1',
                'with'      => [
                    'idDid' => [
                        'condition' => "idDid.billingtype <> 3 AND idDid.fixrate > 0",
                    ],
                ],
                'params'    => [
                    ':key' => '1984-01-01 00:00:00',
                ],
            ]
        );

        if (! isset($modelDidUse[0])) {
            exit($this->debug >= 3 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " NO DID IN USE ") : null);
            exit;
        }

        $daytopay = $this->config['global']['service_daytopay'];
        $oneday   = 60 * 60 * 24;

        foreach ($modelDidUse as $didUse) {

            if (! isset($didUse->idUser->id)) {
                continue;
            }

            $id_agent = $didUse->idUser->id_user;

            $day_remaining = 0;

            $next_due_date  = date('Y-m-d', strtotime("+" . $didUse->month_payed . " months", strtotime($didUse->reservationdate)));
            $date1          = new DateTime($next_due_date);
            $date2          = new DateTime(date('Y-m-d'));
            $interval       = $date1->diff($date2);
            $days_remaining = $interval->days;

            $diff_reservation_daytopay = (strtotime($didUse->reservationdate)) - (intval($daytopay) * $oneday);
            $timestamp_datetopay       = mktime(
                date('H', $diff_reservation_daytopay),
                date("i", $diff_reservation_daytopay),
                date("s", $diff_reservation_daytopay),
                date("m", $diff_reservation_daytopay) + $didUse->month_payed,
                date("d", $diff_reservation_daytopay),
                date("Y", $diff_reservation_daytopay)
            );

            $day_remaining = time() - $timestamp_datetopay;

            $log = $this->debug >= 3 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " DAYS TO PAY " . $daytopay) : null;
            $log = $this->debug >= 3 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " NOW :" . time() . " - DATE FOR PAY= $timestamp_datetopay") : null;
            $log = $this->debug >= 3 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " day_remaining=$day_remaining <=" . (intval($daytopay) * $oneday)) : null;
            $log = $this->debug >= 3 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " IN DAYS FOR PAY = $day_remaining ") : null;

            if ($day_remaining >= 0) {

                if ($id_agent > 1) {
                    $modelAgent  = User::model()->findByPk((int) $id_agent);
                    $user_credit = $modelAgent->typepaid == 1 ? $modelAgent->credit + $modelAgent->creditlimit : $modelAgent->credit;
                } else {
                    $user_credit = $didUse->idUser->typepaid == 1 ? $didUse->idUser->credit + $didUse->idUser->creditlimit : $didUse->idUser->credit;
                }

                if ($day_remaining <= (intval($daytopay) * $oneday)) {
                    $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " USER " . $didUse->idUser->username . " HAVE TO PAY THE DID " . $didUse->idDid->did . " NOW ") : null;

                    if ($user_credit >= $didUse->idDid->fixrate) {
                        if ($this->config['global']['charge_did_services_before_due_date'] == 1) {
                            if ($id_agent <= 1) {
                                $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " USER " . $didUse->idUser->username . " HAVE ENOUGH CREDIT TO PAY FOR THE DID " . $didUse->idDid->did) : null;

                                $didUse->month_payed++;
                                $didUse->save();

                                $description = Yii::t('zii', 'Monthly payment DID') . ' ' . $didUse->idDid->did;
                                UserCreditManager::releaseUserCredit($didUse->id_user, $didUse->idDid->fixrate, $description, 0);

                                $mail = new Mail(Mail::$TYPE_DID_PAID, $didUse->id_user);
                                $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $didUse->idUser->credit - $didUse->idDid->fixrate);
                                $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $didUse->idDid->did);
                                $mail->replaceInEmail(Mail::$DID_COST_KEY, -$didUse->idDid->fixrate);
                                if ($didUse->idUser->email_did == 1) {
                                    $mail->send();
                                }
                                if ($this->config['global']['admin_received_email'] == 1) {
                                    $mail->send($this->config['global']['admin_email']);
                                }
                            } else {
                                $description = Yii::t('zii', 'Monthly payment DID') . ' ' . $didUse->idDid->did;

                                $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " AGENT '" . $modelAgent->username . "' HAVE ENOUGH CREDIT TO PAY FOR THE DID " . $didUse->idDid->did) : null;

                                $didUse->month_payed++;
                                $didUse->save();

                                //adiciona a recarga e pagamento
                                $modelRefill              = new Refill();
                                $modelRefill->id_user     = $id_agent;
                                $modelRefill->credit      = $didUse->idDid->fixrate;
                                $modelRefill->description = $description;
                                $modelRefill->payment     = 1;
                                $modelRefill->save();

                                $mail = new Mail(Mail::$TYPE_DID_PAID, $didUse->id_user, $id_agent);
                                $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $didUse->idUser->credit - $didUse->idDid->fixrate);
                                $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $didUse->idDid->did);
                                $mail->replaceInEmail(Mail::$DID_COST_KEY, -$didUse->idDid->fixrate);
                                if ($didUse->idUser->email_did == 1) {
                                    $mail->send();
                                }
                                if ($this->config['global']['admin_received_email'] == 1) {
                                    $mail->send($this->config['global']['admin_email']);
                                }
                            }
                        } else {
                            //just notify the client about the due date
                            if ($id_agent > 1) {
                                $mail = new Mail(Mail::$TYPE_DID_UNPAID, $didUse->id_user, $id_agent);
                            } else {
                                $mail = new Mail(Mail::$TYPE_DID_UNPAID, $didUse->id_user);
                            }

                            $mail->replaceInEmail(Mail::$DAY_REMAINING_KEY, $days_remaining);
                            $mail->replaceInEmail(Mail::$NEXT_DUE_DATE, $next_due_date);
                            $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $didUse->idDid->did);
                            $mail->replaceInEmail(Mail::$DID_COST_KEY, $didUse->idDid->fixrate);
                            $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, number_format($didUse->idUser->credit, 2));
                            if ($didUse->idUser->email_did == 1) {
                                $mail->send();
                            }
                        }
                    } else {
                        $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " USER " . $didUse->idUser->username . " DONT HAVE ENOUGH CREDIT TO PAY FOR THE DID " . $didUse->idDid->did . " NOTIFY NOW ") : null;

                        if ($id_agent > 1) {
                            $mail = new Mail(Mail::$TYPE_DID_UNPAID, $didUse->id_user, $id_agent);
                        } else {
                            $mail = new Mail(Mail::$TYPE_DID_UNPAID, $didUse->id_user);
                        }

                        $mail->replaceInEmail(Mail::$DAY_REMAINING_KEY, $days_remaining);
                        $mail->replaceInEmail(Mail::$NEXT_DUE_DATE, $next_due_date);
                        $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $didUse->idDid->did);
                        $mail->replaceInEmail(Mail::$DID_COST_KEY, $didUse->idDid->fixrate);
                        $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, number_format($didUse->idUser->credit, 2));
                        if ($didUse->idUser->email_did == 1) {
                            $mail->send();
                        }

                        if ($this->config['global']['admin_received_email'] == 1) {
                            $mail->send($this->config['global']['admin_email']);
                        }
                    }
                } else {
                    if ($user_credit >= $didUse->idDid->fixrate) {
                        $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " USER " . $didUse->idUser->username . " HAVE ENOUGH CREDIT TO PAY FOR THE DID " . $didUse->idDid->did) : null;

                        if ($id_agent <= 1) {
                            $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " USER " . $didUse->idUser->username . " HAVE ENOUGH CREDIT TO PAY FOR THE DID " . $didUse->idDid->did) : null;

                            $didUse->month_payed++;
                            $didUse->save();

                            $description = Yii::t('zii', 'Monthly payment DID') . ' ' . $didUse->idDid->did;
                            UserCreditManager::releaseUserCredit($didUse->id_user, $didUse->idDid->fixrate, $description, 0);

                            $mail = new Mail(Mail::$TYPE_DID_PAID, $didUse->id_user);
                            $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $didUse->idUser->credit - $didUse->idDid->fixrate);
                            $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $didUse->idDid->did);
                            $mail->replaceInEmail(Mail::$DID_COST_KEY, -$didUse->idDid->fixrate);
                            if ($didUse->idUser->email_did == 1) {
                                $mail->send();
                            }
                            if ($this->config['global']['admin_received_email'] == 1) {
                                $mail->send($this->config['global']['admin_email']);
                            }
                        } else {
                            $description = Yii::t('zii', 'Monthly payment DID') . ' ' . $didUse->idDid->did;

                            $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " AGENT '" . $modelAgent->username . "' HAVE ENOUGH CREDIT TO PAY FOR THE DID " . $didUse->idDid->did) : null;

                            $didUse->month_payed++;
                            $didUse->save();

                            //adiciona a recarga e pagamento
                            $modelRefill              = new Refill();
                            $modelRefill->id_user     = $id_agent;
                            $modelRefill->credit      = $didUse->idDid->fixrate;
                            $modelRefill->description = $description;
                            $modelRefill->payment     = 1;
                            $modelRefill->save();

                            $mail = new Mail(Mail::$TYPE_DID_PAID, $didUse->id_user, $id_agent);
                            $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $didUse->idUser->credit - $didUse->idDid->fixrate);
                            $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $didUse->idDid->did);
                            $mail->replaceInEmail(Mail::$DID_COST_KEY, -$didUse->idDid->fixrate);
                            if ($didUse->idUser->email_did == 1) {
                                $mail->send();
                            }
                            if ($this->config['global']['admin_received_email'] == 1) {
                                $mail->send($this->config['global']['admin_email']);
                            }
                        }
                    } else {
                        $log                 = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " RELEASE THE DID  " . $didUse->idDid->did . " ON THE USER  " . $didUse->idUser->username . " ") : null;
                        $didUse->releasedate = date('Y-m-d H:i:s');
                        $didUse->status      = 0;
                        $didUse->save();

                        $modelDid           = Did::model()->findByPk((int) $didUse->id_did);
                        $modelDid->reserved = 0;
                        $modelDid->id_user  = null;
                        $modelDid->save();

                        Diddestination::model()->deleteAll('id_did = :key', [':key' => $didUse->id_did]);

                        $modelDidHistory                  = new DidHistory();
                        $modelDidHistory->username        = $didUse->idUser->username;
                        $modelDidHistory->did             = $didUse->idDid->did;
                        $modelDidHistory->releasedate     = date('Y-m-d H:i:s');
                        $modelDidHistory->reservationdate = $didUse->reservationdate;
                        $modelDidHistory->month_payed     = $didUse->month_payed;
                        $modelDidHistory->description     = $didUse->idDid->description;
                        try {
                            $modelDidHistory->save();
                        } catch (Exception $e) {
                        }

                        if ($id_agent > 1) {
                            $mail = new Mail(Mail::$TYPE_DID_RELEASED, $didUse->id_user, $id_agent);
                        } else {
                            $mail = new Mail(Mail::$TYPE_DID_RELEASED, $didUse->id_user);
                        }

                        $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $didUse->idDid->did);
                        $mail->replaceInEmail(Mail::$DID_COST_KEY, $didUse->idDid->fixrate);
                        $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $didUse->idUser->credit);
                        if ($didUse->idUser->email_did == 1) {
                            $mail->send();
                        }
                        if ($this->config['global']['admin_received_email'] == 1) {
                            $mail->send($this->config['global']['admin_email']);
                        }
                    }
                }
            } else {
                $log = $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " NOT DIDS FOR PAY TODAY ") : null;
            }
        }
    }
} {
}
