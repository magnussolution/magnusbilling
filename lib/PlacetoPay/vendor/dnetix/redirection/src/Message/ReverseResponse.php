<?php


namespace Dnetix\Redirection\Message;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Entities\Status;
use Dnetix\Redirection\Entities\Transaction;
use Dnetix\Redirection\Traits\StatusTrait;

class ReverseResponse extends Entity
{
    use StatusTrait;

    /**
     * @var Transaction
     */
    public $payment;


    public function status()
    {
        return $this->status;
    }

    public function payment()
    {
        return $this->payment;
    }

    public function __construct($data = [])
    {
        $this->setStatus($data['status']);

        if (isset($data['payment']))
            $this->setPayment($data['payment']);
    }

    public function isSuccessful()
    {
        return $this->status()->status() != Status::ST_ERROR;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'status' => $this->status() ? $this->status()->toArray() : null,
            'payment' => $this->payment() ? $this->payment()->toArray() : null,
        ]);
    }

}