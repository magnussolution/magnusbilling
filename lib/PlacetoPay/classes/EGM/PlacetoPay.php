<?php
/*
 * PlacetoPay
 * @(#)PlacetoPay.php	3.0.3 2012/01/27
 * @author    Enrique Garcia M. <ingenieria@egm.co>
 * @copyright (c) 2004-2012 EGM Ingenieria sin fronteras S.A.S.
 * @since     Viernes, Septiembre 3, 2004
 */

/**
 * Incluye las librerias para el soporte del GnuPG para la encripción de datos
 */
require_once(dirname(__FILE__) . '/egmGnuPG.class.php');

/**
 * Clase para la definición de excepciones
 */
class PlacetoPayException extends Exception { }

/**
 * Clase para el procesamiento de pagos a traves de PlacetoPay.
 * @author    Enrique Garcia M. <ingenieria@egm.co>
 * @copyright (c) 2004-2012 EGM Ingenieria sin fronteras S.A.S.
 * @since     Miercoles, Febrero 25, 2004
 */
class PlacetoPay
{
	/**
	 * Define la version de trama usada por el componente
	 * @internal
	 */
	const VERSION = '2.0.2';

	/**
	 * URL completa del script a donde se remite para el pago por interfaz
	 * @internal
	 */
	const PAYMENT_URL = 'https://www.placetopay.com/payment.php';

	/**
	 * URL completa del servicio Web encargado de dar respuesta a la consulta de transacciones
	 * @internal
	 */
	const PAYMENT_WS_URL = 'https://www.placetopay.com/webservice.php';

	/**
	 * URL completa del servicio Web encargado de dar respuesta a la verificacion del precobro
	 * @internal
	 */
	const PRECHARGE_WS_URL = 'https://www.placetopay.com/webservices/precharge.php';

	/* Constantes con el resultado de una transaccion */

	/**
	 * Indicador de transaccion fallida
	 */
	const P2P_ERROR = 0;

	/**
	 * Indicador de transaccion exitosa
	 */
	const P2P_APPROVED = 1;

	/**
	 * Indicador de transaccion declinada
	 */
	const P2P_DECLINED = 2;

	/**
	 * Indicador de transaccion pendiente
	 */
	const P2P_PENDING = 3;

	/**
	 * Indicador de transaccion duplicada (previamente aprobada)
	 */
	const P2P_DUPLICATE = 4;

	/**
	 * Indicador de transaccion pendiente validacion precobro
	 */
	const P2P_PENDING_VALIDATE_PRECHARGE = 5;

	/**
	 * Referencia para el pago
	 * @access private
	 * @var string
	 */
	private $reference;

	/**
	 * Moneda usada para el pago
	 * @access private
	 * @var string
	 */
	private $currency;

	/**
	 * Idioma usado para las plantillas
	 * @access private
	 * @var string
	 */
	private $language;

	/**
	 * Valor total a pagar, incluye impuestos
	 * @access private
	 * @var string
	 */
	private $totalAmount;

	/**
	 * Valor del impuesto incluido en el pago
	 * @access private
	 * @var string
	 */
	private $taxAmount;

	/**
	 * Valor base para la devolución del impuesto, este valor solo aplica para
	 * impuestos del 10% y 16% en Colombia y no para todos los proveedores, en
	 * ningun caso podrá superar sumado al impuesto el valor total a pagar, para
	 * compras no gravadas el valor deberá ser cero
	 * @access private
	 * @var string
	 */
	private $devolutionBaseAmount;

	/**
	 * Valor del servicio cobrado por las agencias de viajes
	 * @access private
	 * @var double
	 */
	private $serviceFeeAmount;

	/**
	 * Impuesto de la tasa administrativa para las agencias de viajes
	 * @access private
	 * @var double
	 */
	private $serviceFeeTax;

	/**
	 * La base de devolución del impuesto de la tasa administrativa para las agencias de viajes
	 * @access private
	 * @var double
	 */
	private $serviceFeeDevolutionBase;

	/**
	 * El código de la agencia para el reconocimiento de la tasa administrativa
	 * @access private
	 * @var string
	 */
	private $serviceFeeCode;

	/**
	 * El código de la aerolínea para la compensación del tiquete
	 * @access private
	 * @var string
	 */
	private $airlineCode;

	/**
	 * Impuesto o tasa aeroportuaria
	 * @access private
	 * @var double
	 */
	private $airportTax;

	/**
	 * Identificación del comercio para el pagador
	 * @access private
	 * @var string
	 */
	private $payerID;
	
	/**
	 * Tipo de identificación del comercio para el pagador [CC, CE, TI, PPN, NIT, COD] 
	 * @access private
	 * @var string
	 */
	private $payerIDType;

	/**
	 * Nombre del completo del pagador
	 * @access private
	 * @var string
	 */
	private $payerName;

	/**
	 * Dirección de correo electrónica para notificaciones al pagador
	 * @access private
	 * @var string
	 */
	private $payerEmail;
	
	/**
	 * Dirección física del pagador
	 * @access private
	 * @var string
	 */
	private $payerAddress;

	/**
	 * Ciudad que aplica a la dirección física del pagador
	 * @access private
	 * @var string
	 */
	private $payerCity;

	/**
	 * Estado o provincia que aplica a la dirección física del pagador
	 * @access private
	 * @var string
	 */
	private $payerState;

	/**
	 * Código internacional del país que aplica a la dirección física del pagador acorde a ISO 3166-1
	 * @link http://www.iso.org/iso/english_country_names_and_code_elements
	 * @access private
	 * @var string
	 */
	private $payerCountry;

	/**
	 * Número telefónico del pagador
	 * @access private
	 * @var string
	 */
	private $payerPhone;
	
