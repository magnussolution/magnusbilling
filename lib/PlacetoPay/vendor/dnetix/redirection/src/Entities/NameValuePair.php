<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class NameValuePair extends Entity
{
    use LoaderTrait;

    protected $keyword;
    protected $value;
    protected $displayOn = 'none';

    public function __construct($data = [])
    {
        $this->load($data, ['keyword', 'value', 'displayOn']);
    }

    public function keyword()
    {
        return $this->keyword;
    }

    public function value()
    {
        return $this->value;
    }

    public function displayOn()
    {
        return $this->displayOn;
    }

    public function toArray()
    {
        return [
            'keyword' => $this->keyword(),
            'value' => $this->value(),
            'displayOn' => $this->displayOn(),
        ];
    }

}