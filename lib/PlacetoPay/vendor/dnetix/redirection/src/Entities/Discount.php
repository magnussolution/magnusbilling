<?php


namespace Dnetix\Redirection\Entities;

use Dnetix\Redirection\Traits\LoaderTrait;

class Discount
{
    use LoaderTrait;

    protected $code;
    protected $type;
    protected $amount;
    protected $base;
    protected $percent;

    public function __construct($data = [])
    {
        $this->load($data, ['code', 'type', 'amount', 'base', 'percent']);
    }

    public function code()
    {
        return $this->code;
    }

    public function type()
    {
        return $this->type;
    }

    public function amount()
    {
        return $this->amount;
    }

    public function base()
    {
        return $this->base;
    }

    public function percent()
    {
        return $this->percent;
    }

    public function toArray()
    {
        return [
            'code' => $this->code(),
            'type' => $this->type(),
            'amount' => $this->amount(),
            'base' => $this->base(),
            'percent' => $this->percent(),
        ];
    }
}
