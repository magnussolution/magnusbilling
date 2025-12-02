<?php


namespace Dnetix\Redirection\Traits;


use Dnetix\Redirection\Entities\NameValuePair;

trait FieldsTrait
{
    /**
     * @var NameValuePair[]
     */
    protected $fields;

    /**
     * @return NameValuePair[]
     */
    public function fields()
    {
        return $this->fields;
    }

    public function setFields($fieldsData)
    {
        if (is_array($fieldsData)) {
            $this->fields = [];
            foreach ($fieldsData as $nvp) {
                if (is_array($nvp))
                    $nvp = new NameValuePair($nvp);

                if ($nvp instanceof NameValuePair)
                    $this->fields[] = $nvp;
            }
        }
        return $this;
    }

    public function fieldsToArray()
    {
        if ($this->fields()) {
            $fields = [];
            foreach ($this->fields() as $field) {
                $fields[] = ($field instanceof NameValuePair) ? $field->toArray() : null;
            }
            return $fields;
        }
        return null;
    }

    public function fieldsToKeyValue($nvps = null)
    {
        if (!$nvps)
            $nvps = $this->fields();

        if ($nvps) {
            $fields = [];
            foreach ($nvps as $field) {
                $fields[$field->keyword()] = $field->value();
            }
            return $fields;
        }
        return null;
    }

    public function addField($nvp)
    {
        if (is_array($nvp))
            $nvp = new NameValuePair($nvp);

        if ($nvp instanceof NameValuePair)
            $this->fields[] = $nvp;

        return $this;
    }

}