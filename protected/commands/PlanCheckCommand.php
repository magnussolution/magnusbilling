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
class PlanCheckCommand extends ConsoleCommand
{
    public function run($args)
    {
        $this->debug = 10;

        $modelOfferUse = OfferUse::model()->findAll([
            'condition' => '(releasedate IS NULL OR releasedate < :key) AND status = 1',
            'params'    => [
                ':key' => '1984-01-01 00:00:00',
            ],
        ]
        );

        if ( ! isset($modelOfferUse[0])) {
            if ($this->debug >= 1) {
                echo " NO PLAN IN USE ";
            }

            exit;
        }

        $daytopay = $this->config['global']['planbilling_daytopay'];
        $oneday   = 60 * 60 * 24;

        foreach ($modelOfferUse as $offerUse) {
            $day_remaining = 0;

            $diff_reservation_daytopay = (strtotime($offerUse->reservationdate)) - (intval($daytopay) * $oneday);
            $timestamp_datetopay       = mktime(date('H', $diff_reservation_daytopay), date("i", $diff_reservation_daytopay), date("s", $diff_reservation_daytopay),
                date("m", $diff_reservation_daytopay) + $offerUse->month_payed, date("d", $diff_reservation_daytopay), date("Y", $diff_reservation_daytopay));

            $day_remaining = time() - $timestamp_datetopay;

            if ($this->debug >= 3) {
                echo " DAYS TO PAY " . $daytopay;
            }

            if ($this->debug >= 3) {
                echo " NOW :" . time() . " - timestamp_datetopay=$timestamp_datetopay";
            }

            if ($this->debug >= 3) {
                echo " day_remaining=$day_remaining <=" . (intval($daytopay) * $oneday);
            }

            if ($day_remaining >= 0) {

                $user_credit = $offerUse->idUser->typepaid == 1 ? $offerUse->idUser->credit + $offerUse->idUser->creditlimit : $offerUse->idUser->credit;

                if ($day_remaining <= (intval($daytopay) * $oneday)) {
                    if ($this->debug >= 1) {
                        echo " USER " . $offerUse->idUser->username . " HAVE TO PAY THE PLAN NOW \n";
                    }

                    if ($user_credit >= $offerUse->idOffer->price) {
                        if ($this->debug >= 1) {
                            echo " USER " . $offerUse->idUser->username . " HAVE ENOUGH CREDIT TO PAY FOR THE PLAN \n";
                        }

                        $offerUse->month_payed++;
                        $offerUse->save();

                        //adiciona a recarga e pagamento
                        $refill              = new Refill;
                        $refill->id_user     = $offerUse->idUser->id;
                        $refill->credit      = $offerUse->idOffer->price * -1;
                        $refill->description = Yii::t('zii', 'Monthly payment Plan') . ' ' . $offerUse->idOffer->label;
                        $refill->payment     = 1;
                        $refill->save();

                        User::model()->updateByPk($offerUse->idUser->id,
                            [
                                'credit' => new CDbExpression('credit - ' . $offerUse->idOffer->price),
                            ]
                        );

                        $mail = new Mail(Mail::$TYPE_PLAN_PAID, $offerUse->idUser->id);
                        $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $offerUse->idUser->credit - $offerUse->idOffer->price);
                        $mail->replaceInEmail(Mail::$PLAN_LABEL, $offerUse->idOffer->label);
                        $mail->replaceInEmail(Mail::$PLAN_COST, -round($offerUse->idOffer->price, 2));
                        $mail->send();
                        $sendAdmin = $this->config['global']['admin_received_email'] == 1 ? $mail->send($this->config['global']['admin_email']) : null;
                    } else {
                        if ($this->debug >= 1) {
                            echo " USER " . $offerUse->idUser->username . " DONT HAVE ENOUGH CREDIT TO PAY FOR THE PLAN NOTIFY NOW \n";
                        }

                        $mail = new Mail(Mail::$TYPE_PLAN_UNPAID, $offerUse->idUser->id);
                        $mail->replaceInEmail(Mail::$DAY_REMAINING_KEY, date("d", $day_remaining));
                        $mail->replaceInEmail(Mail::$PLAN_LABEL, $offerUse->idOffer->label);
                        $mail->replaceInEmail(Mail::$PLAN_COST, round($offerUse->idOffer->price, 2));
                        $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, number_format($offerUse->idUser->credit, 2));
                        $mail->replaceInEmail(Mail::$DAYS_TO_PAY, $daytopay);

                        $mail->send();
                        $sendAdmin = $this->config['global']['admin_received_email'] == 1 ? $mail->send($this->config['global']['admin_email']) : null;
                    }
                } else {
                    if ($user_credit >= $offerUse->idOffer->price) {
                        if ($this->debug >= 1) {
                            echo " USER " . $offerUse->idUser->username . " HAVE ENOUGH CREDIT TO PAY FOR THE PLAN \n";
                        }

                        $offerUse->month_payed++;
                        $offerUse->save();

                        //adiciona a recarga e pagamento
                        $refill              = new Refill;
                        $refill->id_user     = $offerUse->idUser->id;
                        $refill->credit      = $offerUse->idOffer->price * -1;
                        $refill->description = Yii::t('zii', 'Monthly payment Plan') . ' ' . $offerUse->idOffer->label;
                        $refill->payment     = 1;
                        $refill->save();

                        User::model()->updateByPk($offerUse->idUser->id,
                            [
                                'credit' => new CDbExpression('credit - ' . $offerUse->idOffer->price),
                            ]
                        );

                        $mail = new Mail(Mail::$TYPE_PLAN_PAID, $offerUse->idUser->id);
                        $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $offerUse->idUser->credit - $offerUse->idOffer->price);
                        $mail->replaceInEmail(Mail::$PLAN_LABEL, $offerUse->idOffer->label);
                        $mail->replaceInEmail(Mail::$PLAN_COST, -round($offerUse->idOffer->price, 2));
                        $mail->send();
                        $sendAdmin = $this->config['global']['admin_received_email'] == 1 ? $mail->send($this->config['global']['admin_email']) : null;
                    } else {
                        if ($this->debug >= 1) {
                            echo " RELEASE THE PLAN THE USER " . $offerUse->idUser->username . " ";
                        }

                        $offerUse->releasedate = date('Y-m-d H:i:s');
                        $offerUse->status      = 0;
                        $offerUse->save();
                        User::model()->updateByPk((int) $offerUse->idUser->id, ['id_offer' => 0]);

                        $mail = new Mail(Mail::$TYPE_PLAN_RELEASED, $offerUse->idUser->id);
                        $mail->replaceInEmail(Mail::$PLAN_LABEL, $offerUse->idOffer->label);
                        $mail->replaceInEmail(Mail::$PLAN_COST, round($offerUse->idOffer->price, 2));
                        $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $offerUse->idUser->credit);
                        $mail->send();
                        $sendAdmin = $this->config['global']['admin_received_email'] == 1 ? $mail->send($this->config['global']['admin_email']) : null;

                    }
                }
            } else {
                if ($this->debug >= 1) {
                    echo " NO PLAN FOR PAY \n";
                }

            }
        }
    }
}
