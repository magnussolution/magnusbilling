<?php

namespace Dnetix\Redirection\Entities;

use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class Person extends Entity
{
    use LoaderTrait;

    protected $document;
    protected $documentType;
    protected $name;
    protected $surname;
    protected $company;
    protected $email;
    /**
     * @var Address
     */
    protected $address;
    protected $mobile;

    public function __construct($data = [])
    {
        $this->load($data, ['document', 'documentType', 'name', 'surname', 'company', 'email', 'mobile']);

        if (isset($data['address'])) {
            $this->setAddress($data['address']);
        }
    }

    public function document()
    {
        return $this->document;
    }

    public function documentType()
    {
        return $this->documentType;
    }

    public function name()
    {
        return $this->name;
    }

    public function surname()
    {
        return $this->surname;
    }

    public function company()
    {
        return $this->company;
    }

    public function email()
    {
        return $this->email;
    }

    /**
     * @return Address
     */
    public function address()
    {
        return $this->address;
    }

    public function mobile()
    {
        return $this->mobile;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'document' => $this->document(),
            'documentType' => $this->documentType(),
            'name' => $this->name(),
            'surname' => $this->surname(),
            'email' => $this->email(),
            'mobile' => $this->mobile(),
            'company' => $this->company(),
            'address' => $this->address() ? $this->address()->toArray() : null,
        ]);
    }

}
