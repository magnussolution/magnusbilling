<?php

namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class Account extends Entity
{
    use LoaderTrait;

    /**
     * @var Status
     */
    public $status;
    public $bankCode;
    public $bankName;
    public $accountType;
    public $accountNumber;

    public function __construct($data = [])
    {
        $this->load($data, ['bankCode', 'bankName', 'accountType', 'accountNumber']);

        if (isset($data['status']))
            $this->setStatus($data['status']);
    }

    public function status()
    {
        return $this->status;
    }

    public function bankCode()
    {
        return $this->bankCode;
    }

    public function bankName()
    {
        return $this->bankName;
    }

    public function accountType()
    {
        return $this->accountType;
    }

    public function accountNumber()
    {
        return $this->accountNumber;
    }

    /**
     * The subscription franchise code (CR_VS, RM_MC)
     * @return string
     */
    public function franchise()
    {
        return '_' . $this->bankCode() . '_';
    }

    public function toArray()
    {
        return array_filter([
            'status' => $this->status() ? $this->status()->toArray() : null,
            'bankCode' => $this->bankCode(),
            'bankName' => $this->bankName(),
            'accountType' => $this->accountType(),
            'accountNumber' => $this->accountNumber(),
            'franchise' => $this->franchise(),
        ]);
    }

    /**
     * @return string
     */
    public function type()
    {
        return 'account';
    }


    /**
     * The subscription franchise name (VISA, Mastercard, Bancolombia)
     * @return string
     */
    public function franchiseName()
    {
        return $this->bankName();
    }

    /**
     * Last digits for the instrument subscribed in order to display to the
     * user
     * @return string
     */
    public function lastDigits()
    {
        return substr($this->accountNumber(), -4);
    }

    /**
     * Parses this entity as Name Value Pairs for the response
     * @return array
     */
    public function asNameValuePairArray()
    {
        return array_filter([
            'bankCode' => $this->bankCode(),
            'bankName' => $this->bankName(),
            'accountType' => $this->accountType(),
            'accountNumber' => $this->accountNumber(),
        ]);
    }
}