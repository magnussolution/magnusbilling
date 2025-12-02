<?php


use Dnetix\Redirection\Entities\Status;
use Dnetix\Redirection\Entities\Token;
use Dnetix\Redirection\Message\RedirectInformation;

class RedirectInformationTest extends TestCase
{
    public function testItParsesARestUpdatedResponse()
    {
        $result = unserialize('a:5:{s:9:"requestId";i:371;s:6:"status";a:4:{s:6:"status";s:7:"PENDING";s:6:"reason";s:2:"PT";s:7:"message";s:35:"La petición se encuentra pendiente";s:4:"date";s:25:"2017-05-17T15:57:44-05:00";}s:7:"request";a:15:{s:6:"locale";s:5:"es_CO";s:5:"payer";a:7:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:5:"Diego";s:7:"surname";s:5:"Calle";s:5:"email";s:16:"dnetix@gmail.com";s:6:"mobile";s:10:"3006108399";s:7:"address";a:4:{s:6:"street";s:15:"123 Main Street";s:4:"city";s:12:"Chesterfield";s:10:"postalCode";s:5:"63017";s:7:"country";s:2:"US";}}s:5:"buyer";a:6:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:5:"Aisha";s:7:"surname";s:8:"Nikolaus";s:5:"email";s:17:"dcallem88@msn.com";s:6:"mobile";s:10:"3006108300";}s:7:"payment";a:4:{s:9:"reference";s:20:"TEST_20170517_205552";s:11:"description";s:59:"Ut aut consequatur maxime doloremque iure voluptatem omnis.";s:6:"amount";a:2:{s:8:"currency";s:3:"USD";s:5:"total";s:3:"178";}s:12:"allowPartial";b:0;}s:12:"subscription";N;s:6:"fields";N;s:9:"returnUrl";s:30:"http://redirect.p2p.dev/client";s:13:"paymentMethod";N;s:9:"cancelUrl";N;s:9:"ipAddress";s:9:"127.0.0.1";s:9:"userAgent";s:104:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36";s:10:"expiration";s:25:"2017-05-18T20:55:52+00:00";s:14:"captureAddress";b:0;s:10:"skipResult";b:0;s:11:"noBuyerFill";b:0;}s:7:"payment";a:1:{i:0;a:11:{s:6:"status";a:4:{s:6:"status";s:8:"REJECTED";s:6:"reason";s:2:"01";s:7:"message";s:30:"Negada, Transacción declinada";s:4:"date";s:25:"2017-05-17T15:56:37-05:00";}s:17:"internalReference";i:1447498827;s:13:"paymentMethod";s:10:"masterpass";s:17:"paymentMethodName";s:10:"MasterCard";s:6:"amount";a:3:{s:4:"from";a:2:{s:8:"currency";s:3:"USD";s:5:"total";i:178;}s:2:"to";a:2:{s:8:"currency";s:3:"COP";s:5:"total";d:511433.15999999997;}s:6:"factor";d:2873.2199999999998;}s:13:"authorization";s:6:"000000";s:9:"reference";s:20:"TEST_20170517_205552";s:7:"receipt";s:10:"1495054597";s:9:"franchise";s:5:"RM_MC";s:8:"refunded";b:0;s:15:"processorFields";a:2:{i:0;a:3:{s:7:"keyword";s:10:"lastDigits";s:5:"value";s:8:"****0206";s:9:"displayOn";s:4:"none";}i:1;a:3:{s:7:"keyword";s:2:"id";s:5:"value";s:32:"e6bc23b9f16980bc3e5422dbb6218f59";s:9:"displayOn";s:4:"none";}}}}s:12:"subscription";N;}');
        $information = new RedirectInformation($result);

        $this->assertEquals(371, $information->requestId());
        $this->assertEquals(Status::ST_PENDING, $information->status()->status());

        $this->assertTrue($information->isSuccessful());
        $this->assertFalse($information->isApproved());

        $this->assertEquals('TEST_20170517_205552', $information->request()->payment()->reference());
        $this->assertEquals('1040035000', $information->request()->buyer()->document());

        $this->assertNull($information->lastApprovedTransaction());
        $this->assertEquals('1495054597', $information->lastTransaction()->receipt());
        $this->assertNull($information->lastAuthorization());
    }

