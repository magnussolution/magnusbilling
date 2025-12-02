<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;

class AmountConversion extends Entity
{

    /**
     * @var AmountBase
     */
    protected $from;
    /**
     * @var AmountBase
     */
    protected $to;
    protected $factor;

    public function __construct($data = [])
    {
        if (isset($data['from']))
            $this->setFrom($data['from']);

        if (isset($data['to']))
            $this->setTo($data['to']);

        if (isset($data['factor']))
            $this->setFactor($data['factor']);
    }

    /**
     * Helper function to quickly set all the values
     * @param $base
     * @return $this
     */
    public function setAmountBase($base)
    {
        if (is_array($base))
            $base = new AmountBase($base);

        $this->setTo($base);
        $this->setFrom($base);
        $this->setFactor(1);
        return $this;
    }

    /**
     * @return AmountBase
     */
    public function from()
    {
        return $this->from;
    }

    /**
     * @return AmountBase
     */
    public function to()
    {
        return $this->to;
    }

    public function factor()
    {
        return $this->factor;
    }

    public function setFrom($from)
    {
        if (is_array($from))
            $from = new AmountBase($from);

        if (!($from instanceof AmountBase))
            $from = null;

        $this->from = $from;
        return $this;
    }

    public function setTo($to)
    {
        if (is_array($to))
            $to = new AmountBase($to);

        if (!($to instanceof AmountBase))
            $to = null;

        $this->to = $to;
        return $this;
    }

    public function setFactor($factor)
    {
        $this->factor = $factor;
        return $this;
    }

    public function toArray()
    {
        return [
            'from' => $this->from()->toArray(),
            'to' => $this->to()->toArray(),
            'factor' => $this->factor(),
        ];
    }
}