<?php


namespace Dnetix\Redirection\Traits;


trait ValidatorTrait
{
    private $validatorInstance;

    public function getValidator()
    {
        if (!$this->validatorInstance)
            $this->validatorInstance = new $this->validator();
        return $this->validatorInstance;
    }

    /**
     * Validates if this entity contains the required information
     * @param null $fields
     * @param bool $silent
     * @return bool
     */
    public function isValid(&$fields = null, $silent = true)
    {
        return $this->getValidator()->isValid($this, $fields, $silent);
    }

    /**
     * Verifies if the object has all the values required, returns those who are lacking
     * @param array $requiredFields
     * @return array|bool
     */
    public function checkMissingFields($requiredFields = [])
    {
        $missing = [];
        foreach ($requiredFields as $field) {
            if (empty($this->$field))
                $missing[] = $field;
        }

        return sizeof($missing) > 0 ? $missing : false;
    }

}