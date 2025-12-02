<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class Card extends Entity
{
    use LoaderTrait;

    const TP_CREDIT = 'C';
    const TP_DEBIT_SAVINGS = 'A';
    const TP_DEBIT_CURRENT = 'R';

    protected $name;
    private $number;
    private $cvv;
    private $expirationMonth;
    private $expirationYear;
    protected $installments;
    protected $kind = self::TP_CREDIT;

    public function __construct($data = [])
    {
        $this->load($data, ['name', 'number', 'expirationMonth', 'expirationYear', 'installments', 'kind', 'cvv']);
    }

    public function name()
    {
        return $this->name;
    }

    public function number()
    {
        return $this->number;
    }

    /**
     * Returns the expiration year always with YYYY format
     * @return string
     */
    public function expirationYear()
    {
        if (strlen($this->expirationYear) == 2) {
            $this->expirationYear = '20' . $this->expirationYear;
        }
        return $this->expirationYear;
    }

    /**
     * Returns the expiration year always with YY format
     * @return string
     */
    public function expirationYearShort()
    {
        if (strlen($this->expirationYear) == 4) {
            substr($this->expirationYear, 2, 2);
        }
        return $this->expirationYear;
    }

    public function expirationMonth()
    {
        return str_pad($this->expirationMonth, 2, '0', STR_PAD_LEFT);
    }

    public function installments()
    {
        return $this->installments;
    }

    public function kind()
    {
        return $this->kind;
    }

    public function cvv()
    {
        return $this->cvv;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'name' => $this->name(),
            'installments' => $this->installments(),
            'kind' => $this->kind(),
        ]);
    }
}