    public function testItParsesARestCreatedResponse()
    {
        $result = unserialize('a:5:{s:9:"requestId";i:368;s:6:"status";a:4:{s:6:"status";s:7:"PENDING";s:6:"reason";s:2:"PC";s:7:"message";s:32:"La petición se encuentra activa";s:4:"date";s:25:"2017-05-17T14:44:05-05:00";}s:7:"request";a:15:{s:6:"locale";s:5:"es_CO";s:5:"payer";N;s:5:"buyer";a:6:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:5:"Jakob";s:7:"surname";s:10:"Macejkovic";s:5:"email";s:17:"dcallem88@msn.com";s:6:"mobile";s:10:"3006108300";}s:7:"payment";a:4:{s:9:"reference";s:20:"TEST_20170517_144129";s:11:"description";s:46:"Quisquam architecto optio rem in non expedita.";s:6:"amount";a:3:{s:5:"taxes";a:1:{i:0;a:3:{s:4:"kind";s:13:"valueAddedTax";s:6:"amount";i:20;s:4:"base";i:140;}}s:8:"currency";s:3:"USD";s:5:"total";s:5:"199.8";}s:12:"allowPartial";b:0;}s:12:"subscription";N;s:6:"fields";N;s:9:"returnUrl";s:32:"http://local.dev/redirect/client";s:13:"paymentMethod";N;s:9:"cancelUrl";N;s:9:"ipAddress";s:13:"192.168.33.20";s:9:"userAgent";s:113:"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36";s:10:"expiration";s:25:"2017-05-18T14:41:29+00:00";s:14:"captureAddress";b:0;s:10:"skipResult";b:0;s:11:"noBuyerFill";b:0;}s:7:"payment";N;s:12:"subscription";N;}');
        $information = new RedirectInformation($result);

        $this->assertEquals(368, $information->requestId());
        $this->assertEquals(Status::ST_PENDING, $information->status()->status());

        $this->assertTrue($information->isSuccessful());
        $this->assertFalse($information->isApproved());

        $this->assertEquals('TEST_20170517_144129', $information->request()->payment()->reference());
        $this->assertEquals('1040035000', $information->request()->buyer()->document());

        $this->assertNull($information->lastApprovedTransaction());
        $this->assertNull($information->lastAuthorization());
        $this->assertNull($information->lastTransaction());

        $this->assertArrayHasKey('requestId', $information->toArray());
    }

    public function testItParsesARestFinishedResponse()
    {
        $result = unserialize('a:5:{s:9:"requestId";i:360;s:6:"status";a:4:{s:6:"status";s:8:"APPROVED";s:6:"reason";s:2:"00";s:7:"message";s:42:"La petición ha sido aprobada exitosamente";s:4:"date";s:25:"2017-05-17T14:53:54-05:00";}s:7:"request";a:15:{s:6:"locale";s:5:"es_CO";s:5:"payer";a:6:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:7:"Leilani";s:7:"surname";s:6:"Zulauf";s:5:"email";s:17:"dcallem88@msn.com";s:6:"mobile";s:10:"3006108300";}s:5:"buyer";a:6:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:7:"Leilani";s:7:"surname";s:6:"Zulauf";s:5:"email";s:17:"dcallem88@msn.com";s:6:"mobile";s:10:"3006108300";}s:7:"payment";a:4:{s:9:"reference";s:20:"TEST_20170516_154231";s:11:"description";s:29:"Et et dolorem tenetur et cum.";s:6:"amount";a:2:{s:8:"currency";s:3:"USD";s:5:"total";s:3:"0.3";}s:12:"allowPartial";b:0;}s:12:"subscription";N;s:6:"fields";N;s:9:"returnUrl";s:30:"http://redirect.p2p.dev/client";s:13:"paymentMethod";N;s:9:"cancelUrl";N;s:9:"ipAddress";s:9:"127.0.0.1";s:9:"userAgent";s:104:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36";s:10:"expiration";s:25:"2017-05-17T15:42:31+00:00";s:14:"captureAddress";b:0;s:10:"skipResult";b:0;s:11:"noBuyerFill";b:0;}s:7:"payment";a:1:{i:0;a:11:{s:6:"status";a:4:{s:6:"status";s:8:"APPROVED";s:6:"reason";s:2:"00";s:7:"message";s:8:"Aprobada";s:4:"date";s:25:"2017-05-16T10:43:39-05:00";}s:17:"internalReference";i:1447466623;s:13:"paymentMethod";s:6:"paypal";s:17:"paymentMethodName";s:6:"PayPal";s:6:"amount";a:3:{s:4:"from";a:2:{s:8:"currency";s:3:"USD";s:5:"total";d:0.29999999999999999;}s:2:"to";a:2:{s:8:"currency";s:3:"USD";s:5:"total";d:0.29999999999999999;}s:6:"factor";i:1;}s:13:"authorization";s:17:"2DG26929XX8381738";s:9:"reference";s:20:"TEST_20170516_154231";s:7:"receipt";s:10:"1447466623";s:9:"franchise";s:5:"PYPAL";s:8:"refunded";b:0;s:15:"processorFields";a:1:{i:0;a:3:{s:7:"keyword";s:13:"trazabilyCode";s:5:"value";s:28:"PAY-9BU08130ME378305MLENR4CI";s:9:"displayOn";s:4:"none";}}}}s:12:"subscription";N;}');
        $information = new RedirectInformation($result);

        $this->assertEquals(360, $information->requestId());
        $this->assertEquals(Status::ST_APPROVED, $information->status()->status());

        $this->assertTrue($information->isSuccessful());
        $this->assertTrue($information->isApproved());

        $this->assertEquals('TEST_20170516_154231', $information->request()->payment()->reference());
        $this->assertEquals('Leilani', $information->request()->payer()->name());
        $this->assertEquals('Zulauf', $information->request()->payer()->surname());
        $this->assertEquals('dcallem88@msn.com', $information->request()->payer()->email());
        $this->assertEquals('USD', $information->request()->payment()->amount()->currency());
        $this->assertEquals('0.3', $information->request()->payment()->amount()->total());

        $this->assertEquals('2DG26929XX8381738', $information->lastAuthorization());
        $this->assertEquals('1447466623', $information->lastTransaction()->receipt());
        $this->assertEquals('PYPAL', $information->lastTransaction()->franchise());
        $this->assertEquals([
            'trazabilyCode' => 'PAY-9BU08130ME378305MLENR4CI',
        ], $information->lastTransaction()->additionalData());

        $this->assertArrayHasKey('requestId', $information->toArray());
    }

