<?php


namespace Dnetix\Redirection\Message;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Entities\Status;
use Dnetix\Redirection\Entities\SubscriptionInformation;
use Dnetix\Redirection\Entities\Transaction;
use Dnetix\Redirection\Traits\StatusTrait;

class RedirectInformation extends Entity
{
    use StatusTrait;

    public $requestId;
    /**
     * @var RedirectRequest
     */
    public $request;
    /**
     * @var Transaction[]
     */
    public $payment;
    /**
     * @var SubscriptionInformation
     */
    public $subscription;

    public function __construct($data = [])
    {
        if (isset($data['requestId']))
            $this->requestId = $data['requestId'];

        $this->setStatus($data['status']);

        if (isset($data['request']))
            $this->setRequest($data['request']);

        if (isset($data['payment']))
            $this->setPayment($data['payment']);

        if (isset($data['subscription']))
            $this->setSubscription($data['subscription']);
    }

    public function requestId()
    {
        return $this->requestId;
    }

    /**
     * @return Status
     */
    public function status()
    {
        return $this->status;
    }

    /**
     * @return RedirectRequest
     */
    public function request()
    {
        return $this->request;
    }

    /**
     * @return Transaction[]
     */
    public function payment()
    {
        return $this->payment;
    }

    /**
     * @return SubscriptionInformation
     */
    public function subscription()
    {
        return $this->subscription;
    }

    public function setRequest($request)
    {
        if (is_array($request))
            $request = new RedirectRequest($request);
        $this->request = $request;
        return $this;
    }

    public function setPayment($payments)
    {
        if ($payments) {
            $this->payment = [];

            if (isset($payments['transaction']) && $payments['transaction'])
                $payments = $payments['transaction'];

            foreach ($payments as $payment) {
                $this->payment[] = new Transaction($payment);
            }
        }
        return $this;
    }

    /**
     * @param SubscriptionInformation|array $subscription
     * @return $this
     */
    public function setSubscription($subscription)
    {
        if (is_array($subscription))
            $subscription = new SubscriptionInformation($subscription);

        if (!($subscription instanceof SubscriptionInformation))
            $subscription = null;

        $this->subscription = $subscription;
        return $this;
    }

    private function paymentToArray()
    {
        if (!$this->payment() || !is_array($this->payment()))
            return null;

        $payments = [];
        foreach ($this->payment() as $payment) {
            $payments[] = $payment->toArray();
        }
        return $payments ?: null;
    }

    public function isSuccessful()
    {
        return $this->status()->status() != Status::ST_ERROR;
    }

    // Helpers

    public function isApproved()
    {
        return $this->status()->status() == Status::ST_APPROVED;
    }

    public function lastApprovedTransaction()
    {
        return $this->lastTransaction(true);
    }

    /**
     * Obtains the last transaction made to the session
     * @param bool $approved
     * @return Transaction
     */
    public function lastTransaction($approved = false)
    {
        $transactions = $this->payment();
        if (is_array($transactions) && sizeof($transactions) > 0) {
            if ($approved) {
                while ($transaction = array_shift($transactions)) {
                    if ($transaction->isApproved()) {
                        return $transaction;
                    }
                }
            } else {
                return $transactions[0];
            }
        }
        return null;
    }

    /**
     * Returns the last authorization associated with the session
     */
    public function lastAuthorization()
    {
        if ($this->lastApprovedTransaction()) {
            return $this->lastApprovedTransaction()->authorization();
        }
        return null;
    }

    public function toArray()
    {
        return array_filter([
            'requestId' => $this->requestId(),
            'status' => $this->status() ? $this->status()->toArray() : null,
            'request' => $this->request() ? $this->request()->toArray() : null,
            'payment' => $this->paymentToArray(),
            'subscription' => $this->subscription() ? $this->subscription()->toArray() : null,
        ]);
    }
}