	/**
	 * Número del celular del pagador
	 * @access private
	 * @var string
	 */
	private $payerMobile;
	
	/**
	 * Identificación del comercio para el comprador
	 * @access private
	 * @var string
	 */
	private $buyerID;
	
	/**
	 * Tipo de identificación del comercio para el comprador [CC, CE, TI, PPN, NIT, COD] 
	 * @access private
	 * @var string
	 */
	private $buyerIDType;

	/**
	 * Nombre del completo del comprador
	 * @access private
	 * @var string
	 */
	private $buyerName;

	/**
	 * Dirección de correo electrónica para notificaciones al comprador
	 * @access private
	 * @var string
	 */
	private $buyerEmail;
	
	/**
	 * Dirección física del comprador
	 * @access private
	 * @var string
	 */
	private $buyerAddress;

	/**
	 * Ciudad que aplica a la dirección física del comprador
	 * @access private
	 * @var string
	 */
	private $buyerCity;

	/**
	 * Estado o provincia que aplica a la dirección física del comprador
	 * @access private
	 * @var string
	 */
	private $buyerState;

	/**
	 * Código internacional del país que aplica a la dirección física del comprador acorde a ISO 3166-1
	 * @link http://www.iso.org/iso/english_country_names_and_code_elements
	 * @access private
	 * @var string
	 */
	private $buyerCountry;

	/**
	 * Número telefónico del comprador
	 * @access private
	 * @var string
	 */
	private $buyerPhone;
	
	/**
	 * Número del celular del comprador
	 * @access private
	 * @var string
	 */
	private $buyerMobile;

	/**
	 * Datos adicionales dados por el comercio, no usados por la plataforma
	 * @access private
	 * @var string
	 */
	private $extraData;
	
	/**
	 * Datos adicionales de control para la transaccion, dados en la forma nombre, valor
	 * @access private
	 * @var array
	 */
	private $additionalData;

	/**
	 * Datos para la compensación del pago, cuando se distribuye en nombre de
	 * terceros
	 * @access private
	 * @var string
	 */
	private $compensation;

	/**
	 * URL completa a la cual debe enviarse la respuesta del pago, en caso que
	 * se desee sobreescribir la establecida en la plataforma
	 * @access private
	 * @var string
	 */
	private $overrideReturn;

	/**
	 * Indicador de si el pago es recurrente o no
	 * @access private
	 * @var boolean
	 */
	private $isRecurrent;

	/**
	 * Periodicidad del pago recurrente expresado en [Y = años, M = meses, D = Dias]
	 * @access private
	 * @var string
	 */
	private $recurrentPeriodicity;

	/**
	 * Intervalo de aplicación a la periodicidad
	 * @access private
	 * @var int
	 */
	private $recurrentInterval;

	/**
	 * Fecha máxima hasta la cual se aplica el pago recurrente, debe ser una fecha válida
	 * o UNLIMITED, si se especifica un número de períodos la recurrencia se hará al menor
	 * valor
	 * @access private
	 * @var string
	 */
	private $recurrentDueDate;

	/**
	 * Número máximo de períodos para el pago recurrente, si se especifica una fecha máxima
	 * para el pago recurrente, la recurrencia se hará al menor valor entre ambos
	 * @access private
	 * @var int
	 */
	private $recurrentMaxPeriods;

	/**
	 * Franquicia elegida para el pago
	 * @access private
	 * @var string
	 */
	private $franchise;

	/**
	 * Nombre de la franquicia elegida para el pago
	 * @access private
	 * @var string
	 */
	private $franchiseName;

	/**
	 * Número de autorización de la transacción dado por la entidad financiera
	 * @access private
	 * @var string
	 */
	private $authorization;

	/**
	 * Número de recibo o comprobante de la transacción dado por la entidad financiera
	 * @access private
	 * @var string
	 */
	private $receipt;

	/**
	 * Fecha y hora de la transacción
	 * @access private
	 * @var string
	 */
	private $transactionDate;

	/**
	 * Número de tarjeta de crédito usada en la transacción
	 * @access private
	 * @var string
	 */
	private $creditCardNumber;

	/**
	 * Moneda con la cual fue realizado el pago acorde a la entidad financiera
	 * @access private
	 * @var string
	 */
	private $bankCurrency;

	/**
	 * Nombre del banco con el cual se realizó la transacción
	 * @access private
	 * @var string
	 */
	private $bankName;

	/**
	 * Valor real pagado en la moneda aceptada por la entidad financiera
	 * @access private
	 * @var string
	 */
	private $bankTotalAmount;

	/**
	 * Factor de conversión usado por la entidad financiera
	 * @access private
	 * @var string
	 */
	private $bankConversionFactor;

	/**
	 * Código interno del error retornado por la entidad financiera
	 * @access private
	 * @var string
	 */
	private $errorCode;

	/**
	 * Mensaje detallado del error retornado por la entidad financiera
	 * @access private
	 * @var string
	 */
	private $errorMessage;

	/**
	 * Directorio en donde se halla el repositorio de llaves
	 * @access private
	 * @var string
	 */
	private $gpgHomeDirectory;

	/**
	 * Ubicación del archivo ejecutable del GnuPG
	 * @access private
	 * @var string
	 */
	private $gpgProgramPath;

	/**
	 * Código interno del error retornado por la entidad financiera para la Tasa Administrativa
	 * @access private
	 * @var string
	 */
	private $errorCodeTA;

	/**
	 * Mensaje detallado del error retornado por la entidad financiera para la Tasa Administrativa
	 * @access private
	 * @var string
	 */
	private $errorMessageTA;

