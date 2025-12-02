<?php


namespace Dnetix\Redirection\Entities;

use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class AmountBase extends Entity
{
    use LoaderTrait;

    protected $currency = 'COP';
    protected $total;

    public function __construct($data = [])
    {
        $this->load($data, ['currency', 'total']);
    }

    public function currency()
    {
        return $this->currency;
    }

    public function total()
    {
        return $this->total;
    }

    public function toArray()
    {
        return [
            'currency' => $this->currency(),
            'total' => $this->total(),
        ];
    }
}