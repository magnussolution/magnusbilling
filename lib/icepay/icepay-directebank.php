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
class ICEPAY_DirectEBank extends ICEPAY
{
	public function Pay( $country = NULL, $language = NULL, $currency = NULL, $amount = NULL, $description = NULL, $orderID = NULL )
	{
		$this->issuer			= '';
		$this->assignCountry	( $country );
		$this->assignLanguage	( $language );
		$this->assignCurrency	( $currency );
		$this->assignAmount		( $amount );
		$this->description		= $description;
		$this->paymentMethod	= 'DIRECTEBANK';
		$this->orderID = $orderID;

		return $this->postRequest( $this->basicMode(), $this->prepareParameters() );
	}
}

?>