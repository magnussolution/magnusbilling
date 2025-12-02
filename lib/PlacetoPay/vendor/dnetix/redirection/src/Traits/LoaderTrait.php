<?php


namespace Dnetix\Redirection\Traits;


trait LoaderTrait
{

    public function load($data, $keys)
    {
        if ($data && is_array($data)) {
            foreach ($keys as $key) {
                if (isset($data[$key])) {
                    $this->$key = $data[$key];
                }
            }
        }
    }

}