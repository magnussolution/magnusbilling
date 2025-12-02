<?php

/**
 *
 */
class CSVInterpreter
{
    private $filename;
    private $errors = [];
    private $delimiter;
    private $enclosure;
    private $escape;
    private $columns;

    public function __construct($filename, $delimiter = ",", $enclosure = "\"", $escape = "/")
    {
        if (file_exists($filename)) {
            $handle = fopen($filename, 'r');
            if (($line1 = fgets($handle)) !== false) {
                $this->columns = explode($delimiter, trim($line1));
            } else {
                $this->addError('The file cannot be read');
            }
            fclose($handle);

        } else {
            $this->addError('File not found');
        }

        $this->filename  = $filename;
        $this->delimiter = $delimiter;
        $this->enclosure = $enclosure;
        $this->escape    = $escape;
    }

    public function toArray()
    {
        $result = $this->getResultArray();

        return (count($this->errors) <= 0) ? $result : false;
    }

    private function getResultArray()
    {

        return ['columns' => $this->columns,
            'filename'        => $this->filename,
            'boundaries'      => [
                'delimiter' => $this->delimiter,
                'enclosure' => $this->enclosure,
                'escape'    => $this->escape,
            ],
        ];
    }

    private function addError($description)
    {
        $this->errors[] = $description;
    }

    public function getErrors()
    {
        return $this->errors;
    }

}