    public function testItParsesASubscriptionRestResponse()
    {
        $result = unserialize('a:5:{s:9:"requestId";i:372;s:6:"status";a:4:{s:6:"status";s:8:"APPROVED";s:6:"reason";s:2:"00";s:7:"message";s:42:"La petición ha sido aprobada exitosamente";s:4:"date";s:25:"2017-05-17T16:00:47-05:00";}s:7:"request";a:15:{s:6:"locale";s:5:"es_CO";s:5:"payer";a:6:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:6:"Ulises";s:7:"surname";s:5:"Bosco";s:5:"email";s:17:"dcallem88@msn.com";s:6:"mobile";s:10:"3006108300";}s:5:"buyer";a:6:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:6:"Ulises";s:7:"surname";s:5:"Bosco";s:5:"email";s:17:"dcallem88@msn.com";s:6:"mobile";s:10:"3006108300";}s:7:"payment";N;s:12:"subscription";a:2:{s:9:"reference";s:20:"TEST_20170517_205952";s:11:"description";s:30:"Architecto illum et aut nihil.";}s:6:"fields";N;s:9:"returnUrl";s:30:"http://redirect.p2p.dev/client";s:13:"paymentMethod";N;s:9:"cancelUrl";N;s:9:"ipAddress";s:9:"127.0.0.1";s:9:"userAgent";s:104:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36";s:10:"expiration";s:25:"2017-05-18T20:59:52+00:00";s:14:"captureAddress";b:0;s:10:"skipResult";b:0;s:11:"noBuyerFill";b:0;}s:7:"payment";N;s:12:"subscription";a:3:{s:4:"type";s:5:"token";s:6:"status";a:4:{s:6:"status";s:2:"OK";s:6:"reason";s:2:"00";s:7:"message";s:28:"Token generated successfully";s:4:"date";s:25:"2017-05-17T16:00:42-05:00";}s:10:"instrument";a:8:{i:0;a:3:{s:7:"keyword";s:5:"token";s:5:"value";s:64:"4b85ecd661bd6b2e1e69dbd42473c52ed9209c17f5157ede301fde94f66c5a2a";s:9:"displayOn";s:4:"none";}i:1;a:3:{s:7:"keyword";s:8:"subtoken";s:5:"value";s:16:"0751944147051111";s:9:"displayOn";s:4:"none";}i:2;a:3:{s:7:"keyword";s:9:"franchise";s:5:"value";s:5:"CR_VS";s:9:"displayOn";s:4:"none";}i:3;a:3:{s:7:"keyword";s:13:"franchiseName";s:5:"value";s:4:"VISA";s:9:"displayOn";s:4:"none";}i:4;a:3:{s:7:"keyword";s:10:"issuerName";s:5:"value";N;s:9:"displayOn";s:4:"none";}i:5;a:3:{s:7:"keyword";s:10:"lastDigits";s:5:"value";s:4:"1111";s:9:"displayOn";s:4:"none";}i:6;a:3:{s:7:"keyword";s:10:"validUntil";s:5:"value";s:10:"2020-12-15";s:9:"displayOn";s:4:"none";}i:7;a:3:{s:7:"keyword";s:12:"installments";s:5:"value";s:1:"1";s:9:"displayOn";s:4:"none";}}}}');
        $information = new RedirectInformation($result);

        $this->assertEquals(372, $information->requestId());
        $this->assertEquals(Status::ST_APPROVED, $information->status()->status());

        $this->assertTrue($information->isSuccessful());
        $this->assertTrue($information->isApproved());

        $this->assertEquals('TEST_20170517_205952', $information->request()->subscription()->reference());
        $this->assertEquals('Ulises', $information->request()->payer()->name());
        $this->assertEquals('Bosco', $information->request()->payer()->surname());
        $this->assertEquals('dcallem88@msn.com', $information->request()->payer()->email());

        /**
         * @var Token $token
         */
        $token = $information->subscription()->parseInstrument();
        $this->assertInstanceOf(Token::class, $token);
        $this->assertTrue($token->isSuccessful());

        $this->assertEquals('4b85ecd661bd6b2e1e69dbd42473c52ed9209c17f5157ede301fde94f66c5a2a', $token->token());
        $this->assertEquals('0751944147051111', $token->subtoken());
        $this->assertEquals('CR_VS', $token->franchise());
        $this->assertEquals('VISA', $token->franchiseName());
        $this->assertEquals('1111', $token->lastDigits());
        $this->assertEquals('12/20', $token->expiration());
        $this->assertEquals(1, $token->installments());

        $this->assertEquals([
            'status' => [
                'status' => 'OK',
                'reason' => '00',
                'message' => 'Token generated successfully',
                'date' => '2017-05-17T16:00:42-05:00',
            ],
            'token' => '4b85ecd661bd6b2e1e69dbd42473c52ed9209c17f5157ede301fde94f66c5a2a',
            'subtoken' => '0751944147051111',
            'franchise' => 'CR_VS',
            'franchiseName' => 'VISA',
            'lastDigits' => '1111',
            'validUntil' => '2020-12-15',
            'installments' => 1,
        ], $token->toArray());
    }

