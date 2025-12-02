<?php

namespace Efi;

/**
 * Class for success responses in the Efí SDK.
 */
class Response
{
    public $body;
    public $headers;

    /**
     * Initializes a new instance of the Efi Response class.
     *
     * @param $body The body informations of response.
     * @param array $headers The headers informations of response.
     */
    public function __construct($body, array $headers) {
        $this->body = $body;
        $this->headers = $headers;
    }

    /**
     * Magic getter method to access the properties of the exception.
     *
     * @param string $property The property name.
     * @return mixed|null The value of the property or null if it doesn't exist.
     */
    public function __get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }

        return null;
    }
}
