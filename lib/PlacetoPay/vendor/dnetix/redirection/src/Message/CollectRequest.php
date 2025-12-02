<?php


namespace Dnetix\Redirection\Message;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Entities\Instrument;
use Dnetix\Redirection\Entities\Payment;
use Dnetix\Redirection\Entities\Person;
use Dnetix\Redirection\Traits\FieldsTrait;
use Dnetix\Redirection\Traits\LoaderTrait;

class CollectRequest extends Entity
{
    use LoaderTrait, FieldsTrait;

    protected $locale = 'es_CO';
    /**
     * @var Person
     */
    protected $payer;
    /**
     * @var Person
     */
    protected $buyer;
    /**
     * @var Payment
     */
    protected $payment;
    /**
     * @var Instrument
     */
    protected $instrument;

    public function __construct($data = [])
    {
        $this->load($data, ['locale']);

        if (isset($data['payer']))
            $this->setPayer($data['payer']);

        if (isset($data['buyer']))
            $this->setBuyer($data['buyer']);

        if (isset($data['payment']))
            $this->setPayment($data['payment']);

        if (isset($data['instrument']))
            $this->setInstrument($data['instrument']);

        if (isset($data['fields']))
            $this->setFields($data['fields']);
    }

    public function locale()
    {
        return $this->locale;
    }

    public function language()
    {
        return strtoupper(substr($this->locale(), 0, 2));
    }

    public function payer()
    {
        return $this->payer;
    }

    public function buyer()
    {
        return $this->buyer;
    }

    /**
     * @return Payment
     */
    public function payment()
    {
        return $this->payment;
    }

    public function instrument()
    {
        return $this->instrument;
    }

    /**
     * A redirect request itself doesnt have a reference, but it should
     * know how to get it
     * @return mixed
     */
    public function reference()
    {
        return $this->payment()->reference();
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'locale' => $this->locale(),
            'payer' => $this->payer() ? $this->payer()->toArray() : null,
            'buyer' => $this->buyer() ? $this->buyer()->toArray() : null,
            'payment' => $this->payment() ? $this->payment()->toArray() : null,
            'instrument' => $this->instrument() ? $this->instrument()->toArray() : null,
            'fields' => $this->fieldsToArray(),
        ]);
    }
}