	/**
	 * Número de autorización de la transacción dado por la entidad financiera para la Tasa Administrativa
	 * @access private
	 * @var string
	 */
	private $authorizationTA;

	/**
	 * Número de recibo o comprobante de la transacción dado por la entidad financiera para la Tasa Administrativa
	 * @access private
	 * @var string
	 */
	private $receiptTA;
	
	function __construct()
	{
		$this->currency = 'COP';
		$this->language = 'ES';
		
		$this->payerID = '';
		$this->payerIDType = '';
		$this->payerName = '';
		$this->payerEmail = '';
		$this->payerAddress = '';
		$this->payerCity = '';
		$this->payerState = '';
		$this->payerCountry = '';
		$this->payerPhone = '';
		$this->payerMobile = '';
		
		$this->buyerID = '';
		$this->buyerIDType = '';
		$this->buyerName = '';
		$this->buyerEmail = '';
		$this->buyerAddress = '';
		$this->buyerCity = '';
		$this->buyerState = '';
		$this->buyerCountry = '';
		$this->buyerPhone = '';
		$this->buyerMobile = '';
		
		$this->extraData = '';
		$this->additionalData = array();
		$this->compensation = '';
		$this->overrideReturn = '';
		
		$this->devolutionBaseAmount = '0';
		
		$this->serviceFeeAmount = 0;
		$this->serviceFeeTax = 0;
		$this->serviceFeeDevolutionBase = 0;
		$this->serviceFeeCode = '';
		$this->airlineCode = '';
		$this->airportTax = 0;
		
		$this->isRecurrent = false;
		$this->recurrentPeriodicity = 'Y';
		$this->recurrentInterval = 1;
		$this->recurrentDueDate = 'UNLIMITED';
		$this->recurrentMaxPeriods = -1;
	}

	/**
	 * Retorna la version del componente
	 * @return string
	 */
	function getVersion()
	{
		return 'PlacetoPay PHP Component ' . self::VERSION;
	}

	/**
	 * Establece el directorio donde se encuentra el ejecutable del GnuPG
	 * @param string $file
	 */
	function setGPGProgramPath($file)
	{
		$this->gpgProgramPath = $file;
	}

	/**
	 * Establece el directorio donde se encuentra el keyring del GnuPG.
	 * @param string $directory
	 */
	function setGPGHomeDirectory($directory)
	{
		$this->gpgHomeDirectory = $directory;
	}

	/**
	 * Obtiene el numero de referencia que origina la transaccion
	 * @return string
	 */
	function getReference()
	{
		return $this->reference;
	}

	/**
	 * Obtiene la moneda usada para el pago
	 * @return string
	 */
	function getCurrency()
	{
		return $this->currency;
	}

	/**
	 * Establece la moneda original para el pago
	 * @param string $currency
	 */
	function setCurrency($currency)
	{
		$this->currency = strtoupper($currency);
	}

	/**
	 * Establece el idioma para la plataforma
	 * @param string $language
	 */
	function setLanguage($language)
	{
		$this->language = strtoupper($language);
	}

	/**
	 * Obtiene el idioma usado para la operacion
	 * @return string
	 */
	function getLanguage()
	{
		return $this->language;
	}

	/**
	 * Obtiene el total de la compra incluido el IVA
	 * @return string
	 */
	function getTotalAmount()
	{
		return $this->totalAmount;
	}

	/**
	 * Obtiene el IVA de la compra
	 * @return string
	 */
	function getTaxAmount()
	{
		return $this->taxAmount;
	}

	/**
	 * Obtiene la moneda usada por la entidad financiera para procesar la transacción
	 * @return string
	 */
	function getPlatformCurrency()
	{
		return $this->bankCurrency;
	}

	/**
	 * Obtiene el total de la compra incluido el IVA acorde a la moneda usada por la entidad financiera
	 * @return string
	 */
	function getPlatformTotalAmount()
	{
		return $this->bankTotalAmount;
	}

	/**
	 * Obtiene el factor de conversión usado por la entidad financiera
	 * @return string
	 */
	function getPlatformConversionFactor()
	{
		return $this->bankConversionFactor;
	}

	/**
	 * Retorna el nombre del comprador/pagador
	 * @return string
	 */
	function getShopperName()
	{
		return $this->payerName;
	}

	/**
	 * Establece el nombre del comprador/pagador
	 * @param string $name
	 * @deprecated
	 */
	function setShopperName($name)
	{
		$this->payerName = (empty($name) ? '': $name);
	}

	/**
	 * Retorna el correo electronico del comprador/pagador
	 * @return string
	 */
	function getShopperEmail()
	{
		return $this->payerEmail;
	}

	/**
	 * Establece el correo electronico del comprador/pagador
	 * @param string $email
	 * @deprecated
	 */
	function setShopperEmail($email)
	{
		$this->payerEmail = (empty($email) ? '': $email);
	}

