<?php


namespace Dnetix\Redirection\Entities;


class Amount extends AmountBase
{

    /**
     * @var TaxDetail[]
     */
    protected $taxes = null;
    /**
     * @var AmountDetail[]
     */
    protected $details = null;

    protected $taxAmount = 0;

    public function __construct($data = [])
    {
        parent::__construct($data);
        if (isset($data['taxes'])) {
            $this->setTaxes($data['taxes']);
        }
        if (isset($data['details'])) {
            $this->setDetails($data['details']);
        }
    }

    public function taxes()
    {
        return $this->taxes;
    }

    public function details()
    {
        return $this->details;
    }

    public function taxAmount()
    {
        return $this->taxAmount;
    }

    public function devolutionBase()
    {
        if (!isset($this->vatDevolutionBase))
            return 0;

        return $this->vatDevolutionBase;
    }

    public function subtotal()
    {
        if (!isset($this->subtotal))
            return $this->total() - $this->taxAmount;

        return $this->subtotal;
    }

    public function setTaxes(array $taxes)
    {
        $return = [];
        foreach ($taxes as $tax) {
            if (is_array($tax)) {
                $tax = new TaxDetail($tax);
                $this->taxAmount += $tax->amount();
                $return[] = $tax;
            }
        }
        $this->taxes = $return;
        return $this;
    }

    public function setDetails($details)
    {
        $return = [];
        foreach ($details as $detail) {
            if (is_array($detail))
                $detail = new AmountDetail($detail);

            $this->{$detail->kind()} = $detail->amount();
            $return[] = $detail;
        }
        $this->details = $return;
        return $this;
    }

    private function taxesToArray()
    {
        if ($this->taxes()) {
            $taxes = [];
            foreach ($this->taxes() as $tax) {
                $taxes[] = ($tax instanceof TaxDetail) ? $tax->toArray() : null;
            }
            return $taxes;
        }
        return null;
    }

    private function detailsToArray()
    {
        if ($this->details()) {
            $details = [];
            foreach ($this->details() as $detail) {
                $details[] = $detail->toArray();
            }
            return $details;
        }
        return null;
    }

    public function toArray()
    {
        return $this->arrayFilter(array_merge([
            'taxes' => $this->taxesToArray(),
            'details' => $this->detailsToArray(),
        ], parent::toArray()));
    }

}