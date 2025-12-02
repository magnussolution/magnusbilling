<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;

class Instrument extends Entity
{
    /**
     * @var Bank
     */
    protected $bank;
    /**
     * @var Card
     */
    protected $card;
    /**
     * @var Token
     */
    protected $token;
    protected $pin;
    protected $password;

    public function __construct($data = [])
    {
        if (isset($data['bank']))
            $this->setBank($data['bank']);
        if (isset($data['card']))
            $this->setCard($data['card']);
        if (isset($data['token']))
            $this->setToken($data['token']);
        if (isset($data['pin']))
            $this->pin = $data['pin'];
        if (isset($data['password']))
            $this->password = $data['password'];
    }

    public function bank()
    {
        return $this->bank;
    }

    public function card()
    {
        return $this->card;
    }

    public function token()
    {
        return $this->token;
    }

    public function pin()
    {
        return $this->pin;
    }

    public function password()
    {
        return $this->password;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'bank' => $this->bank() ? $this->bank()->toArray() : null,
            'card' => $this->card() ? $this->card()->toArray() : null,
            'token' => $this->token() ? $this->token()->toArray() : null,
        ]);
    }

}