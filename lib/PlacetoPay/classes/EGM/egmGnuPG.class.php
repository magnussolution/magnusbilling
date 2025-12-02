<?php
/***************************************************************************
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 ***************************************************************************/

/**
 * NOTE.
 * ----------------------------------------------------------
 * En general el usuario con el cual se corre el GPG debe tener permisos de
 * escritura sobre el keyring (*.gpg).
 * Para plataformas WINDOWS, esto equivale a decir que el usuario IWAM_/IUSR_
 * dependiendo de si corre como ISAPI/CGI debe tener permisos de modify sobre
 * la carpeta en donde estan los archivos que hacen parte del keyring.
 * Adicionalmente hay que asegurar que el usuario con el cual corre el IIS
 * puede llamar al command, para poder llamar al gpg.exe
 *
 * cacls cmd.exe /E /G MACHINE\IUSR_MACHINE:R
 */

/**
 * Class to interact with the gnuPG.
 *
 * @package   egmGnuPG
 * @author    Enrique Garcia Molina <egarcia@egm.co>
 * @copyright Copyright (c) 2004-2013, EGM Ingenieria sin fronteras S.A.S.
 * @license   http://opensource.org/licenses/gpl-license.php GNU Public License
 * @since     Viernes, Enero 30, 2004
 * @version   $Id: gnuPG.class.php,v 1.0.15 2013-01-15 05:55:00-05 ingenieria Exp $
 */
class egmGnuPG
{
	// Certification / Thrust Level

	/**
	 * Means you make no particular claim as to how carefully you verified the key
	 */
	const CERT_LEVEL_NONE = 0;

	/**
	 * Means you believe the key is owned by the person who claims to own it but you could not, or did not verify the key at all
	 */
	const CERT_LEVEL_PRESUMPTION = 1;

	/**
	 * Means you did casual verification of the key
	 */
	const CERT_LEVEL_CASUAL = 2;

	/**
	 * Means you did extensive verification of the key
	 */
	const CERT_LEVEL_FULL = 3;

	/**
	* the path to gpg executable (default: /usr/local/bin/gpg)
	* @access private
	* @var string
	*/
	private $programPath;

	/**
	* The path to directory where personal gnupg files (keyrings, etc) are stored (default: ~/.gnupg)
	* @access private
	* @var string
	*/
	private $homeDirectory;

	/**
	* Error and status messages
	* @var string
	*/
	public $error;

	/**
	* Create the gnuPG object.
	*
	* Set the program path for the GNUPG and the home directory of the keyring.
	* If this parameters are not specified, according to the OS the function derive the values.
	*
	* @param  string $programPath   Full program path for the GNUPG
	* @param  string $homeDirectory Home directory of the keyring
	* @return void
	*/
	public function __construct($programPath = false, $homeDirectory = false)
	{
		// if is empty then assume the path based in the OS
		if (empty($programPath)) {
			if ( strstr(PHP_OS, 'WIN') )
				$programPath = 'C:\gnupg\gpg';
			else
				$programPath = '/usr/local/bin/gpg';
		} elseif (strpos($programPath, ' ') !== false)
			$programPath = '"' . $programPath . '"';
		$this->programPath = $programPath;

		// if is empty the home directory then assume based in the OS
		if (empty($homeDirectory)) {
			if ( strstr(PHP_OS, 'WIN') )
				$homeDirectory = 'C:\gnupg';
			else
				$homeDirectory = '~/.gnupg';
		} elseif (strpos($homeDirectory, ' ') !== false)
			$homeDirectory = '"' . $homeDirectory . '"';
		$this->homeDirectory = $homeDirectory;

	}

	public function getHomeDirectory()
	{
		return $this->homeDirectory;
	}

	public function getProgramPath()
	{
		return $this->programPath;
	}

