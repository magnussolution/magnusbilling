<?php
/**
* ICEPAY Library for PHP
* (c) 2009 ICEPAY
*
* This file contains the ICEPAY Library for PHP.
*
* @author ICEPAY.eu (support@icepay.eu)
* @version 1.0
*/
class ICEPAY_CC extends ICEPAY
{
	public function Pay( $issuer = NULL, $language = NULL, $currency = NULL, $amount = NULL, $description = NULL, $orderID = NULL )
	{
		$issuer = strtoupper( $issuer );

		$this->assignIssuer		( $issuer );
		$this->country			= "00";
		$this->assignLanguage	( $language );
		$this->assignCurrency	( $currency );
		$this->assignAmount		( $amount );
		$this->description		= $description;
		$this->paymentMethod	= "CREDITCARD";
		$this->orderID = $orderID;

		return $this->postRequest( $this->basicMode(), $this->prepareParameters() );
	}
	
}

?>