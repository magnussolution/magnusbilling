<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\FieldsTrait;
use Dnetix\Redirection\Traits\LoaderTrait;

class Subscription extends Entity
{
    use FieldsTrait, LoaderTrait;

    protected $reference;
    protected $description;

    public function __construct($data = [])
    {
        $this->load($data, ['reference', 'description']);
        if (isset($data['fields']))
            $this->setFields($data['fields']);
    }

    public function reference()
    {
        return $this->reference;
    }

    public function description()
    {
        return $this->description;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'reference' => $this->reference(),
            'description' => $this->description(),
            'fields' => $this->fieldsToArray(),
        ]);
    }

}