<style type="text/css">
.tftable {font-size:12px;color:#333333;width:100%;border-width: 1px;border-color: #729ea5;border-collapse: collapse;}
.tftable th {font-size:12px;background-color:#acc8cc;border-width: 1px;padding: 8px;border-style: solid;border-color: #729ea5;text-align:left;}
.tftable tr {background-color:#d4e3e5;}
.tftable td {font-size:12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #729ea5;}
.tftable tr:hover {background-color:#ffffff;}
</style>

<table class="tftable" border="1">
<tr>
    <th>Username</th>
    <th>Fixed time</th>
    <th>Fixed cost</th>
    <th>Mobile Time</th>
    <th>Mobile cost</th>
    <th>International Time</th>
    <th>International cost</th>

</tr>

<?php foreach ($model as $key => $value): ?>

<tr>
    <td><?php echo $value->idUser->username ?></td>
    <td><?php echo gmdate("H:i:s", $value->sessiontimeFixed); ?></td>
    <td><?php echo number_format($value->sessionbillFixed, 3) ?></td>
    <td><?php echo gmdate("H:i:s", $value->sessiontimeMobile) ?></td>
    <td><?php echo number_format($value->sessionbillMobile, 3) ?></td>
    <td><?php echo gmdate("H:i:s", $value->sessiontimeRest) ?></td>
    <td><?php echo number_format($value->sessionbillRest, 3) ?></td>

</tr>

<?php endforeach;?>

</table>

<button class="button" style="width: 80px;" onclick="window.location='../../index.php/callSummaryByType/index';" >New Filter</button>

