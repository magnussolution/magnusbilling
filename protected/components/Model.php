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

class Model extends CActiveRecord
{

    public function validateAsteriskConfigValue($attribute, $params)
    {
        try {
            AsteriskConfigValue::assertSingleLine($this->{$attribute}, $attribute);
        } catch (InvalidArgumentException $e) {
            $this->addError(
                $attribute,
                Yii::t('zii', 'The field contains invalid control characters.')
            );
        }
    }

    public function getModule()
    {
        return $this->_module;
    }

    public function getExtraField($rules)
    {
        if (isset($_SESSION['module_extra'][$this->getModule()])) {

            foreach ($_SESSION['module_extra'][$this->getModule()] as $key => $value) {
                $rules[] = [$value, 'length', 'max' => 500];
            }
        }
        return $rules;
    }

    public function uniquePeerName($attribute, $params)
    {

        if (isset($this->name)) {
            $trunkExists = Trunk::model()->exists(
                'trunkcode = :key OR (providertech = :tech AND LOWER(TRIM(host)) = :host AND user = :username)',
                [':key' => $this->name, ':username' => $this->name, ':tech' => 'pjsip', ':host' => 'dynamic']
            );
            if ($trunkExists) {
                $this->addError($attribute, Yii::t('zii', 'This username is in use by a trunk'));
            }
        } else if (isset($this->trunkcode)) {
            if ($attribute == 'user'
                && ($this->providertech != 'pjsip' || strtolower(trim((string) $this->host)) !== 'dynamic')
            ) {
                return;
            }
            $name = $attribute == 'user' ? $this->user : $this->trunkcode;
            if (! strlen((string) $name)) {
                return;
            }
            if (Sip::model()->exists('name = :key', [':key' => $name])) {
                $this->addError($attribute, Yii::t('zii', 'This trunk name is in use by a SIP user'));
            }
            if (Trunk::model()->exists(
                'id <> :id AND (trunkcode = :key OR (providertech = :tech AND LOWER(TRIM(host)) = :host AND user = :username))',
                [':id' => (int) $this->id, ':key' => $name, ':username' => $name, ':tech' => 'pjsip', ':host' => 'dynamic']
            )) {
                $this->addError($attribute, Yii::t('zii', 'This username is in use by a trunk'));
            }
        }

    }

    public function generateRules($rules = [])
    {
        $table = [$this->getTableSchema($this->tableName())];

        $required  = [];
        $integers  = [];
        $numerical = [];
        $length    = [];
        $safe      = [];

        foreach ($table[0]->columns as $column) {

            if ($column->autoIncrement) {
                continue;
            }

            $r =  ! $column->allowNull && $column->defaultValue === null;
            if ($r) {
                $required[] = $column->name;
            }

            if ($column->type === 'integer') {
                $integers[] = $column->name;
            } elseif ($column->type === 'double') {
                $numerical[] = $column->name;
            } elseif ($column->type === 'string' && $column->size > 0) {
                $length[$column->size][] = $column->name;
            } elseif ( ! $column->isPrimaryKey && ! $r) {
                $safe[] = $column->name;
            }

        }
        if ($required !== []) {

            $rules[] = [implode(', ', $required), 'required'];
        }

        if ($integers !== []) {
            $rules[] = [implode(', ', $integers), 'numerical', 'integerOnly' => true];
        }

        if ($numerical !== []) {
            $rules[] = [implode(', ', $numerical), 'numerical'];
        }

        if ($length !== []) {
            foreach ($length as $len => $cols) {
                $rules[] = [implode(', ', $cols), 'length', 'max' => $len];
            }

        }
        if ($safe !== []) {
            $rules[] = [implode(', ', $safe), 'safe'];
        }

        return $this->getExtraField($rules);
    }
}
