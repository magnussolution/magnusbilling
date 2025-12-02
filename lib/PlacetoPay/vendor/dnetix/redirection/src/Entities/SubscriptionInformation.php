<?php

namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;

class SubscriptionInformation extends Entity
{
    /**
     * The type of this subscription could be token or account for the time being
     * @var string
     */
    public $type;
    /**
     * @var Status
     */
    public $status;
    /**
     * @var NameValuePair[]
     */
    public $instrument;

    public function __construct($data)
    {
        if (isset($data['type']))
            $this->type = $data['type'];

        if (isset($data['status']))
            $this->setStatus($data['status']);

        if (isset($data['instrument']))
            $this->setInstrument($data['instrument']);
    }

    public function type()
    {
        return $this->type;
    }

    public function status()
    {
        return $this->status;
    }

    public function instrument()
    {
        return $this->instrument;
    }

    public function setInstrument($instrumentData)
    {
        $this->instrument = [];
        if (isset($instrumentData['item']))
            $instrumentData = $instrumentData['item'];

        foreach ($instrumentData as $nvp) {
            if (is_array($nvp))
                $nvp = new NameValuePair($nvp);

            if ($nvp instanceof NameValuePair)
                $this->instrument[] = $nvp;
        }
        return $this;
    }

    public function instrumentToArray()
    {
        if ($this->instrument()) {
            $instrument = [];
            foreach ($this->instrument() as $field) {
                $instrument[] = ($field instanceof NameValuePair) ? $field->toArray() : null;
            }
            return $instrument;
        }
        return null;
    }

    /**
     * Parses the instrument as the proper entity, Keep in mind that can be null
     * if no instrument its provided
     * @return Account|Token|null
     */
    public function parseInstrument()
    {
        $instrumentNVP = $this->instrument();
        if (!$instrumentNVP)
            return null;

        $data = [
            'status' => $this->status(),
        ];
        foreach ($instrumentNVP as $nvp) {
            $data[$nvp->keyword()] = $nvp->value();
        }

        if ($this->type() == 'token') {
            return new Token($data);
        } elseif ($this->type() == 'account') {
            return new Account($data);
        }
        return null;
    }

    public function toArray()
    {
        return array_filter([
            'type' => $this->type(),
            'status' => $this->status(),
            'instrument' => $this->instrumentToArray(),
        ]);
    }
}