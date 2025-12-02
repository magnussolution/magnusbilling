<?php


use Dnetix\Redirection\Entities\Status;
use Dnetix\Redirection\Entities\Transaction;

class TransactionTest extends TestCase
{
    public function testItParsesTheDataCorrectly()
    {
        $data = unserialize('a:12:{s:6:"status";a:4:{s:6:"status";s:8:"APPROVED";s:6:"reason";s:2:"00";s:7:"message";s:8:"Aprobada";s:4:"date";s:25:"2017-05-10T12:36:36-05:00";}s:17:"internalReference";i:1447325855;s:13:"paymentMethod";s:4:"card";s:17:"paymentMethodName";s:4:"Visa";s:10:"issuerName";s:16:"BANCO DE PRUEBAS";s:6:"amount";a:3:{s:4:"from";a:2:{s:8:"currency";s:3:"COP";s:5:"total";i:178100;}s:2:"to";a:2:{s:8:"currency";s:3:"COP";s:5:"total";i:178100;}s:6:"factor";i:1;}s:13:"authorization";s:6:"000000";s:9:"reference";s:20:"TEST_20170510_173143";s:7:"receipt";s:10:"1494437796";s:9:"franchise";s:5:"CR_VS";s:8:"refunded";b:0;s:15:"processorFields";a:2:{i:0;a:3:{s:7:"keyword";s:10:"lastDigits";s:5:"value";s:8:"****1111";s:9:"displayOn";s:4:"none";}i:1;a:3:{s:7:"keyword";s:2:"id";s:5:"value";s:32:"25cdbc2252d6e70480c969580c7edb32";s:9:"displayOn";s:4:"none";}}}');
        $transaction = new Transaction($data);

        $this->assertEquals(Status::ST_APPROVED, $transaction->status()->status());
        $this->assertTrue($transaction->isSuccessful());
        $this->assertTrue($transaction->isApproved());
        $this->assertEquals([
            'lastDigits' => '****1111',
            'id' => '25cdbc2252d6e70480c969580c7edb32',
        ], $transaction->additionalData());

        $this->assertEquals([
            [
                'keyword' => 'lastDigits',
                'value' => '****1111',
                'displayOn' => 'none',
            ],
            [
                'keyword' => 'id',
                'value' => '25cdbc2252d6e70480c969580c7edb32',
                'displayOn' => 'none',
            ],
        ], $transaction->processorFieldsToArray());
    }

}