	/**
	 * Establece los datos del pagador en una sola llamada
	 * @param string $documentType tipo de documento del pagador [CC, CE, TI, PPN, NIT, COD]
	 * @param string $document
	 * @param string $name
	 * @param string $email
	 * @param string $address
	 * @param string $city
	 * @param string $province
	 * @param string $country código del pais acorde a ISO 3166-1
	 * @param string $phone
	 * @param string $mobile
	 * 
	 * @link http://www.iso.org/iso/english_country_names_and_code_elements
	 */
	function setPayerInfo($documentType, $document, $name, $email, $address = '', $city = '', $province = '', $country = '', $phone = '', $mobile = '')
	{
		if (!empty($documentType) && !in_array($documentType, array('CC', 'CE', 'TI', 'PPN', 'NIT', 'COD')))
			throw new PlacetoPayException('El tipo de documento del pagador no es soportado');
		if (!empty($document) && (strlen($document) > 12))
			throw new PlacetoPayException('El número de documento no puede exceder los 12 caracteres');
		if (!empty($country) && (strlen($country) > 2))
			throw new PlacetoPayException('El código del país no puede exceder los 2 caracteres acorde a la codificación ISO 3166-1');
		
		$this->payerIDType = (empty($documentType) ? '': $documentType);
		$this->payerID = (empty($document) ? '': trim($document));
		$this->payerName = (empty($name) ? '': trim($name));
		$this->payerEmail = (empty($email) ? '': trim($email));
		$this->payerAddress = (empty($address) ? '': trim($address));
		$this->payerCity = (empty($city) ? '': trim($city));
		$this->payerState = (empty($province) ? '': trim($province));
		$this->payerCountry = (empty($country) ? '': strtoupper(trim($country)));
		$this->payerPhone = (empty($phone) ? '': trim($phone));
		$this->payerMobile = (empty($mobile) ? '': trim($mobile));
	}
	
	/**
	 * Establece los datos del comprador en una sola llamada
	 * @param string $documentType tipo de documento del comprador [CC, CE, TI, PPN, NIT, COD]
	 * @param string $document
	 * @param string $name
	 * @param string $email
	 * @param string $address
	 * @param string $city
	 * @param string $province
	 * @param string $country código del pais acorde a ISO 3166-1
	 * @param string $phone
	 * @param string $mobile
	 * 
	 * @link http://www.iso.org/iso/english_country_names_and_code_elements
	 */
	function setBuyerInfo($documentType, $document, $name, $email, $address = '', $city = '', $province = '', $country = '', $phone = '', $mobile = '')
	{
		if (!empty($documentType) && !in_array($documentType, array('CC', 'CE', 'TI', 'PPN', 'NIT', 'COD')))
			throw new PlacetoPayException('El tipo de documento del comprador no es soportado');
		if (!empty($document) && (strlen($document) > 12))
			throw new PlacetoPayException('El número de documento no puede exceder los 12 caracteres');
		if (!empty($country) && (strlen($country) > 2))
			throw new PlacetoPayException('El código del país no puede exceder los 2 caracteres acorde a la codificación ISO 3166-1');
		
		$this->buyerIDType = (empty($documentType) ? '': $documentType);
		$this->buyerID = (empty($document) ? '': trim($document));
		$this->buyerName = (empty($name) ? '': trim($name));
		$this->buyerEmail = (empty($email) ? '': trim($email));
		$this->buyerAddress = (empty($address) ? '': trim($address));
		$this->buyerCity = (empty($city) ? '': trim($city));
		$this->buyerState = (empty($province) ? '': trim($province));
		$this->buyerCountry = (empty($country) ? '': strtoupper(trim($country)));
		$this->buyerPhone = (empty($phone) ? '': trim($phone));
		$this->buyerMobile = (empty($mobile) ? '': trim($mobile));
	}

	/**
	 * Establece los datos addicionales para la transaccion, esta información
	 * es privada para el usuario final
	 * @param string $keyword
	 * @param string $value
	 */
	function addAdditionalData($keyword, $value)
	{
		if (empty($keyword) || (strlen($keyword) > 30))
			throw new PlacetoPayException('El nombre de la variable para el dato adicional no puede superar 30 caracteres');
		$this->additionalData[(string)$keyword] = $value;
	}

	/**
	 * Define si el pago es recurrente o no
	 * @param string $periodicity use los valores D - diario, M - mensual, Y - anual
	 * @param int $interval
	 * @param int $periods
	 * @param string $dueDate
	 */
	function setRecurrent($periodicity, $interval, $periods, $dueDate)
	{
		$periodicity = strtoupper($periodicity);
		$dueDate = strtoupper($dueDate);
		$interval = intval($interval);
		$periods = intval($periods);
		if (($periodicity != 'D') && ($periodicity != 'M') && ($periodicity != 'Y'))
			throw new PlacetoPayException('La periodicidad soportada es D[diaria], M[mensual], Y[anual]');
		if (($interval < 1) || ($interval > 99))
			throw new PlacetoPayException('El intervalo para la periodicidad soportada está fuera de rango');
		if (($periods < -1) || ($periods == 0))
			throw new PlacetoPayException('El número de iteraciones del pago debe ser -1 para ilimitado o un número superior a cero');
		if ($dueDate != 'UNLIMITED') {
			$dueDate = @strtotime($dueDate);
			if (($dueDate == -1) || ($dueDate === false))
				throw new PlacetoPayException('La fecha máxima para la recurrencia no pudo ser establecida, use un formato yyyy-mm-dd');
			$dueDate = date('Y-m-d', $dueDate);
		}

		$this->isRecurrent = true;
		$this->recurrentPeriodicity = $periodicity;
		$this->recurrentInterval = $interval;
		$this->recurrentMaxPeriods = $periods;
		$this->recurrentDueDate = $dueDate;
	}

	/**
	 * Retorna los datos adicionales
	 * @return string
	 */
	function getExtraData()
	{
		return $this->extraData;
	}

	/**
	 * Establece la informacion adicional
	 * @param string $extra
	 */
	function setExtraData($extra)
	{
		$this->extraData = (empty($extra) ? '': $extra);
	}

	/**
	 * Establece el codigo de compensacion, solo valido con VBV
	 * @param string $compensation
	 */
	function setCompensation($compensation)
	{
		$this->compensation = (empty($compensation) ? '': $compensation);
	}

