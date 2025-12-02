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
?>
<link rel="stylesheet" type="text/css" href="../../resources/css/signup.css" />
<form class="rounded" id="contactform" action="../../index.php/authentication/login" method="post" target="_blank">

	<h2><?php Yii::t('zii', 'Confirmation')?></h2>

	<?php
        if (isset($_GET['id_user'])) {
            $sql     = "SELECT id FROM pkg_smtp WHERE id_user = :id_user";
            $command = Yii::app()->db->createCommand($sql);
            $command->bindValue(":id_user", $_GET['id_user'], PDO::PARAM_STR);
            $smtpResult = $command->queryAll();
        }

        if ( ! isset($_GET['loginkey']) && (isset($smtpResult) && count($smtpResult) > 0)):
            echo '<font color=red>' . Yii::t('zii', 'Please check your email') . '</font>';
            echo '</form>';
        else:
    ?>
			<div align="left" class="field">
				<label><?php echo Yii::t('zii', 'Username') ?></label>
				<input readonly="readonly" class="input" name="user" type="text" value="<?php echo $signup->username ?>" />
			</div>

			<?php if ($signup->id_user > 1): ?>
			<div align="left" class="field">
				<label><?php echo Yii::t('zii', 'Password') ?></label>
				<input readonly="readonly" class="input" name="passagent" type="text" value="<?php echo $signup->password ?>" />
			</div>
			<?php endif;?>
			<div align="left" class="field">
					<input readonly="readonly" class="input" name="password" type="hidden" value="<?php echo strtoupper(MD5($signup->password)) ?>" />
			</div>
			<div align="left" class="field">
				<input required class="input" name="loginkey" type="hidden" value="<?php echo $loginkey = isset($_GET['loginkey']) ? $_GET['loginkey'] : null ?>" />
				<p class="hint"><?php echo Yii::t('zii', 'Enter your loginkey which was sent to your Email') ?></p>
			</div>

			<input name="remote" value="1" type="hidden" />


			<input class="button" type="submit" value = "<?php echo Yii::t('zii', 'Enter in your account') ?>" />
		</form>
	<?php endif;?>