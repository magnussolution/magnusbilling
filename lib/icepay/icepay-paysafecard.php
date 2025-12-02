<?php
/**
* ICEPAY Library for PHP
* (c) 2011 ICEPAY
*
* This file contains the ICEPAY Library for PHP.
*
* @author ICEPAY.eu (support@icepay.eu)
* @version 1.0
*/
class ICEPAY_PaySafeCard extends ICEPAY
{
	public function Pay( $currency = NULL, $amount = NULL, $description = NULL, $orderID = NULL )
	{
		$this->assignIssuer		= "DEFAULT";
		$this->country			= "00";
		$this->assignLanguage	= "EN";
		$this->assignCurrency	( $currency );
		$this->assignAmount		( $amount );
		$this->description		= $description;
		$this->paymentMethod	= "PAYSAFECARD";
		$this->orderID = $orderID;

		return $this->postRequest( $this->basicMode(), $this->prepareParameters() );
	}
	
}

?>