	/**
	 * Establece la tasa administrativa para las agencias de viajes
	 * @param double $amount
	 * @param double $tax
	 * @param double $devolutionBase
	 * @param string $code
	 */
	function setServiceFee($amount, $tax = 0, $devolutionBase = 0, $code = '')
	{
		if (!is_numeric($amount) || $amount < 0)
			throw new PlacetoPayException('El valor de la tasa administrativa debe ser un valor numérico');
		if (!is_numeric($tax) || $tax < 0 || $tax > $amount)
			throw new PlacetoPayException('El valor del impuesto asociado a la tasa administrativa debe ser un valor numérico');
		if (!is_numeric($devolutionBase) || $devolutionBase < 0 || $devolutionBase > ($amount - $tax) || ($devolutionBase > 0 && $tax == 0))
			throw new PlacetoPayException('El valor de la base de devolucion del impuesto asociado a la tasa administrativa debe ser un valor numérico no mayor al valor de la tasa y ser cero en caso de que no haya impuesto');

		$this->serviceFeeAmount = $amount;
		$this->serviceFeeTax = $tax;
		$this->serviceFeeDevolutionBase = $devolutionBase;
		$this->serviceFeeCode = $code;
	}

	/**
	 * Establece el código de la aerolinea, solo válido si se especifica la tasa administrativa
	 * @param string $code
	 */
	function setAirlineCode($code)
	{
		$this->airlineCode = $code;
	}

	/**
	 * Establece el valor de la tasa aeroportuaria, solo válido si se especifica la tasa administrativa
	 * @param double $amount
	 */
	function setAirportTax($amount)
	{
		if (!is_numeric($amount) || $amount < 0)
			throw new PlacetoPayException('El valor de la tasa aeroportuaria debe ser un valor numérico');
		$this->airportTax = $amount;
	}

	/**
	 * Establece la ruta a donde debe enviar la trama de respuesta
	 * @param string $returnURL
	 */
	function setOverrideReturn($returnURL)
	{
		$this->overrideReturn = (empty($returnURL) ? '': $returnURL);
	}

	/**
	 * Establece la franquicia predeterminada
	 * @param string
	 */
	function setFranchise($franchise)
	{
		if (!in_array($franchise, array('CR_VS', 'CR_AM', 'CR_DN', 'CR_CR', '_PSE_', 'RM_MC', 'V_VBV')))
			 throw new PlacetoPayException('Se espera un código de franquicia válido');
		$this->franchise = $franchise;
	}

	/**
	 * Retorna la franquicia con la cual se realizo la transaccion
	 * @return string
	 */
	function getFranchise()
	{
		return $this->franchise;
	}

	/**
	 * Retorna el nombre de la franquicia con la cual se realizo la transaccion
	 * @return string
	 */
	function getFranchiseName()
	{
		return $this->franchiseName;
	}

	/**
	 * Retorna el banco con el cual se hizo la transaccion
	 * @return string
	 */
	function getBankName()
	{
		return $this->bankName;
	}

	/**
	 * Retorna el numero de autorizacion de la transaccion
	 * @return string
	 */
	function getAuthorization()
	{
		return $this->authorization;
	}

	/**
	 * Retorna el numero de recibo de la transaccion
	 * @return string
	 */
	function getReceipt()
	{
		return $this->receipt;
	}

	/**
	 * Retorna la fecha y hora de la transaccion
	 * @return string
	 */
	function getTransactionDate()
	{
		return $this->transactionDate;
	}

	/**
	 * Retorna el numero de la tarjeta de credito con la cual se hizo la transaccion
	 * @return string
	 */
	function getCreditCardNumber()
	{
		return $this->creditCardNumber;
	}

	/**
	 * Retorna el codigo de error de la transaccion
	 * @return string
	 */
	function getErrorCode()
	{
		return $this->errorCode;
	}

	/**
	 * Retorna el mensaje de error de la transaccion
	 * @return string
	 */
	function getErrorMessage()
	{
		return $this->errorMessage;
	}

	/**
	 * Retorna el codigo de error de la transaccion de Tasa Administrativa
	 * @return string
	 */
	function getErrorCodeTA()
	{
		return $this->errorCodeTA;
	}

	/**
	 * Retorna el mensaje de error de la transaccion de Tasa Administrativa
	 * @return string
	 */
	function getErrorMessageTA()
	{
		return $this->errorMessageTA;
	}

	/**
	 * Retorna el numero de autorizacion de la transaccion de Tasa Administrativa
	 * @return string
	 */
	function getAuthorizationTA()
	{
		return $this->authorizationTA;
	}

	/**
	 * Retorna el numero de recibo de la transaccion de Tasa Administrativa
	 * @return string
	 */
	function getReceiptTA()
	{
		return $this->receiptTA;
	}

