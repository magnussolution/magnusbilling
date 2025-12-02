<?php


namespace Dnetix\Redirection\Entities;

use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class Transaction extends Entity
{
    use LoaderTrait;
    /**
     * @var Status
     */
    protected $status;
    /**
     * Reference as the commerce provides
     * @var string
     */
    protected $reference;
    /**
     * Reference for PlacetoPay
     * @var string
     */
    protected $internalReference;
    protected $paymentMethod;
    protected $paymentMethodName;
    protected $issuerName;
    /**
     * @var Discount
     */
    protected $discount;
    /**
     * @var AmountConversion
     */
    protected $amount;
    protected $authorization;
    protected $receipt;
    protected $franchise;
    protected $refunded = false;
    /**
     * @var NameValuePair[]
     */
    protected $processorFields;

    public function __construct($data = [])
    {
        $this->load($data, ['reference', 'internalReference', 'paymentMethod', 'paymentMethodName', 'issuerName', 'authorization', 'receipt', 'franchise', 'refunded']);

        if (isset($data['status']))
            $this->setStatus($data['status']);

        if (isset($data['amount']))
            $this->setAmount($data['amount']);

        if (isset($data['processorFields']))
            $this->setProcessorFields($data['processorFields']);

        if (isset($data['discount'])) {
            $this->setDiscount($data['discount']);
        }
    }

    public function status()
    {
        return $this->status;
    }

    public function reference()
    {
        return $this->reference;
    }

    public function internalReference()
    {
        return $this->internalReference;
    }

    public function paymentMethod()
    {
        return $this->paymentMethod;
    }

    public function paymentMethodName()
    {
        return $this->paymentMethodName;
    }

    public function issuerName()
    {
        return $this->issuerName;
    }

    public function amount()
    {
        return $this->amount;
    }

    public function authorization()
    {
        return $this->authorization;
    }

    public function receipt()
    {
        return $this->receipt;
    }

    public function franchise()
    {
        return $this->franchise;
    }

    public function processorFields()
    {
        return $this->processorFields;
    }

    public function refunded()
    {
        return $this->refunded;
    }

    public function discount()
    {
        return $this->discount;
    }

    /**
     * Determines if the transaction information its valid, meaning the query was
     * successful not the transaction
     * @return bool
     */
    public function isSuccessful()
    {
        return $this->status() && $this->status()->status() != Status::ST_ERROR;
    }

    /**
     * Determines if the transaction has been approved
     * @return bool
     */
    public function isApproved()
    {
        return $this->status() && $this->status()->status() == Status::ST_APPROVED;
    }

    public function setAmount($amount)
    {
        if (is_array($amount))
            $amount = new AmountConversion($amount);

        if (!($amount instanceof AmountConversion))
            $amount = null;

        $this->amount = $amount;
        return $this;
    }

    public function setDiscount($discount)
    {
        if (is_array($discount)) {
            $discount = new Discount($discount);
        }

        if (!($discount instanceof Discount)) {
            $discount = null;
        }

        $this->discount = $discount;
        return $this;
    }

    /**
     * Sets the amount base as the amount conversion
     * @param $base
     * @return $this
     */
    public function setAmountBase($base)
    {
        if (is_array($base))
            $base = new AmountBase($base);

        if (!($base instanceof AmountBase))
            $base = null;

        $this->amount = (new AmountConversion())->setAmountBase($base);
        return $this;
    }

    public function setProcessorFields($data)
    {
        if (isset($data['item']))
            $data = $data['item'];

        if (is_array($data)) {
            foreach ($data as $nvp) {
                $this->processorFields[] = new NameValuePair($nvp);
            }
        }

        return $this;
    }

    public function processorFieldsToArray()
    {
        if ($this->processorFields()) {
            $fields = [];
            foreach ($this->processorFields() as $field) {
                $fields[] = ($field instanceof NameValuePair) ? $field->toArray() : null;
            }
            return $fields;
        }
        return null;
    }

    /**
     * Parses the processorFields as a key value array
     */
    public function additionalData()
    {
        if ($this->processorFields()) {
            $data = [];
            foreach ($this->processorFields() as $field) {
                $data[$field->keyword()] = $field->value();
            }
            return $data;
        }
        return [];
    }

    public function toArray()
    {
        return [
            'status' => $this->status()->toArray(),
            'internalReference' => $this->internalReference(),
            'paymentMethod' => $this->paymentMethod(),
            'paymentMethodName' => $this->paymentMethodName(),
            'issuerName' => $this->issuerName(),
            'amount' => $this->amount() ? $this->amount()->toArray() : null,
            'authorization' => $this->authorization(),
            'reference' => $this->reference(),
            'receipt' => $this->receipt(),
            'franchise' => $this->franchise(),
            'refunded' => $this->refunded(),
            'discount' => $this->discount() ? $this->discount()->toArray() : null,
            'processorFields' => $this->processorFieldsToArray(),
        ];
    }

}