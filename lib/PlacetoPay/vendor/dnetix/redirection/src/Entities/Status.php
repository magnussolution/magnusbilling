<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;

class Status extends Entity
{
    const ST_OK = 'OK';
    const ST_FAILED = 'FAILED';
    const ST_APPROVED = 'APPROVED';
    const ST_APPROVED_PARTIAL = 'APPROVED_PARTIAL';
    const ST_REJECTED = 'REJECTED';
    const ST_PENDING = 'PENDING';
    const ST_PENDING_VALIDATION = 'PENDING_VALIDATION';
    const ST_REFUNDED = 'REFUNDED';
    const ST_ERROR = 'ERROR';
    const ST_UNKNOWN = 'UNKNOWN';

    /**
     * @var string
     */
    protected $status;
    /**
     * @var string
     */
    protected $reason;
    /**
     * @var string
     */
    protected $message;
    protected $date;

    protected static $STATUSES = [
        self::ST_OK,
        self::ST_FAILED,
        self::ST_APPROVED,
        self::ST_APPROVED_PARTIAL,
        self::ST_REJECTED,
        self::ST_PENDING,
        self::ST_PENDING_VALIDATION,
        self::ST_ERROR,
        self::ST_UNKNOWN,
    ];

    public function __construct($data = [])
    {
        foreach ($data as $key => $value) {
            $this->$key = $value;
        }
    }

    public function status()
    {
        return $this->status;
    }

    public function reason()
    {
        return $this->reason;
    }

    public function message()
    {
        return $this->message;
    }

    public function date()
    {
        return $this->date;
    }

    public function isFailed()
    {
        return $this->status() == self::ST_FAILED;
    }

    public function isSuccessful()
    {
        return $this->status() == self::ST_OK;
    }

    public function isApproved()
    {
        return $this->status() == self::ST_APPROVED;
    }

    public function isRejected()
    {
        return $this->status() == self::ST_REJECTED;
    }

    public function isError()
    {
        return $this->status() == self::ST_ERROR;
    }

    public static function validStatus($status = null)
    {
        if ($status) {
            return in_array($status, self::$STATUSES);
        }
        return self::$STATUSES;
    }

    public function toArray()
    {
        return [
            'status' => $this->status(),
            'reason' => $this->reason(),
            'message' => $this->message(),
            'date' => $this->date(),
        ];
    }

}