	/**
	 * Construye la petición de pago retornando la trama encriptada
	 * @access private
	 * @param string $keyID
	 * @param string $passPhrase
	 * @param string $recipientKeyID
	 * @param string $customerSiteID
	 * @param string $reference
	 * @param double $totalAmount
	 * @param double $taxAmount
	 * @param double $devolutionBase
	 * @param string $franchise
	 * @return string
	 */
	private function getPaymentRequest(
		$keyID, $passPhrase, $recipientKeyID,
		$customerSiteID, $reference, $amount,
		$tax, $devolutionBase, $franchise)
	{
		// define el delimitador de la trama
		$delim = chr(1);

		// da formato a las cadenas de valores: los numeros son cadenas cuyos
		// 2 ultimos numeros son los decimales; establece algunos valores acorde a la informacion pasada
		$this->totalAmount = number_format($amount, 2, '.', '');
		$this->taxAmount = number_format($tax, 2, '.', '');
		$this->devolutionBaseAmount = number_format($devolutionBase, 2, '.', '');
		$this->reference = $reference;
		$this->franchise = $franchise;

		// la cadena a ser encriptada para el pago usando la especificacion dada
		// en la version
		$paymentData = self::VERSION . $delim .
			$customerSiteID . $delim .
			$reference . $delim .
			$this->currency . $delim .
			$this->totalAmount . $delim .
			$this->taxAmount . $delim .
			$this->payerName . $delim .
			$this->payerEmail . $delim .
			$this->extraData . $delim .
			$this->overrideReturn . $delim .
			$this->compensation . $delim .
			(empty($franchise) ? '': $franchise) . $delim .
			'' . $delim . // credit card
			'' . $delim . // security code
			'' . $delim . // expiration month
			'' . $delim . // expiration year
			'' . $delim . // periods
			$this->devolutionBaseAmount . $delim .

			($this->isRecurrent ? '1': '0') . $delim .
			($this->isRecurrent ? $this->recurrentPeriodicity: '') . $delim .
			($this->isRecurrent ? $this->recurrentInterval: '') . $delim .
			($this->isRecurrent ? $this->recurrentMaxPeriods: '') . $delim .
			($this->isRecurrent ? $this->recurrentDueDate: '') . $delim .

			($this->serviceFeeAmount < 1 ? '0': number_format($this->serviceFeeAmount, 2, '.', '')) . $delim .
			($this->serviceFeeTax < 1 ? '0': number_format($this->serviceFeeTax, 2, '.', '')) . $delim .
			($this->serviceFeeDevolutionBase < 1 ? '0': number_format($this->serviceFeeDevolutionBase, 2, '.', '')) . $delim .
			(empty($this->serviceFeeCode) ? '': $this->serviceFeeCode) . $delim .
			(empty($this->airlineCode) ? '': $this->airlineCode) . $delim .
			(empty($this->airportTax) ? '0': number_format($this->airportTax, 2, '.', '')) . $delim .
			
			(empty($this->payerIDType) ? '': $this->payerIDType) . $delim .
			(empty($this->payerID) ? '': $this->payerID) . $delim .
			(empty($this->payerAddress) ? '': $this->payerAddress) . $delim .
			(empty($this->payerCity) ? '': $this->payerCity) . $delim .
			(empty($this->payerState) ? '': $this->payerState) . $delim .
			(empty($this->payerCountry) ? '': $this->payerCountry) . $delim .
			(empty($this->payerPhone) ? '': $this->payerPhone) . $delim .
			(empty($this->payerMobile) ? '': $this->payerMobile) . $delim .
			
			(empty($this->buyerIDType) ? '': $this->buyerIDType) . $delim .
			(empty($this->buyerID) ? '': $this->buyerID) . $delim .
			(empty($this->buyerName) ? '': $this->buyerName) . $delim .
			(empty($this->buyerEmail) ? '': $this->buyerEmail) . $delim .
			(empty($this->buyerAddress) ? '': $this->buyerAddress) . $delim .
			(empty($this->buyerCity) ? '': $this->buyerCity) . $delim .
			(empty($this->buyerState) ? '': $this->buyerState) . $delim .
			(empty($this->buyerCountry) ? '': $this->buyerCountry) . $delim .
			(empty($this->buyerPhone) ? '': $this->buyerPhone) . $delim .
			(empty($this->buyerMobile) ? '': $this->buyerMobile);
		
		// agrega los demas datos
		if (!empty($this->additionalData)) {
			foreach($this->additionalData as $k => $v)
				$paymentData .= $delim . $k . $delim . $v;
		}
			
		// instancia el objeto de GnuPG
		$gpg = new egmGnuPG($this->gpgProgramPath, $this->gpgHomeDirectory);
		$paymentData = $gpg->Encrypt($keyID, $passPhrase, $recipientKeyID, $paymentData);
		if (($paymentData == false) || ($paymentData == '')) {
			$this->errorCode    = 'GPG';
			$this->errorMessage = $gpg->error;
			$paymentData        = '';
		}
		return $paymentData;
	}

	/**
	 * Busca un valor como si el dato viniera de una entidad XML
	 *
	 * @param string $entity
	 * @param string $context
	 * @return string
	 */
	private function getEntityValue($entity, $context) {
		$matcher = false;
		if (preg_match('/<' . $entity . '\\s.*>(.*)<\/' . $entity . '>/s', $context, $matcher))
			return $matcher[1];
		return null;
	}

	/**
	 * Retorna los campos ocultos para un formulario
	 *
	 * @param string $keyID
	 * @param string $passPhrase
	 * @param string $recipientKeyID
	 * @param string $customerSiteID
	 * @param string $reference
	 * @param double $totalAmount
	 * @param double $taxAmount
	 * @param double $devolutionBaseAmount
	 * @return string
	 */
	function getPaymentHiddenFields(
		$keyID, $passPhrase, $recipientKeyID,
		$customerSiteID, $reference, $totalAmount,
		$taxAmount, $devolutionBaseAmount = 0)
	{
		$paymentData = $this->getPaymentRequest($keyID, $passPhrase,
			$recipientKeyID, $customerSiteID, $reference, $totalAmount,
			$taxAmount, $devolutionBaseAmount, $this->franchise);
		if (!empty($paymentData)) {
			$paymentData = '<input type="hidden" name="CustomerSiteID" value="' . htmlspecialchars($customerSiteID)
				. '" /><input type="hidden" name="PaymentRequest" value="' . htmlspecialchars($paymentData)
				. '" /><input type="hidden" name="Language" value="' . htmlspecialchars($this->language)
				. '" />';
		}

		return $paymentData;
	}

