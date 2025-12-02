



<meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" name="viewport"/>

<div id="component-buy-options" width="100%">
        <form method="POST" action="" class="form-style-9" >

        <div class="col1">

            <?php if (isset($_POST['id_method']) && $_POST['id_method'] > 0): ?>


                <div id="payment-selection">
                <input type="hidden" name="payment_method" value=<?php echo $modelMethodPay->id ?>>
                <h4>Insert credit amount</h4>
                <input style="width: 100%;" type="number" min="<?php echo $modelMethodPay->min ?>" max="<?php echo $modelMethodPay->max ?>" name="pay_amount2" id="pay_amount2" oninput="hiddendiv(event,<?php echo $modelMethodPay->min ?>,<?php echo $modelMethodPay->max ?>)">
                <br><br>
                <h5 style="display:none" id="error"></h5>
            </div>
            <?php else: ?>

                <h4>Select payment method</h4>
                <div id="payment-selection">
                    <div id="3010">
                        <select name="id_method" style="width: 100%;">
                            <option value="">SELECT</option>
                            <?php foreach ($modelMethodPay as $value): ?>
                                <option value="<?php echo $value['id'] ?>"><?php echo $value['show_name'] ?></option>
                            <?php endforeach?>
                        </select>
                    </div>
                    <br><br>
                </div>
            <?php endif;?>
            <br>
            <div id="payment-details-action">

                <button onclick="window.location='../../index.php/buyCredit/method/?mobile=true';"  id="button-next" class="btn btn-primary">Cancel &raquo;</button>
                <button id="button-next" class="btn btn-primary" type="submit" value="Next &raquo;">Next &raquo;</button>
                </div>
        </div>
        <div class="clear"></div>
        <br>

    </form>
</div>


<script type="text/javascript">


    function hiddenPayAmount2(){
        document.getElementById("pay_amount2").value = "";
    }
    function hiddendiv(e,min,max) {
        val = document.getElementById("pay_amount2").value;
        var regex=/^[0-9]+$/;
            if (!val.match(regex))
        {
            if(val == ''){
                document.getElementById("error").style.display = 'none';
            }else{
                document.getElementById("error").innerHTML = "<font color = red> need be number </font>";
                    document.getElementById("error").style.display = 'inline';
                    return false;
            }

        }else{
                document.getElementById("error").style.display = 'none';
        }

        if(val > 0 && val < min){
            document.getElementById("error").innerHTML = "<font color = red> The minimal amount is "+min+" </font>";
                document.getElementById("error").style.display = 'inline';
                return false;
        }else{
                document.getElementById("error").style.display = 'none';
        }

        if(val > 0 && val > max){
            document.getElementById("error").innerHTML = "<font color = red> The maximum amount is "+max+" </font>";
                document.getElementById("error").style.display = 'inline';
                return false;
        }else{
                document.getElementById("error").style.display = 'none';
        }

        for(i=0;i<20;i++){
            if(document.getElementById("selectd_"+i))
                document.getElementById("selectd_"+i).checked = false;
        }
    }

</script>

<style type="text/css">
    .clear {
    clear: both
}
#component-buy-options .col1, #component-buy-options .col2, #component-buy-options .col3, #payment-service-form .col1, #payment-service-form .col2, #payment-service-form .col3, #payment-overview .col3 {
    float: left;
    margin-right: 35px
}
#component-buy-options .col1 {
    width: 100%
}

