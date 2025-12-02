<?php
/**
 * Modelo para a tabela "Call".
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Todos os direitos reservados.
 * ###################################
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/09/2012
 */

class Servers extends Model
{
    protected $_module = 'servers';
    /**
     * Retorna a classe estatica da model.
     *
     * @return Prefix classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     *
     *
     * @return nome da tabela.
     */
    public function tableName()
    {
        return 'pkg_servers';
    }

    /**
     *
     *
     * @return nome da(s) chave(s) primaria(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     *
     *
     * @return array validacao dos campos da model.
     */
    public function rules()
    {
        $rules = [
            ['host', 'required'],
            ['status, weight, last_call_id', 'numerical', 'integerOnly' => true],
            ['host,name', 'length', 'max' => 100],
            ['description', 'length', 'max' => 500],
            ['password, username, last_call', 'length', 'max' => 50],
            ['type, port, sip_port', 'length', 'max' => 20],
            ['public_ip', 'length', 'max' => 80],
            ['password', 'checkpassword'],
        ];
        return $this->getExtraField($rules);
    }

    public function checkpassword($attribute)
    {

        $modelUser = User::model()->find("password = :password", [':password' => $this->password]);
        if (is_array($modelUser) && count($modelUser)) {
            $this->addError($attribute, Yii::t('zii', 'This password in in use'));
        }
    }

    public function getAllAsteriskServers()
    {

        $resultServers[0] = [
            'host'     => 'localhost',
            'username' => 'magnus',
            'password' => 'magnussolution',
        ];

        if ($resultServers[0]['host'] == 'localhost' && file_exists('/etc/asterisk/asterisk2.conf')) {
            $configFile               = '/etc/asterisk/asterisk2.conf';
            $array                    = parse_ini_file($configFile);
            $resultServers[0]['host'] = $array['host'];
        }

        $modelServers = Servers::model()->findAll('type = :key AND status = :key1 AND host != :key2',
            [
                ':key'  => 'asterisk',
                ':key1' => 1,
                ':key2' => 'localhost',
            ]);
        foreach ($modelServers as $key => $server) {
            array_push($resultServers, [
                'host'     => $server->host,
                'username' => $server->username,
                'password' => $server->password,
            ]);
        }
        return $resultServers;
    }
}
