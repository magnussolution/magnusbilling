<?php

namespace Gerencianet\Exception;

use Exception;

class AuthorizationException extends Exception
{
    private $status;
    private $reason;
    private $body;

    public function __construct($status, $reason, $body = null)
    {
        $this->status = $status;
        $this->reason = $reason;
        $this->body = $body;
        parent::__construct($reason, $status);
    }

  public function __toString()
  {
      return 'Authorization Error '.$this->status.': '.$this->message."\n";
  }
}
