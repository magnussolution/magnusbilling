<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class AmountDetail extends Entity
{
    use LoaderTrait;

    protected $kind;
    protected $amount;

    public function __construct($data = [])
    {
        $this->load($data, ['kind', 'amount']);
    }

    public function kind()
    {
        return $this->kind;
    }

    public function amount()
    {
        return $this->amount;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'kind' => $this->kind(),
            'amount' => $this->amount(),
        ]);
    }

}