	/**
	 * Retorna un formulario HTML con el boton para el envio de la trama
	 *
	 * @param string $keyID
	 * @param string $passPhrase
	 * @param string $recipientKeyID
	 * @param string $customerSiteID
	 * @param string $reference
	 * @param double $totalAmount
	 * @param double $taxAmount
	 * @param double $devolutionBaseAmount
	 * @return string
	 */
	function getPaymentButton(
		$keyID, $passPhrase, $recipientKeyID,
		$customerSiteID, $reference, $totalAmount,
		$taxAmount, $devolutionBaseAmount = 0)
	{
		$paymentData = $this->getPaymentHiddenFields($keyID, $passPhrase,
			$recipientKeyID, $customerSiteID, $reference, $totalAmount,
			$taxAmount, $devolutionBaseAmount);
		if (!empty($paymentData))
			$paymentData = '<form id="frmEGM_P2P" method="post" action="' . self::PAYMENT_URL . '">' .
				$paymentData .
				'<input type="submit" name="btnEGMConfirm" value="Pagar con PlacetoPay"/>' .
				'</form>';

		return $paymentData;
	}

	/**
	 * Retorna la URL con el posteo de la información para el pago
	 *
	 * @param string $keyID
	 * @param string $passPhrase
	 * @param string $recipientKeyID
	 * @param string $customerSiteID
	 * @param string $reference
	 * @param double $totalAmount
	 * @param double $taxAmount
	 * @param double $devolutionBaseAmount
	 * @return string
	 */
	function getPaymentRedirect(
		$keyID, $passPhrase, $recipientKeyID,
		$customerSiteID, $reference, $totalAmount,
		$taxAmount, $devolutionBaseAmount = 0)
	{
		$paymentData = $this->getPaymentRequest($keyID, $passPhrase,
			$recipientKeyID, $customerSiteID, $reference, $totalAmount,
			$taxAmount, $devolutionBaseAmount, $this->franchise);
		if (!empty($paymentData)) {
			$paymentData = self::PAYMENT_URL . '?CustomerSiteID=' . urlencode($customerSiteID)
				. '&PaymentRequest=' . urlencode($paymentData)
				. '&Language=' . urlencode($this->language);
		}

		return $paymentData;
	}

	/**
	 * Determina si la respuesta a una transaccion de PlacetoPay es exitosa o no
	 * @return int
	 */
	function getPaymentResponse($keyID, $passPhrase, $paymentResponse)
	{
		// respuesta predeterminada de la funcion
		$ret = self::P2P_ERROR;

		// instancia el objeto de GnuPG
		$gpg = new egmGnuPG($this->gpgProgramPath, $this->gpgHomeDirectory);
		$paymentResponse = $gpg->Decrypt($keyID, $passPhrase, $paymentResponse);
		if (($paymentResponse == false) || ($paymentResponse == '')) {
			$this->errorCode    = 'GPG';
			$this->errorMessage = $gpg->error;
		} else {
			$delim = chr(1);

			// obtiene los valores de la respuesta, los cuales vienen
			// posicionales asi:
			// SIEMPRE:
			// CustomerSiteID, Reference, Currency, TotalAmount, TaxAmount,
			// bankCurrency, bankTotalAmount, TaxAmountCNV,
			// payerName, payerEmail, ExtraData,
			// ErrorCode, ErrorMessage
			// EXITOSA:
			// Franchise, FranchiseName, Authorization, Receipt, Date,
			// CreditCard*, BankName*
			$data = explode($delim, $paymentResponse);

			// obtiene los basicos
			if (count($data) >= 13) {
				$this->reference = $data[1];
				$this->currency = $data[2];
				$this->totalAmount = $data[3];
				$this->taxAmount = $data[4];
				$this->bankCurrency = $data[5];
				$this->bankTotalAmount = $data[6];
				if ($this->totalAmount == $this->bankTotalAmount)
					$this->bankConversionFactor = '1.00';
				elseif ($this->bankTotalAmount == '' || $this->bankTotalAmount == '0.00')
					$this->bankConversionFactor = '0.00';
				else
					$this->bankConversionFactor = number_format(floatval($this->bankTotalAmount) / floatval($this->totalAmount), 2, '.', '');
				$this->payerName = $data[8];
				$this->payerEmail = $data[9];
				$this->extraData = $data[10];
				$this->errorCode = $data[11];
				$this->errorMessage = $data[12];

				// carga las opcionales
				$this->franchise = (isset($data[13]) ? $data[13]: "");
				$this->franchiseName = (isset($data[14]) ? $data[14]: "");
				$this->authorization = (isset($data[15]) ? $data[15]: "");
				$this->receipt = (isset($data[16]) ? $data[16]: "");
				$this->transactionDate = (isset($data[17]) ? $data[17]: "");
				$this->creditCardNumber = (isset($data[18]) ? $data[18]: "");
				$this->bankName = (isset($data[19]) ? $data[19]: "");
				$this->errorCodeTA = (isset($data[20]) ? $data[20]: '');
				$this->errorMessageTA = (isset($data[21]) ? $data[21]: '');
				$this->authorizationTA = (isset($data[22]) ? $data[22]: '');
				$this->receiptTA = (isset($data[23]) ? $data[23]: '');

				// determina la respuesta adecuada
				switch ($this->errorCode) {
					case '00':
						$ret = self::P2P_APPROVED;
						break;
					case '09':
						$ret = self::P2P_DUPLICATE;
						break;
					case '?-':
						$ret = self::P2P_PENDING;
						break;
					case '?5':
						$ret = self::P2P_ERROR;
						break;
					case '?P':
						$ret = self::P2P_PENDING_VALIDATE_PRECHARGE;
						break;
					default:
						$ret = ((substr($this->errorCode, 0, 1) == 'X') ? self::P2P_ERROR: self::P2P_DECLINED);
						break;
				}
			} else {
				$this->errorCode    = 'P2P';
				$this->errorMessage = 'Trama invalida, se espera más información.';
			}
		}
		return $ret;
	}

