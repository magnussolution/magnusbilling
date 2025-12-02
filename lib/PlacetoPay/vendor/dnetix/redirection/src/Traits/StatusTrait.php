<?php


namespace Dnetix\Redirection\Traits;


use Dnetix\Redirection\Entities\Status;

trait StatusTrait
{
    /**
     * @var Status
     */
    protected $status;

    /**
     * @return Status
     */
    public function status()
    {
        return $this->status;
    }

}