<?php


namespace Dnetix\Redirection\Exceptions;


use Exception;

class PlacetoPayException extends Exception
{

    public static function readException(Exception $e)
    {
        return $e->getMessage() . ' ON ' . $e->getFile() . ' LINE ' . $e->getLine() . ' [' . get_class($e) . ']';
    }

}