	/**
	 * Consulta contra el Webservice si un pago fue exitoso o no.
	 *
	 * @param string $customerSiteID
	 * @param string $reference
	 * @param string $currency
	 * @param double $amount
	 * @param string $proxyType
	 * @param string $proxyHost
	 * @param string $proxyPort
	 * @return int
	 */
	function queryPayment($customerSiteID, $reference, $currency, $amount, $proxyType = 'DIRECT', $proxyHost = '', $proxyPort = 0)
	{
		if (!function_exists('curl_init')) {
			$this->errorCode = 'HTTP';
			$this->errorMessage = 'No hay soporte de cURL para realizar la conexion con el Webservice de PlacetoPay';
			return self::P2P_ERROR;
		}

		$soapText =
			'<?xml version="1.0" encoding="UTF-8"?>' .
			'<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="uri:PLACETOPAY" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="urn:PLACETOPAY" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' .
				'<SOAP-ENV:Body>' .
					'<ns1:queryTransaction>' .
						'<request xsi:type="ns2:transactionInfoRequest">' .
							'<siteID xsi:type="xsd:string">' . $customerSiteID . '</siteID>' .
							'<reference xsi:type="xsd:string">' . urlencode($reference) . '</reference>' .
							'<currency xsi:type="xsd:string">' . $currency . '</currency>' .
							'<totalAmount xsi:type="xsd:decimal">' . number_format($amount, 2, '.', '') . '</totalAmount>' .
						'</request>' .
					'</ns1:queryTransaction>' .
				'</SOAP-ENV:Body>' .
			'</SOAP-ENV:Envelope>';

		// si hay un proxy de por medio, haga la conexion con el proxy

		// establece la conexion con el Webservice para consulta de transacciones
		$uc = curl_init();
		curl_setopt($uc, CURLOPT_URL, self::PAYMENT_WS_URL);
		curl_setopt($uc, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($uc, CURLOPT_TIMEOUT, 60);
		curl_setopt($uc, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($uc, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($uc, CURLOPT_POST, 1);
		curl_setopt($uc, CURLOPT_HTTPHEADER, array(
			'Content-type: text/xml; charset=utf-8"',
			'Accept: text/xml',
			'Cache-Control: no-cache',
			'Pragma: no-cache',
			'SOAPAction: uri:PLACETOPAY/queryTransaction'
		));
		curl_setopt($uc, CURLOPT_POSTFIELDS, $soapText);

		// obtiene la respuesta de la solicitud
		$soapText = curl_exec($uc);
		$this->errorMessage = curl_error($uc);
		curl_close($uc);

		// verifica si hubo algun problema de conexion
		if (empty($soapText)) {
			$this->errorCode = 'HTTP';
			$this->errorMessage = 'La conexion con el servicio de pagos no pudo ser llevada a cabo en su totalidad ['
				. $this->errorMessage . ']';
			return self::P2P_ERROR;
		}
		// verifica si hay un SoapFault con lo que simplemente la transaccion no existe
		elseif($this->getEntityValue('faultcode', $soapText)) {
			$this->errorCode = $this->getEntityValue("faultcode", $soapText);
			$this->errorMessage = $this->getEntityValue("faultstring", $soapText);
			return self::P2P_ERROR;
		} else {
			// llena el objeto con los valores retornados por el componente
			$this->reference = $reference;
			$this->totalAmount = number_format($amount, 2, '.', '');
			$this->payerName = $this->getEntityValue('shopperName', $soapText);
			$this->payerEmail = $this->getEntityValue('shopperEmail', $soapText);
			$this->franchise = $this->getEntityValue('franchise', $soapText);
			$this->franchiseName = $this->getEntityValue('franchiseName', $soapText);
			$this->bankName = $this->getEntityValue('bankName', $soapText);
			$this->bankCurrency = $this->getEntityValue('bankCurrency', $soapText);
			$this->bankTotalAmount = $this->getEntityValue('bankTotalAmount', $soapText);
			$this->creditCardNumber = $this->getEntityValue('creditCardNumber', $soapText);
			$this->transactionDate = $this->getEntityValue('transactionDate', $soapText);
			$this->errorCode = $this->getEntityValue('errorCode', $soapText);
			$this->errorMessage = $this->getEntityValue('errorMessage', $soapText);
			$this->authorization = $this->getEntityValue('authorization', $soapText);
			$this->receipt = $this->getEntityValue('receipt', $soapText);
			$this->errorCodeTA = $this->getEntityValue('errorCodeTA', $soapText);
			$this->errorMessageTA = $this->getEntityValue('errorMessageTA', $soapText);
			$this->authorizationTA = $this->getEntityValue('authorizationTA', $soapText);
			$this->receiptTA = $this->getEntityValue('receiptTA', $soapText);
			$this->extraData = $this->getEntityValue('extraData', $soapText);

			if ($this->totalAmount == $this->bankTotalAmount)
				$this->bankConversionFactor = '1.00';
			elseif ($this->bankTotalAmount == '' || $this->bankTotalAmount == '0.00')
				$this->bankConversionFactor = '0.00';
			else
				$this->bankConversionFactor = number_format(floatval($this->bankTotalAmount) / $amount, 2, '.', '');

			//'resultTA' => array('name' => 'resultTA', 'type' => 'xsd:int'),
			return (int)$this->getEntityValue('result', $soapText);
		}
	}
}
