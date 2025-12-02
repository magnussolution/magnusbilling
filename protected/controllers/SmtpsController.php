<?php
/**
 * Acoes do modulo "Did".
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
 * 24/09/2012
 */

class SmtpsController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idUser' => 'username'];

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
    ];

    public $fieldsInvisibleClient = [
        'id_user',
        'password',
        'username',
        'host',
        'port',
        'encryption',
    ];

    public function init()
    {
        $this->instanceModel = new Smtps;
        $this->abstractModel = Smtps::model();
        $this->titleReport   = 'SMTP';

        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        if (Yii::app()->session['isAdmin']) {
            $this->filter = ' AND id_user = 1';
        }

        parent::actionRead($asJson = true, $condition = null);
    }

    public function extraFilterCustomAgent($filter)
    {
        //se é agente filtrar pelo user.id_user

        $this->relationFilter['idUser'] = [
            'condition' => "idUser.id LIKE :agfby",
        ];

        $this->paramsFilter[':agfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

    public function beforeSave($values)
    {
        if ($this->isNewRecord) {

            $modelUser = Smtps::model()->find("id_user = " . Yii::app()->session['id_user']);
            if (isset($modelUser->id)) {
                echo json_encode([
                    'success' => false,
                    'rows'    => [],
                    'errors'  => Yii::t('zii', 'Do you already have a SMTP'),
                ]);
                exit;
            }

            if (Yii::app()->session['isAgent'] == 1) {

                $filter            = "id_user = 1 AND ( mailtype = 'signup'  OR mailtype = 'signupconfirmed' OR mailtype = 'reminder' OR mailtype = 'refill')";
                $modelTemplateMail = TemplateMail::model()->findAll($filter);

                foreach ($modelTemplateMail as $key => $mail) {
                    //add new template to user
                    $modelTemplateMailNew              = new TemplateMail();
                    $modelTemplateMailNew->id_user     = Yii::app()->session['id_user'];
                    $modelTemplateMailNew->mailtype    = $mail->mailtype;
                    $modelTemplateMailNew->fromemail   = $values['username'];
                    $modelTemplateMailNew->fromname    = $mail->fromname;
                    $modelTemplateMailNew->subject     = $mail->subject;
                    $modelTemplateMailNew->messagehtml = $mail->messagehtml;
                    $modelTemplateMailNew->language    = $mail->language;
                    $modelTemplateMailNew->save();
                }
            }
        }
        if (Yii::app()->session['isAgent'] == 1) {
            $values['id_user'] = Yii::app()->session['id_user'];
        } else {
            $values['id_user'] = 1;
        }
        return $values;
    }

    public function actionTestMail()
    {

        $modelUser = User::model()->findByPk((int) Yii::app()->session['id_user']);

        if ( ! preg_match("/@/", $modelUser->email)) {

            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'PLEASE CONFIGURE A VALID EMAIL TO USER ' . $modelUser->username,
            ]);
            exit;
        }

        $mail = new Mail(Mail::$TYPE_SIGNUP, $modelUser->id);
        $mail->setTitle('MagnusBilling email test');
        $mail->setMessage('<br>Hi, this is a email from MagnusBilling.');
        $mail->send();

        if (preg_match("/Erro/", $mail->output)) {
            $sussess = false;
        } else {
            $output  = $this->msgSuccess;
            $sussess = true;
        }

        echo json_encode([
            $this->nameSuccess => $sussess,
            $this->nameMsg     => $mail->output,
        ]);
    }

}
