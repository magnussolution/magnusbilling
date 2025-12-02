<?php
/**
 * Modelo para a tabela "Ivr".
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 24/09/2012
 */

class Ivr extends Model
{
    protected $_module = 'ivr';
    /**
     * Retorna a classe estatica da model.
     * @return Prefix classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     * @return nome da tabela.
     */
    public function tableName()
    {
        return 'pkg_ivr';
    }

    /**
     * @return nome da(s) chave(s) primaria(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     * @return array validacao dos campos da model.
     */
    public function rules()
    {
        $rules = [
            ['id_user, use_holidays,direct_extension', 'numerical', 'integerOnly' => true],
            ['monFriStart,  satStart,  sunStart', 'length', 'max' => 200],
            ['name, option_0, option_1, option_2, option_3, option_4, option_5, option_6, option_7, option_8, option_9, option_10', 'length', 'max' => 50],
            ['option_out_0, option_out_1, option_out_2, option_out_3, option_out_4, option_out_5, option_out_6, option_out_7, option_out_8, option_out_9, option_out_10', 'length', 'max' => 50],
            ['monFriStart,  satStart,  sunStart', 'checkInterval'],

        ];
        return $this->getExtraField($rules);
    }

    public function checkInterval($attribute, $params)
    {
        $intervals = explode('|', $this->{$attribute});
        foreach ($intervals as $key => $interval) {
            if ( ! preg_match('/-/', $interval)) {
                $this->addError($attribute, 'There is a interval with a invalid format, the allowed formatting is: 00:00-00:00. Use | for more than one interval.');
                return;
            }

            $hours = explode('-', $interval);
            foreach ($hours as $key => $hour) {
                if ( ! preg_match("/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/", $hour)) {
                    $this->addError($attribute, 'There is a interval with a invalid format, the allowed formatting is: 00:00-00:00. Use | for more than one interval.');
                }
            }

        }
    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idUser' => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }

}
