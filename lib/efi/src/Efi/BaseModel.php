<?php

namespace Efi;

class BaseModel
{
	protected $properties = [];

    /**
     * Magic method to get the value of a property.
     *
     * @param string $property The name of the property.
     * @return mixed|null The value of the property, or null if it doesn't exist.
     */
    public function __get(string $property)
    {
        if (array_key_exists($property, $this->properties)) {
            return $this->properties[$property];
        }

        if (property_exists($this, $property)) {
            return $this->$property;
        }

        return null;
    }

    /**
     * Magic method to set the value of a property.
     *
     * @param string $property The name of the property.
     * @param mixed $value The value to set.
     */
    public function __set(string $property, $value)
    {
        if (property_exists($this, $property)) {
            $this->$property = $value;
        }
        
        $this->properties[$property] = $value;
    }
}
