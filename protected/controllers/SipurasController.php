<?php
/**
 * Acoes do modulo "Prefix".
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
 * 01/08/2012
 */

class SipurasController extends Controller
{
    public $attributeOrder = 'fultmov DESC';
    public $extraValues    = ['idUser' => 'username'];

    public function init()
    {
        $this->instanceModel = new Sipuras;
        $this->abstractModel = Sipuras::model();
        $this->titleReport   = Yii::t('zii', 'ATA Linksys');
        parent::init();
    }

    public function beforeSave($values)
    {
        unset($values['provision_token_hash'], $values['provision_token_created_at']);
        return parent::beforeSave($values);
    }

    public function beforeUpdateAll($values, $ids)
    {
        unset($values['provision_token_hash'], $values['provision_token_created_at']);
        return parent::beforeUpdateAll($values, $ids);
    }

    public function setAttributesModels($attributes, $models)
    {
        foreach ($attributes as $key => $attribute) {
            unset($attributes[$key]['provision_token_hash']);
        }
        return parent::setAttributesModels($attributes, $models);
    }

    public function removeColumns($columns)
    {
        foreach ($columns as $key => $column) {
            $field = isset($column['dataIndex']) ? preg_replace('/^t\./', '', $column['dataIndex']) : '';
            if ($field === 'provision_token_hash') {
                unset($columns[$key]);
            }
        }
        return array_values($columns);
    }

    /**
     * Rotates the per-device secret and returns the new profile URL once.
     * The plaintext token is never persisted.
     */
    public function actionRotateProvisionToken()
    {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Content-Type: application/json; charset=UTF-8');

        if (! AtaProvisioningAuth::isSecureRequest($_SERVER)
            || ! isset($_SERVER['REQUEST_METHOD'])
            || $_SERVER['REQUEST_METHOD'] !== 'POST'
            || strtolower(isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] : '') !== 'xmlhttprequest'
        ) {
            $this->provisioningNotFound();
        }

        $this->checkActionAccess([], $this->instanceModel->getModule(), 'canUpdate');
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $modelSipuras = $id ? Sipuras::model()->findByPk($id) : null;

        if (! isset($modelSipuras->id) || ! $this->canManageProvisioningDevice($modelSipuras)) {
            $this->provisioningNotFound();
        }

        try {
            $token = AtaProvisioningAuth::generateToken();
            $profileRule = AtaProvisioningAuth::buildProfileRule(
                $this->config['global']['ip_servers'],
                $modelSipuras->macadr,
                $token
            );
            $modelSipuras->provision_token_hash = AtaProvisioningAuth::hashToken($token);
            $modelSipuras->provision_token_created_at = date('Y-m-d H:i:s');
            $modelSipuras->altera = 'si';
            $modelSipuras->remote = true;

            if (! $modelSipuras->save(false, [
                'provision_token_hash',
                'provision_token_created_at',
                'altera',
            ])) {
                throw new RuntimeException('Unable to persist ATA provisioning token.');
            }

            MagnusLog::insertLOG(2, 'ATA provisioning token rotated for Sipuras ID ' . (int) $modelSipuras->id);
            echo json_encode([
                'success'      => true,
                'profile_rule' => $profileRule,
                'msg'          => Yii::t('zii', 'Provisioning token rotated. Copy the URL now; it will not be shown again.'),
            ]);
        } catch (Exception $e) {
            Yii::log('Unable to rotate ATA provisioning token: ' . $e->getMessage(), 'error');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'msg'     => Yii::t('zii', 'Unable to rotate the provisioning token.'),
            ]);
        }
    }

    private function canManageProvisioningDevice($modelSipuras)
    {
        if (Yii::app()->session['isClient']) {
            return (int) $modelSipuras->id_user === (int) Yii::app()->session['id_user'];
        }

        if (Yii::app()->session['isAgent']) {
            return isset($modelSipuras->idUser)
                && (int) $modelSipuras->idUser->id_user === (int) Yii::app()->session['id_user'];
        }

        if (Yii::app()->session['user_type'] == 1 && Yii::app()->session['adminLimitUsers'] == true) {
            $command = Yii::app()->db->createCommand(
                'SELECT COUNT(*) FROM pkg_user u
                 WHERE u.id = :deviceUser
                   AND u.id_group IN (
                       SELECT gug.id_group FROM pkg_group_user_group gug
                       WHERE gug.id_group_user = :authenticatedGroup
                   )'
            );
            $command->bindValue(':deviceUser', (int) $modelSipuras->id_user, PDO::PARAM_INT);
            $command->bindValue(':authenticatedGroup', (int) Yii::app()->session['id_group'], PDO::PARAM_INT);
            return (int) $command->queryScalar() === 1;
        }

        return Yii::app()->session['isAdmin'] == true;
    }

    private function provisioningNotFound()
    {
        http_response_code(404);
        exit;
    }
}