    public function testItParsesACancelledSubscriptionRestResponse()
    {
        $result = unserialize('a:5:{s:9:"requestId";i:373;s:6:"status";a:4:{s:6:"status";s:8:"REJECTED";s:6:"reason";s:2:"?C";s:7:"message";s:45:"La petición ha sido cancelada por el usuario";s:4:"date";s:25:"2017-05-17T16:13:52-05:00";}s:7:"request";a:15:{s:6:"locale";s:5:"es_CO";s:5:"payer";N;s:5:"buyer";a:6:{s:8:"document";s:10:"1040035000";s:12:"documentType";s:2:"CC";s:4:"name";s:6:"Ramiro";s:7:"surname";s:7:"Schultz";s:5:"email";s:17:"dcallem88@msn.com";s:6:"mobile";s:10:"3006108300";}s:7:"payment";N;s:12:"subscription";a:2:{s:9:"reference";s:20:"TEST_20170517_211300";s:11:"description";s:43:"Molestiae expedita mollitia natus eligendi.";}s:6:"fields";N;s:9:"returnUrl";s:30:"http://redirect.p2p.dev/client";s:13:"paymentMethod";N;s:9:"cancelUrl";N;s:9:"ipAddress";s:9:"127.0.0.1";s:9:"userAgent";s:104:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36";s:10:"expiration";s:25:"2017-05-18T21:13:00+00:00";s:14:"captureAddress";b:0;s:10:"skipResult";b:0;s:11:"noBuyerFill";b:0;}s:7:"payment";N;s:12:"subscription";N;}');
        $information = new RedirectInformation($result);

        $this->assertEquals(373, $information->requestId());
        $this->assertEquals(Status::ST_REJECTED, $information->status()->status());

        $this->assertTrue($information->isSuccessful());
        $this->assertFalse($information->isApproved());

        $this->assertEquals('TEST_20170517_211300', $information->request()->subscription()->reference());

        $this->assertNull($information->subscription());
    }
}