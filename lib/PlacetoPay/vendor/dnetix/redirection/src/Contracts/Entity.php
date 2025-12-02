<?php


namespace Dnetix\Redirection\Contracts;


use Dnetix\Redirection\Entities\Address;
use Dnetix\Redirection\Entities\Amount;
use Dnetix\Redirection\Entities\Bank;
use Dnetix\Redirection\Entities\Card;
use Dnetix\Redirection\Entities\Instrument;
use Dnetix\Redirection\Entities\Payment;
use Dnetix\Redirection\Entities\Person;
use Dnetix\Redirection\Entities\Recurring;
use Dnetix\Redirection\Entities\Status;
use Dnetix\Redirection\Entities\Token;
use Dnetix\Redirection\Traits\ValidatorTrait;

abstract class Entity
{
    use ValidatorTrait;

    /**
     * Extracts the information for the entity
     * @return array
     */
    public abstract function toArray();

    public function setPayer($person)
    {
        if (is_array($person)) {
            $person = new Person($person);
        }

        if (!($person instanceof Person))
            $person = null;

        $this->payer = $person;
        return $this;
    }

    public function setBuyer($person)
    {
        if (is_array($person)) {
            $person = new Person($person);
        }

        if (!($person instanceof Person))
            $person = null;

        $this->buyer = $person;
        return $this;
    }

    public function setPayment($payment)
    {
        if (is_array($payment)) {
            $payment = new Payment($payment);
        }

        if (!($payment instanceof Payment))
            $payment = null;

        $this->payment = $payment;
        return $this;
    }

    public function setStatus($status)
    {
        if (is_array($status))
            $status = new Status($status);

        if (!($status instanceof Status))
            $status = null;

        $this->status = $status;
        return $this;
    }

    public function setAmount($amount)
    {
        if (is_array($amount))
            $amount = new Amount($amount);

        if (!($amount instanceof Amount))
            $amount = null;

        $this->amount = $amount;
        return $this;
    }

    public function setRecurring($recurring)
    {
        if (is_array($recurring))
            $recurring = new Recurring($recurring);

        if (!($recurring instanceof Recurring))
            $recurring = null;

        $this->recurring = $recurring;
        return $this;
    }

    public function setShipping($shipping)
    {
        if (is_array($shipping))
            $shipping = new Person($shipping);

        if (!($shipping instanceof Person))
            $shipping = null;

        $this->shipping = $shipping;
        return $this;
    }

    public function setInstrument($instrument)
    {
        if (is_array($instrument))
            $instrument = new Instrument($instrument);

        if (!($instrument instanceof Instrument))
            $instrument = null;

        $this->instrument = $instrument;
        return $this;
    }

    public function setBank($bank)
    {
        if (is_array($bank)) {
            $bank = new Bank($bank);
        }

        if (!($bank instanceof Bank))
            $bank = null;

        $this->bank = $bank;
        return $this;
    }

    public function setToken($token)
    {
        if (is_array($token)) {
            $token = new Token($token);
        }

        if (!($token instanceof Token))
            $token = null;

        $this->token = $token;
        return $this;
    }

    public function setCard($card)
    {
        if (is_array($card)) {
            $card = new Card($card);
        }

        if (!($card instanceof Card))
            $card = null;

        $this->card = $card;
        return $this;
    }

    public function setAddress($address)
    {
        if (is_array($address)) {
            $address = new Address($address);
        }

        if (!($address instanceof Address))
            $address = null;

        $this->address = $address;
        return $this;
    }

    public static function arrayFilter($array)
    {
        return array_filter($array, function ($item) {
            return !empty($item) || $item === false || $item === 0;
        });
    }

}