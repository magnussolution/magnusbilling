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
<?php header('Content-type: text/html; charset=utf-8');?>
<?php if ($send == false): ?>

        <div class="divMain">

            <div class="linha1">Click To Call</div>
            <p style="text-align: center; width: 100%"><img src="/mbilling/resources/images/Click-to-Call.png" /></p>
            <form method='POST'>
                <div class="linha2" id="linha2">
                <div class="col1">&nbsp;&nbsp;&nbsp;<?php echo Yii::t('zii', 'Your number') ?></div>
                <div class="col2">
                        <input type="text" id="destino" name="number" class="txt" onfocus="this.className='cxOn'" onblur="this.className='cxOff'" />
                </div>
                <div style="color: red; font-size: 10px; width: 100%; text-align: center;"><?php echo Yii::t('zii', 'Example') . ' <b>' . Yii::t('zii', '1+360+NUMBER') . ' </b>' ?> </div>
                </div>
                <div class="linha4">
                <input type="submit" value="                                             <?php echo Yii::t('zii', 'Call Me') ?>" style="width: 100px; height: 30px; cursor: pointer" />
                </div>
            </form>
        </div>

<?php else: ?>
    <div class="divMain">
        <div class="linha1">Click To Call</div>
        <p style="text-align: center; width: 100%"><img src="../resources/images/Click-to-Call.png" /></p>

        <div class="linha2" id="linha2">
            <div class="col1">&nbsp;&nbsp;&nbsp;<?php echo Yii::t('zii', 'Wait, your phone ring in few seconds') ?> </div>
        </div>
        <div class="linha4">&nbsp;</div>

    </div>

<?php endif?>


<style type="text/css">
    .divMain {
        border:solid 2px #15B;
        width:300px;
        margin:10px auto auto;
    }

    .linha1,.linha2,.linha3,.linha4 {
        font:bold 12pt "Trebuchet Ms","Verdana", "Arial";
        width:auto;
        text-align:center;
    }

    .linha1 {
        margin-bottom:20px;
        font:bold 16pt "Trebuchet Ms","Verdana", "Arial";
        color:#FFF;
        background-color:#15B;
    }

    .linha2 {
        margin-bottom:5px;
    }

    .linha4 {
        margin-top:25px;
        margin-bottom:10px;
    }

    .col1,.col2,.col3,.col4 {
        width:auto;
        margin:auto;
    }

    .col1 {
        float:left;
        width:100px;
        height:22px;
        text-align:right;
        padding-right:5px;
        color:#15B;
        white-space: nowrap
    }

    .txt,.cxOn,.cxOff {
        border:solid 1px #15B;
    }

    .cxOn {
        background-color:#EEFAFD;
    }

    .cxOff {
        background-color:#FFF;
    }
</style>

