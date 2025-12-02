<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class TaxDetail extends Entity
{
    use LoaderTrait;

    protected $kind;
    protected $amount;
    protected $base;

    public function __construct($data = [])
    {
        $this->load($data, ['kind', 'amount', 'base']);
    }

    public function kind()
    {
        return $this->kind;
    }

    public function amount()
    {
        return $this->amount;
    }

    public function base()
    {
        return $this->base;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'kind' => $this->kind(),
            'amount' => $this->amount(),
            'base' => $this->base(),
        ]);
    }

}