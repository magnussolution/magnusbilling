<?php
/**
* ICEPAY Library for PHP
* (c) 2009 ICEPAY
*
* This file contains the ICEPAY Library for PHP.
*
* @author ICEPAY.eu (support@icepay.eu)
* @version 1.0.5
*/
class ICEPAY_iDEAL extends ICEPAY
{
	public function Pay( $issuer = NULL, $amount = NULL, $description = NULL, $orderID = NULL )
	{
		$this->assignIssuer		( $issuer );
		$this->country			= 'NL';
		$this->language			= 'NL';
		$this->currency			= 'EUR';
		$this->assignAmount		( $amount );
		$this->description		= $description;
		$this->paymentMethod 	= 'IDEAL';
		$this->orderID = $orderID;

		return $this->postRequest( $this->basicMode(), $this->prepareParameters() );
	}
}

?>