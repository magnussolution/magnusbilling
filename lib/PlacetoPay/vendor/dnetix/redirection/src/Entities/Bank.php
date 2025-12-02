<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class Bank extends Entity
{
    use LoaderTrait;

    const INT_PERSON = 0;
    const INT_BUSINESS = 1;

    protected $interface = 0;
    protected $code;
    protected $name;

    public function __construct($data = [])
    {
        $this->load($data, ['interface', 'code', 'name']);
    }

    public function bankInterface()
    {
        return $this->interface;
    }

    public function code()
    {
        return $this->code;
    }

    public function name()
    {
        return $this->name;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'interface' => $this->interface,
            'code' => $this->code(),
            'name' => $this->name(),
        ]);
    }
}