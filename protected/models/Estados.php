<?php
/**
 * Model to table "Company".
 *
 */

class Estados extends Model
{
    protected $_module = 'user';
    /**
     * Return the static class of model.
     * @return User classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     * @return name of table.
     */
    public function tableName()
    {
        return 'pkg_estados';
    }

    /**
     * @return name of primary key(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     * @return array validation of fields of model.
     */
    public function rules()
    {
        $rules = array(
            array('name,sigla', 'required'),
        );
        return $this->getExtraField($rules);
    }
}