	/**
	* Call a subprogram redirecting the standard pipes
	*
	* @access private
	* @param  string $command The full command to execute
	* @param  string $input   The input data
	* @param  string $output  The output data
	* @return bool   true on success, false on error
	*/
	private function _fork_process($command, $input = false, &$output)
	{

		//echo "</br>".$command."</br>";
		// define the redirection pipes
		$descriptorspec = array(
			0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
			1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
			2 => array("pipe", "w")   // stderr is a pipe that the child will write to
		);
		$pipes = null;

		// calls the process
		
		$process = proc_open($command, $descriptorspec, $pipes);
		
		
		if (is_resource($process)) {
			// writes the input
			if (!empty($input)) fwrite($pipes[0], $input);
			fclose($pipes[0]);

			// reads the output
			while (!feof($pipes[1])) {
				$data = fread($pipes[1], 1024);
				if (strlen($data) == 0) break;
				$output .= $data;
			}
			fclose($pipes[1]);

			// reads the error message
			$result = '';
			while (!feof($pipes[2])) {
				$data = fread($pipes[2], 1024);
				if (strlen($data) == 0) break;
				$result .= $data;
			}
			fclose($pipes[2]);

			// close the process
			$status = proc_close($process);

			// returns the contents
			$this->error = $result;
			return (($status == 0) || ($status == -1));
		} else {
			$this->error = 'Unable to fork the command';
			return false;
		}
	}