#component-buy-options form h4 {
    color: #464646;
    font-weight: normal
}
#component-buy-options form h4.enabled {
    color: #91ae08
}
#amount-selection, #payment-selection, .bc-section {
    border: 1px solid #ccc;
    background-color: #f9f8fd;
    min-height: 54px;
    width: auto !important
}
#payment-details-action {
    position: absolute
}
#payment-details-action #cost {
    position: absolute;
    padding-left: 5px
}
#payment-details-action #total-freedays {
    line-height: 17px
}
#payment-details-action .helptip {
    display: inline-block
}
#payment-details-action #total-cost {
    font-family: Arial;
    text-align: left;
    line-height: 14px
}
#payment-details-action #total-cost .total-cost-text {
    font-weight: bold;
    font-size: 13px
}
#payment-details-action #total-cost .incl-fees-text {
    font-weight: normal;
    font-size: 12px
}
#payment-details-action #total-cost .cost-text {
    font-weight: bold;
    font-size: 13px;
    position: relative;
    padding: 0px
}
#payment-details-action #payment-info-container, #payment-details-action .payment-info {
    width: 100px
}
#payment-details-action #payment-info-container #payment-info-freedays {
    display: none
}
#component-buy-options .divider {
    margin: 10px 0 20px 20px
}
#component-buy-options .divider-line {
    height: 1px;
    border-bottom: 1px solid #CCCCCC;
    width: 90%;
    margin: 0 auto
}
#amount-selection .other-amounts, #payment-selection .more-payments.sub, #payment-selection .disabled-payments {
    margin-top: -20px;
    margin-bottom: 10px
}
#payment-selection .last-used-payments {
    min-height: 115px
}
#notice-container {
    margin: 0px
}
#notice-container .notice {
    padding: 10px 0px;
    font-weight: bold;
    display: none
}
#notice-container .notice span {
    display: block;
    padding: 0 20px 0px 40px
}
#notice-container .notice a {
    color: #000000
}
#notice-container .success {
    color: #000000
}
#notice-container .notification {
    margin-bottom: -1px;
    background-position: 11px !important;
    width: 248px
}
#component-buy-options .item-block {
    text-align: center;
    float: left;
    margin: 20px 0 10px 23px;
    width: 100px;
    vertical-align: middle
}
#component-buy-options .item-block .logo {
    display: block;
    margin: 0 auto;
    cursor: pointer
}
#component-buy-options .item-block .logo.disabled {
    background-color: transparent !important
}
#component-buy-options .item-block .title {
    font-family: Arial;
    padding-top: 5px;
    display: block;
    text-align: center;
    clear: both;
    font-size: 13px;
    color: #464646;
    cursor: pointer
}
#component-buy-options .item-block input {
    display: block;
    float: left;
    margin: 15px 6px 0 0;
    padding: 0
}
#component-buy-options .item-block .box {
    cursor: pointer;
    width: 71px;
    height: 47px;
    display: table-cell;
    background-color: #f1f1f1;
    padding: 3px 0;
    background: url('../../../resources/images/payment_method_bg_enabled.png') no-repeat 3px 3px;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    border-radius: 5px
}
#component-buy-options .item-block.easyrecharge .box {
    background: url('../../../resources/images/payment_method_bg_enabled_easyrecharge.png') no-repeat 0 0;
    text-align: left;
    width: 120px!important;
    float: left
}
#component-buy-options .item-block.easyrecharge {
    width: 94%
}
#component-buy-options .item-block.easyrecharge .box .cc_details {
    padding-top: 6px;
    padding-left: 10px;
    line-height: 15px;
    color: #000000
}
#component-buy-options .item-block.easyrecharge .instant-recharge-note {
    float: right;
    width: 215px;
    text-align: left;
    font-size: 14px;
    line-height: 15px;
    padding-top: 10px;
    color: #000000
}
#component-buy-options .col1 .item-block {
    width: 90px;
    height: 47px
}
#component-buy-options .col1 .box {
    margin-right: 6px
}
#component-buy-options .col1 .box span {
    font-size: 15px;
    font-family: Arial;
    font-weight: bold;
    color: #2e3192;
    display: block;
    vertical-align: middle;
    line-height: 41px
}
#component-buy-options .col1 .box span.small {
    font-size: 12px
}
#component-buy-options .col1 .box span.small-more-txt {
    font-size: 11px;
    line-height: 10px;
    margin-top: 12px
}
#component-buy-options .item-block.disabled {
    background-color: transparent !important
}
#component-buy-options .item-block.disabled .box {
    border-color: #848486;
    background: url('../../../resources/images/payment_method_bg_disabled.png') no-repeat 3px 3px !important
}
#component-buy-options .item-block.disabled span {
    color: #9d9d9f
}
#component-buy-options .item-block.disabled.easyrecharge .box {
    background: url('../../../resources/images/payment_method_bg_disabled_easyrecharge.png') no-repeat 0 0 !important
}
#component-buy-options .item-block.not_clickable .box, #component-buy-options .item-block.not_clickable .logo {
    cursor: auto
}
#component-buy-options .item-block.selected .box {
    background: url('../../../resources/images/payment_method_bg_selected.png') no-repeat !important
}
#component-buy-options .item-block.selected.easyrecharge .box {
    background: url('../../../resources/images/payment_method_bg_selected_easyrecharge.png') no-repeat !important
}
#component-buy-options .disabled-payments .disabled-payments-message {
    padding: 15px 20px 0;
    line-height: 1.3em
}
</style>