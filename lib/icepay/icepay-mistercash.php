<?php
/**
* ICEPAY Library for PHP
* (c) 2009 ICEPAY
*
* This file contains the ICEPAY Library for PHP.
*
* @author ICEPAY.eu (support@icepay.eu)
* @version 1.1.2
*/
class ICEPAY_MisterCash extends ICEPAY
{
	public function Pay( $country = NULL, $language = NULL, $amount = NULL, $description = NULL , $orderID = NULL)
	{
		$this->issuer 			= 'MISTERCASH';
		$this->assignCountry	( $country );
		$this->assignLanguage	( $language );
		$this->currency			= 'EUR';
		$this->assignAmount		( $amount );
		$this->description		= $description;
		$this->paymentMethod 	= 'MISTERCASH';
		$this->orderID = $orderID;

		return $this->postRequest( $this->basicMode(), $this->prepareParameters() );
	}
}

?>