	/**
	* Get the keys from the KeyRing.
	*
	* The returned array get the following elements:
	* [RecordType, CalculatedTrust, KeyLength, Algorithm,
	*  KeyID, CreationDate, ExpirationDate, LocalID,
	*  Ownertrust, UserID]
	*
	* @param  string $KeyKind the kind of the keys, can be secret or public
	* @param  string $SearchCriteria  the filter or criteria to search
	* @return mixed  false on error, the array with the keys in the keyring in success
	*/
	public function ListKeys($KeyKind = 'public', $SearchCriteria = '')
	{
		// validate the KeyKind
		$KeyKind = strtolower(substr($KeyKind, 0, 3));
		if (($KeyKind != 'pub') && ($KeyKind != 'sec')) {
			$this->error = 'The Key kind must be public or secret';
			return false;
		}

		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory
				. ' --with-colons ' . (($KeyKind == 'pub') ? '--list-public-keys': '--list-secret-keys')
				. (empty($SearchCriteria) ? '': ' ' . $SearchCriteria),
			false, $contents) ) {

			// initialize the array data
			$returned_keys = array();
			$keyPos = -1;

			// the keys are \n separated
			$contents = explode("\n", $contents);

			// find each key
			foreach ($contents as $data) {
				// read the fields to get the : separated, the sub record is dismiss
				$fields = explode(':', $data);
				if (count($fields) <= 3) continue;

				// verify the that the record is valid
				if (($fields[0] == 'pub') || ($fields[0] == 'sec')) {
					array_push($returned_keys, array(
						'RecordType' => $fields[0],
						'CalculatedTrust' => $fields[1],
						'KeyLength' => $fields[2],
						'Algorithm' => $fields[3],
						'KeyID' => $fields[4],
						'CreationDate' => $fields[5],
						'ExpirationDate' => $fields[6],
						'LocalID' => $fields[7],
						'Ownertrust' => $fields[8],
						'UserID' => $fields[9]
						)
					);
					$keyPos++;
				} elseif (($fields[0] == 'uid') && ($keyPos != -1)) {
					if (empty($returned_keys[$keyPos]['UserID']))
						$returned_keys[$keyPos]['UserID'] = $fields[9];
				}
			}
			return $returned_keys;
		} else
			return false;
	}

	/**
	* Export a key.
	*
	* Export all keys from all keyrings, or if at least one name is given, those of the given name.
	*
	* @param  string $KeyID  The Key ID to export
	* @return mixed  false on error, the key block with the exported keys
	*/
	public function Export($KeyID = false)
	{
		$KeyID = empty($KeyID) ? '': $KeyID;

		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory .
				' --armor --export ' . $KeyID,
			false, $contents) )
			return (empty($contents) ? false: $contents);
		else
			return false;
	}

	/**
	* Import/merge keys.
	*
	* This adds the given keys to the keyring. New keys are appended to your
	* keyring and already existing keys are updated. Note that GnuPG does not
	* import keys that are not self-signed.
	*
	* @param  string $KeyBlock  The PGP block with the key(s).
	* @return mixed  false on error, the array with [KeyID, UserID] elements of imported keys on success.
	*/
	public function Import($KeyBlock)
	{
		// Verify for the Key block contents
		if (empty($KeyBlock)) {
			$this->error = 'No valid key block was specified.';
			return false;
		}

		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory .
				' --status-fd 1 --import',
			$KeyBlock, $contents) ) {
			// initialize the array data
			$imported_keys = array();

			// parse the imported keys
			$contents = explode("\n", $contents);
			foreach ($contents as $data) {
				$matches = false;
				if (preg_match('/\[GNUPG:\]\sIMPORTED\s(\w+)\s(.+)/', $data, $matches))
					array_push($imported_keys, array(
						'KeyID' => $matches[1],
						'UserID' => $matches[2]));
			}
			return $imported_keys;
		} else
			return false;
	}

	/**
	* Generate a new key pair.
	*
	* @param  string $RealName     The real name of the user or key.
	* @param  string $Comment      Any explanatory commentary.
	* @param  string $Email        The e-mail for the user.
	* @param  string $Passphrase   Passphrase for the secret key, default is not to use any passphrase.
	* @param  string $ExpireDate   Set the expiration date for the key (and the subkey).  It may either be entered in ISO date format (2000-08-15) or as number of days, weeks, month or years (<number>[d|w|m|y]). Without a letter days are assumed.
	* @param  string $KeyType      Set the type of the key, the allowed values are DSA and RSA, default is DSA.
	* @param  string $KeyLength    Length of the key in bits, default is 1024.
	* @param  string $SubkeyType   This generates a secondary key, currently only one subkey can be handled ELG-E.
	* @param  string $SubkeyLength Length of the subkey in bits, default is 1024.
	* @return mixed  false on error, the fingerprint of the created key pair in success
	*/
	public function GenKey($RealName, $Comment, $Email, $Passphrase = '', $ExpireDate = 0, $KeyType = 'DSA', $KeyLength = 1024, $SubkeyType = 'ELG-E', $SubkeyLength = 1024)
	{
		// validates the keytype
		if (($KeyType != 'DSA') && ($KeyType != 'RSA')) {
			$this->error = 'Invalid Key-Type, the allowed are DSA and RSA';
			return false;
		}

		// validates the subkey
		if ((!empty($SubkeyType)) && ($SubkeyType != 'ELG-E')) {
			$this->error = 'Invalid Subkey-Type, the allowed is ELG-E';
			return false;
		}

		// validate the expiration date
		if (!preg_match('/^(([0-9]+[dwmy]?)|([0-9]{4}-[0-9]{2}-[0-9]{2}))$/', $ExpireDate)) {
			$this->error = 'Invalid Expire Date, the allowed values are <iso-date>|(<number>[d|w|m|y])';
			return false;
		}

		// generates the batch configuration script
		$batch_script  = "Key-Type: $KeyType\n" .
			"Key-Length: $KeyLength\n";
		if (($KeyType == 'DSA') && ($SubkeyType == 'ELG-E'))
			$batch_script .= "Subkey-Type: $SubkeyType\n" .
				"Subkey-Length: $SubkeyLength\n";
		$batch_script .= "Name-Real: $RealName\n" .
			"Name-Comment: $Comment\n" .
			"Name-Email: $Email\n" .
			"Expire-Date: $ExpireDate\n" .
			"Passphrase: $Passphrase\n" .
			"%commit\n" .
			"%echo done with success\n";

		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory .
				' --batch --status-fd 1 --gen-key',
			$batch_script, $contents) ) {
			$matches = false;
			if ( preg_match('/\[GNUPG:\]\sKEY_CREATED\s(\w+)\s(\w+)/', $contents, $matches) )
				return $matches[2];
			else
				return true;
		} else
			return false;
	}

	/**
	* Encrypt and sign data.
	*
	* @param  string $KeyID          the key id used to encrypt
	* @param  string $Passphrase     the passphrase to open the key used to encrypt
	* @param  string $RecipientKeyID the recipient key id
	* @param  string $Text           data to encrypt
	* @return mixed  false on error, the encrypted data on success
	*/
	public function Encrypt($KeyID, $Passphrase, $RecipientKeyID, $Text)
	{
		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory .
				' --armor --passphrase-fd 0 --yes --batch --force-v3-sigs ' .
				" --local-user $KeyID --default-key $KeyID --recipient $RecipientKeyID --sign --encrypt",
			$Passphrase . "\n" . $Text, $contents) )
			return $contents;
		else
			return false;
	}

	/**
	* Encrypt and sign a file.
	*
	* @param  string $KeyID          the key id used to encrypt
	* @param  string $Passphrase     the passphrase to open the key used to encrypt
	* @param  string $RecipientKeyID the recipient key id
	* @param  string $InputFile      file to encrypt
	* @param  string $OutputFile     file encrypted
	* @return mixed  false on error, the encrypted data on success
	*/
	public function EncryptFile($KeyID, $Passphrase, $RecipientKeyID, $InputFile, $OutputFile)
	{
		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory .
				' --armor --passphrase-fd 0 --yes --batch --force-v3-sigs ' .
				" --local-user $KeyID --default-key $KeyID --recipient $RecipientKeyID --output $OutputFile --sign --encrypt $InputFile",
			$Passphrase . "\n", $contents) )
			return $contents;
		else
			return false;
	}

	/**
	* Decrypt the data.
	*
	* If the decrypted file is signed, the signature is also verified.
	*
	* @param  string $KeyID      the key id to decrypt
	* @param  string $Passphrase the passphrase to open the key used to decrypt
	* @param  string $Text       data to decrypt
	* @return mixed  false on error, the clear (decrypted) data on success
	*/
	public function Decrypt($KeyID, $Passphrase, $Text)
	{
		// the text to decrypt from another platforms can has a bad sequence
		// this line removes the bad data and converts to line returns
		$Text = preg_replace("/\x0D\x0D\x0A/s", "\n", $Text);

		// we generate an array and add a new line after the PGP header
		$Text = explode("\n", $Text);
		if (count($Text) > 1) $Text[1] .= "\n";
		$Text = implode("\n", $Text);

		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory .
				' --passphrase-fd 0 --yes --batch ' .
				" --local-user $KeyID --default-key $KeyID --decrypt",
			$Passphrase . "\n" . $Text, $contents) )
			return $contents;
		else
			return false;
	}

	/**
	* Remove key from the public keyring.
	*
	* If secret is specified it try to remove the key from from the secret
	* and public keyring.
	* The returned error codes are:
	* 1 = no such key
	* 2 = must delete secret key first
	* 3 = ambiguos specification
	*
	* @param  string $KeyID   the key id to be removed, if this is the secret key you must specify the fingerprint
	* @param  string $KeyKind the kind of the keys, can be secret or public
	* @return mixed  true on success, otherwise false or the delete error code
	*/
	public function DeleteKey($KeyID, $KeyKind = 'public')
	{
		if (empty($KeyID)) {
			$this->error = 'You must specify the KeyID to delete';
			return false;
		}

		// validate the KeyKind
		$KeyKind = strtolower(substr($KeyKind, 0, 3));
		if (($KeyKind != 'pub') && ($KeyKind != 'sec')) {
			$this->error = 'The Key kind must be public or secret';
			return false;
		}

		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory .
				' --batch --yes --status-fd 1 ' .
				(($KeyKind == 'pub') ? '--delete-key ': '--delete-secret-keys ') . $KeyID,
			false, $contents) )
			return true;
		else {
			$matches = false;
			if ( preg_match('/\[GNUPG:\]\DELETE_PROBLEM\s(\w+)/', $contents, $matches) )
				return $matches[1];
			else
				return false;
		}
	}

	/**
	* Sign the recipient key with the private key.
	*
	* @param  string $KeyID          the key id used to sign
	* @param  string $Passphrase     the passphrase to open the key used to sign
	* @param  string $RecipientKeyID the recipient key id to be signed
	* @param  string $CertificationLevel the level of thrust for the recipient key
	*    0 : means you make no particular claim as to how carefully you verified the key
	*    1 : means you believe the key is owned by the person who claims to own it but you could not, or did not verify the key at all
	*    2 : means you did casual verification of the key
	*    3 : means you did extensive verification of the key
	* @return mixed  true on success, otherwise false or the sign error code
	*/
	public function SignKey($KeyID, $Passphrase, $RecipientKey, $CertificationLevel = self::CERT_LEVEL_NONE)
	{
		// initialize the output
		$contents = '';

		// execute the GPG command
		if ( $this->_fork_process($this->programPath . ' --homedir ' . $this->homeDirectory
				. ' --batch --yes --passphrase-fd 0 --status-fd 1 --default-cert-level ' . $CertificationLevel
				. ' --no-ask-cert-level --expert --default-key ' . $KeyID . ' --sign-key ' . $RecipientKey,
			$Passphrase . "\n", $contents) )
			return true;
		else
			return false;
	}
}
