<?php

/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 *
 */

class Report extends FPDF
{

    public $orientation = 'P';
    public $fontFamily  = 'Arial';
    public $fontSize    = 8;
    public $title;
    public $subTitle;
    public $subTitle2;
    public $subTitle3;
    public $details;
    public $detailstitle;
    public $logo           = '';
    public $strDate        = 'Data: ';
    public $strUser        = 'Usuário: ';
    public $strPage        = 'Página ';
    public $strOf          = ' de ';
    public $idxUserSession = 'user';
    public $user;
    public $userName;
    public $address;
    public $city;
    public $states;
    public $zipcode;
    public $formatDate           = 'd/m/Y';
    public $formatDateTime       = 'd/m/Y H:i:s';
    public $yesValue             = 'Sim';
    public $noValue              = 'Não';
    public $showTitle            = true;
    public $magnusFilesDirectory = '/usr/local/src/magnus/';
    public $fileReport;
    public $columns;
    public $records;
    public $fieldGroup;
    public $columnsTable;
    public $fieldsCurrency;
    public $fieldsPercent;
    public $fieldsFk;
    public $renderer;
    public $columnsDetails = [];
    public $recordsDetails = [];
    public $listColor;
    public $listHeaderColor;
    public $firstListTitle;
    public $secondListTitle;
    public $decimal = 2;
    public function generate($type = 'link')
    {
        $this->AliasNbPages();
        $this->AddPage($this->orientation);
        $this->SetFont($this->fontFamily, '', $this->fontSize);
        if (count($this->columnsDetails)) {

            $this->bodyExtra();
            $this->Ln(5);
        }
        $this->body();
        $this->fileReport = isset($this->fileReport) ? $this->magnusFilesDirectory . $this->fileReport : $this->magnusFilesDirectory . $this->createNameFile("report.pdf");
        $this->Output("$this->fileReport", 'F');

        if ($type == 'link') {

            $FileName = $this->title . '_' . time();

            header('Content-type: application/pdf');
            header('Content-Disposition: inline; filename="' . $FileName . '_export"');
            header('Content-Transfer-Encoding: binary');
            header('Accept-Ranges: bytes');
            ob_clean();
            flush();

            if (readfile($this->fileReport)) {
                unlink($this->fileReport);
            }
        }
    }

    public function createNameFile($str)
    {
        $search  = explode(",", "ç,æ,œ,á,é,í,ó,ú,à,è,ì,ò,ù,ä,ë,ï,ö,ü,ÿ,â,ê,î,ô,û,å,e,i,ø,u");
        $replace = explode(",", "c,ae,oe,a,e,i,o,u,a,e,i,o,u,a,e,i,o,u,y,a,e,i,o,u,a,e,i,o,u");
        return strtolower(str_replace(' ', null, str_replace($search, $replace, $str)));
    }

    public function Header()
    {
        if ($this->PageNo() === 1) {
            $date = utf8_decode($this->strDate) . date($this->formatDate);

            if (isset($_SESSION[$this->idxUserSession])) {
                $user = utf8_decode($this->strUser) . $_SESSION[$this->idxUserSession];
            } elseif (isset($this->user)) {
                $user = $this->user;
            } else {
                $user = null;
            }

            if (strlen($this->logo) > 10) {
                $this->Image($this->logo, 10, 8, 50);
            }

            $this->SetFont($this->fontFamily, 'B', $this->fontSize + 3);
            $this->Cell(0, 6, utf8_decode($this->title), 0, 0, 'C');
            $this->Ln(5);

            if ($this->subTitle) {
                $this->SetFont($this->fontFamily, 'B', $this->fontSize);
                $this->Cell(0, 6, utf8_decode($this->subTitle), 0, 0, 'C');
            }

            if ($this->subTitle2) {
                $this->Ln(5);
                $this->SetFont($this->fontFamily, 'B', $this->fontSize);
                $this->Cell(0, 6, utf8_decode($this->subTitle2), 0, 0, 'C');
            }
            if ($this->subTitle3) {
                $this->Ln(5);
                $this->SetFont($this->fontFamily, 'B', $this->fontSize);
                $this->Cell(0, 6, utf8_decode($this->subTitle3), 0, 0, 'C');
            }
            if (isset($this->detailstitle)) {
                $this->Ln(15);
                $this->SetFont($this->fontFamily, 'B', $this->fontSize);
                $this->Cell(0, 5, utf8_decode($this->detailstitle), 0, 0, 'C');
            }

            $this->SetFont($this->fontFamily, '', $this->fontSize - 1);
            $this->SetY(11);
            $this->Cell(0, 3, $date, 0, 0, 'R');
            $this->Ln(3);
            $this->Cell(0, 3, $user, 0, 0, 'R');
            if (isset($this->userName)) {
                $this->Ln(3);
                $this->Cell(0, 3, $this->userName, 0, 0, 'R');
            }
            if (isset($this->address)) {
                $this->Ln(3);
                $this->Cell(0, 3, $this->address, 0, 0, 'R');
            }
            if (isset($this->city)) {
                $this->Ln(3);
                $this->Cell(0, 3, $this->city, 0, 0, 'R');
            }
            if (isset($this->states)) {
                $this->Ln(3);
                $this->Cell(0, 3, $this->states, 0, 0, 'R');
            }
            if (isset($this->zipcode)) {
                $this->Ln(3);
                $this->Cell(0, 3, $this->zipcode, 0, 0, 'R');
            }

            if (isset($this->details)) {
                $this->Ln(35);
                $this->MultiCell(0, 5, utf8_decode($this->details), 1);
                $this->Ln(15);
            } else {
                $this->Ln(20);
            }
        }
    }

    public function bodyExtra()
    {
        if (! $this->recordsDetails) {
            return;
        }
        if (isset($this->secondListTitle)) {
            $this->Ln(15);
            $this->SetFont($this->fontFamily, 'B', $this->fontSize);
            $this->Cell(0, 5, utf8_decode($this->secondListTitle), 0, 0, 'C');
            $this->Ln(10);
        }
        $this->SetFont($this->fontFamily, 'B', $this->fontSize);
        $this->SetTextColor(255, 255, 255);
        $widthContent = $this->orientation === 'P' ? 189 : 276;
        $countColumns = $this->fieldGroup ? count($this->columnsDetails) - 1 : count($this->columnsDetails);
        $widthFill    = $widthContent / $countColumns;

        foreach ($this->columnsDetails as $column) {
            $header = utf8_decode($column['header']);
            if ($column['dataIndex'] === $this->fieldGroup) {
                $headerGroup = utf8_decode($column['header']);
                continue;
            }
            $widthHeader = $this->GetStringWidth($header);

            $this->SetFillColor(156, 156, 156);
            $this->Cell($widthFill, 5, $header, 0, 0, 'C', true);
            $this->Cell(0.6, 5);
        }

        $this->Ln();
        $this->SetFont($this->fontFamily, '', $this->fontSize);
        $this->SetTextColor(0, 0, 0);
        $rowNumber = 0;
        $this->clearRecords();

        foreach ($this->recordsDetails as $row) {
            $rowColor = ($rowNumber % 2) === 0 ? 250 : 190;
            $this->SetFillColor($rowColor, $rowColor, $rowColor);

            $columnsTableDetails = $this->convertColumns($this->columnsTableDetails);

            foreach ($row as $fieldName => $col) {
                if ($fieldName == $this->fieldGroup) {
                    $idxLastValue = $rowNumber === 0 ? $rowNumber : $rowNumber - 1;
                    $lastValue    = utf8_decode($this->recordsDetails[$idxLastValue][$fieldName]);
                    $value        = utf8_decode($col);
                    if ($lastValue == $value && $rowNumber != 0) {
                        continue;
                    }

                    if (is_array($this->fieldsFk) && array_key_exists($fieldName, $this->fieldsFk)) {
                        $this->writeHeaderGroup(gettype($col), $value, $fieldName, $headerGroup);
                    } else if (is_array($this->renderer) && array_key_exists($fieldName, $this->renderer)) {
                        $renderer = $this->renderer[$fieldName][$col];
                        $value    = utf8_decode($renderer);
                        $this->writeHeaderGroup(gettype($renderer), $value, $fieldName, $headerGroup);
                    } else {
                        $this->writeHeaderGroup($columnsTableDetails[$fieldName]['Type'], $value, $fieldName, $headerGroup);
                    }

                    $widthFill = $widthContent / $countColumns;
                    $this->SetFillColor($rowColor, $rowColor, $rowColor);
                } else if (is_array($this->fieldsFk) && array_key_exists($fieldName, $this->fieldsFk)) {
                    $value = utf8_decode($col);
                    $this->writeLine(gettype($col), $widthFill, $value, $fieldName);
                } else if (is_array($this->renderer) && array_key_exists($fieldName, $this->renderer)) {
                    $renderer = $this->renderer[$fieldName][$col];
                    $value    = utf8_decode($renderer);
                    $this->writeLine(gettype($renderer), $widthFill, $value, $fieldName);
                } else {
                    $value = utf8_decode($col);
                    $this->writeLine($columnsTableDetails[$fieldName]['Type'], $widthFill, $value, $fieldName);
                }

                $this->Cell(0.6, 5);
            }

            $rowNumber++;
            $this->Ln();
        }
    }

    public function body()
    {
        if (! $this->records) {
            return;
        }

        if (isset($this->firstListTitle)) {
            $this->Ln(15);
            $this->SetFont($this->fontFamily, 'B', $this->fontSize);
            $this->Cell(0, 5, utf8_decode($this->firstListTitle), 0, 0, 'C');
            $this->Ln(10);
        }

        $this->SetFont($this->fontFamily, 'B', $this->fontSize);
        $this->SetTextColor(255, 255, 255);
        $widthContent = $this->orientation === 'P' ? 189 : 276;
        $countColumns = $this->fieldGroup ? count($this->columns) - 1 : count($this->columns);
        $widthFill    = $widthContent / $countColumns;

        foreach ($this->columns as $column) {
            $header = utf8_decode($column['header']);
            if ($column['dataIndex'] === $this->fieldGroup) {
                $headerGroup = utf8_decode($column['header']);
                continue;
            }
            $widthHeader = $this->GetStringWidth($header);

            if (strlen($this->listHeaderColor) > 0) {
                $colorsheader = explode(',', preg_replace('/ /', '', $this->listHeaderColor));
                $this->SetFillColor($colorsheader[0], $colorsheader[1], $colorsheader[2]);
            } else {
                $this->SetFillColor(156, 156, 156);
            }

            $this->Cell($widthFill, 5, $header, 0, 0, 'C', true);
            $this->Cell(0.6, 5);
        }

        $this->Ln();
        $this->SetFont($this->fontFamily, '', $this->fontSize);
        $this->SetTextColor(0, 0, 0);
        $rowNumber = 0;
        $this->clearRecords();

        foreach ($this->records as $row) {
            $rowColor = ($rowNumber % 2) === 0 ? 255 : 190;

            if (($rowNumber % 2) === 1 && strlen($this->listColor) > 0) {
                $colors = explode(',', preg_replace('/ /', '', $this->listColor));
                $this->SetFillColor($colors[0], $colors[1], $colors[2]);
            } else {
                $this->SetFillColor($rowColor, $rowColor, $rowColor);
            }

            $columnsTable = $this->convertColumns($this->columnsTable);

            foreach ($row as $fieldName => $col) {
                if ($fieldName == $this->fieldGroup) {
                    $idxLastValue = $rowNumber === 0 ? $rowNumber : $rowNumber - 1;
                    $lastValue    = utf8_decode($this->records[$idxLastValue][$fieldName]);
                    $value        = utf8_decode($col);
                    if ($lastValue == $value && $rowNumber != 0) {
                        continue;
                    }

                    if (is_array($this->fieldsFk) && array_key_exists($fieldName, $this->fieldsFk)) {
                        $this->writeHeaderGroup(gettype($col), $value, $fieldName, $headerGroup);
                    } else if (is_array($this->renderer) && array_key_exists($fieldName, $this->renderer)) {
                        $renderer = $this->renderer[$fieldName][$col];
                        $value    = utf8_decode($renderer);
                        $this->writeHeaderGroup(gettype($renderer), $value, $fieldName, $headerGroup);
                    } else {
                        $this->writeHeaderGroup($columnsTable[$fieldName]['Type'], $value, $fieldName, $headerGroup);
                    }

                    $widthFill = $widthContent / $countColumns;
                    $this->SetFillColor($rowColor, $rowColor, $rowColor);
                } else if (is_array($this->fieldsFk) && array_key_exists($fieldName, $this->fieldsFk)) {
                    $value = utf8_decode($col);
                    $this->writeLine(gettype($col), $widthFill, $value, $fieldName);
                } else if (is_array($this->renderer) && array_key_exists($fieldName, $this->renderer)) {
                    $renderer = $this->renderer[$fieldName][$col];
                    $value    = utf8_decode($renderer);
                    $this->writeLine(gettype($renderer), $widthFill, $value, $fieldName);
                } else {
                    $value = utf8_decode($col);
                    $this->writeLine($columnsTable[$fieldName]['Type'], $widthFill, $value, $fieldName);
                }

                $this->Cell(0.6, 5);
            }

            $rowNumber++;
            $this->Ln();
        }
    }

    public function clearRecords()
    {
        $columnExists = false;
        for ($i = 0; $i < count($this->records); $i++) {
            foreach ($this->records[$i] as $columnRecord => $value) {
                foreach ($this->columns as $column) {
                    if ($columnRecord === $column['dataIndex']) {
                        $columnExists = true;
                        break;
                    }
                }
                if ($columnRecord != 'connectcharge') {
                    if (! $columnExists && $columnRecord != 'status') {
                        unset($this->records[$i][$columnRecord]);
                    }
                }

                $columnExists = false;
            }
        }
    }

    public function writeLine($typeValue, $widthFill, $value, $fieldName)
    {
        $mapTypes = [
            'integer'          => 'int',
            'smallint'         => 'int',
            'mediumint'        => 'int',
            'int'              => 'int',
            'integer'          => 'int',
            'bigint'           => 'int',
            'decimal'          => 'int',
            'numeric'          => 'int',
            'float'            => 'float',
            'double'           => 'float',
            'double precision' => 'float',
            'real'             => 'float',
            'date'             => 'date',
            'datetime'         => 'datetime',
            'timestamp'        => 'datetime',
            'boolean'          => 'boolean',
            'tinyint'          => 'boolean',
        ];

        if ($value == 'blank') {
            return;
        }

        $type = strpos($typeValue, '(') ? substr($typeValue, 0, strpos($typeValue, '(')) : $typeValue;
        $type = array_key_exists($type, $mapTypes) ? $mapTypes[$type] : $type;

        if ($fieldName == 'activated' || $fieldName == 'active' || ($fieldName == 'status' && ! $type == 'boolean')) {

            $this->Cell($widthFill, 5, $this->formatActive($value), 0, 0, 'C', true);
            $this->SetTextColor(0, 0, 0);
            return;
        }

        if ($fieldName == 'voip_call') {
            $this->Cell($widthFill, 5, $this->formatVoipCall($value), 0, 0, 'C', true);
            $this->SetTextColor(0, 0, 0);
            return;
        }
        if ($fieldName == 'lcrtype') {
            $this->Cell($widthFill, 5, $this->formatLcrtype($value), 0, 0, 'C', true);
            return;
        }
        if ($fieldName == 'terminatecauseid') {
            $this->Cell($widthFill, 5, $this->formatTerminatecauseid($value), 0, 0, 'C', true);
            return;
        }
        if ($fieldName == 'sipiax') {
            $this->Cell($widthFill, 5, $this->formatSipiax($value), 0, 0, 'C', true);
            return;
        }
        if ($fieldName == 'packagetype') {
            $this->Cell($widthFill, 5, $this->formatPackagetype($value), 0, 0, 'C', true);
            return;
        }
        if ($fieldName == 'billingtype') {
            $this->Cell($widthFill, 5, $this->formatBillingtype($value), 0, 0, 'C', true);
            return;
        }

        if ($fieldName == 'result') {
            $this->Cell($widthFill, 5, $this->formatSend($value), 0, 0, 'C', true);
            $this->SetTextColor(0, 0, 0);
            return;
        }

        if ($fieldName == 'credit') {
            $this->Cell($widthFill, 5, $this->formatCurrency($value), 0, 0, 'L', true);
            $this->SetTextColor(0, 0, 0);
            return;
        }

        if ($fieldName == 'sessiontime') {
            $this->Cell($widthFill, 5, $this->formtSeconds($value), 0, 0, 'L', true);
            $this->SetTextColor(0, 0, 0);
            return;
        }

        switch ($type) {
            case 'int':
                $this->Cell($widthFill, 5, $value, 0, 0, 'R', true);
                break;
            case 'float':
                if (is_array($this->fieldsCurrency) && array_search($fieldName, $this->fieldsCurrency) !== false) {
                    $this->Cell($widthFill, 5, $this->formatCurrency($value), 0, 0, 'R', true);
                } else if (is_array($this->fieldsPercent) && array_search($fieldName, $this->fieldsPercent) !== false) {
                    $this->Cell($widthFill, 5, $this->formatPercentage($value), 0, 0, 'R', true);
                } else {
                    $this->Cell($widthFill, 5, $value, 0, 0, 'R', true);
                }
                break;
            case 'date':
                $this->Cell($widthFill, 5, $this->formatDate($value), 0, 0, 'C', true);
                break;
            case 'datetime':
                $this->Cell($widthFill, 5, $this->formatDate($value, true), 0, 0, 'C', true);
                break;
            case 'boolean':
                $this->Cell($widthFill, 5, $this->formatBoolean($value), 0, 0, 'C', true);
                $this->SetTextColor(0, 0, 0);
                break;
            default:
                $this->Cell($widthFill, 5, $value, 0, 0, 'L', true);
                break;
        }
    }

    public function writeHeaderGroup($typeValue, $value, $fieldName, $headerGroup)
    {
        $mapTypes = [
            'integer'          => 'int',
            'smallint'         => 'int',
            'mediumint'        => 'int',
            'int'              => 'int',
            'integer'          => 'int',
            'bigint'           => 'int',
            'decimal'          => 'int',
            'numeric'          => 'int',
            'float'            => 'float',
            'double'           => 'float',
            'double precision' => 'float',
            'real'             => 'float',
            'date'             => 'date',
            'datetime'         => 'datetime',
            'timestamp'        => 'datetime',
            'boolean'          => 'boolean',
            'tinyint'          => 'boolean',
        ];

        $type = strpos($typeValue, '(') ? substr($typeValue, 0, strpos($typeValue, '(')) : $typeValue;
        $type = array_key_exists($type, $mapTypes) ? $mapTypes[$type] : $type;

        $widthFill = $this->orientation === 'P' ? 193 : 280;
        $this->Ln(2);
        $this->SetFont($this->fontFamily, 'B', $this->fontSize);
        $this->SetFillColor(255, 255, 255);

        switch ($type) {
            case 'int':
                $this->Cell($widthFill, 5, $headerGroup . ': ' . $value, 0, 0, 'L', true);
                break;
            case 'float':
                if (is_array($this->fieldsCurrency) && array_search($fieldName, $this->fieldsCurrency) !== false) {
                    $this->Cell($widthFill, 5, $headerGroup . ': ' . $this->formatCurrency($value), 0, 0, 'L', true);
                } else if (is_array($this->fieldsPercent) && array_search($fieldName, $this->fieldsPercent) !== false) {
                    $this->Cell($widthFill, 5, $headerGroup . ': ' . $this->formatPercentage($value), 0, 0, 'L', true);
                } else {
                    $this->Cell($widthFill, 5, $headerGroup . ': ' . $value, 0, 0, 'L', true);
                }
                break;
            case 'date':
                $this->Cell($widthFill, 5, $headerGroup . ': ' . $this->formatDate($value), 0, 0, 'L', true);
                break;
            case 'datetime':
                $this->Cell($widthFill, 5, $headerGroup . ': ' . $this->formatDate($value, true), 0, 0, 'L', true);
                break;
            case 'boolean':
                $strHeader     = $headerGroup . ': ';
                $withStrHeader = $this->GetStringWidth($strHeader);
                $withStrValue  = $this->GetStringWidth($this->formatBoolean($value));
                $this->SetTextColor(0, 0, 0);

                $this->Cell($withStrHeader, 5, $strHeader, 0, 0, 'L', true);
                $this->Cell($withStrValue, 5, $this->formatBoolean($value), 0, 0, 'L', true);
                $this->SetTextColor(0, 0, 0);
                break;
            default:
                $this->Cell($widthFill, 5, $headerGroup . ': ' . $value, 0, 0, 'L', true);
                break;
        }
        $this->Ln(4);
        $this->SetDrawColor(205, 205, 205);
        $widthLineGroup = $this->orientation === 'P' ? 200 : 288;
        $this->Line(10, $this->GetY() + 0.8, $widthLineGroup, $this->GetY() + 0.8);
        $this->SetTextColor(0, 0, 0);
        $this->Ln(1);
        $this->SetFont($this->fontFamily, '', $this->fontSize);
    }

    public function formatCurrency($value)
    {
        if ($value > 0) {
            $this->SetTextColor(255, 0, 0);
        } else {
            $this->SetTextColor(0, 128, 0);
        }
        return Yii::app()->session['currency'] . ' ' . number_format((int) $value, $this->decimal, ',', '.');
    }

    public function formatPercentage($value)
    {
        return number_format($value, 2, ',', '.') . '%';
    }

    public function formatDate($value, $datetime = false)
    {
        $format = $datetime ? $this->formatDateTime : $this->formatDate;
        $date   = new DateTime($value);
        return $date->format($format);
    }

    public function formatSend($value)
    {
        if ($value == 0) {
            $this->SetTextColor(255, 0, 0);
            return Yii::t('zii', 'Error');
        } else if ($value == 1) {
            $this->SetTextColor(0, 128, 0);
            return Yii::t('zii', 'Send');
        } else if ($value == 2) {
            return Yii::t('zii', 'Received');
        } else {
            return $value;
        }
    }

    public function formatPackagetype($value)
    {
        if ($value == 0) {
            return Yii::t('zii', 'Unlimited calls');
        } else if ($value == 1) {
            return Yii::t('zii', 'Number free calls');
        } else if ($value == 2) {
            return Yii::t('zii', 'Free seconds');
        } else {
            return $value;
        }
    }

    public function formatBillingtype($value)
    {
        if ($value == 0) {
            return Yii::t('zii', 'Monthly');
        } else if ($value == 1) {
            return Yii::t('zii', 'Weekly');
        } else {
            return $value;
        }
    }

    public function formatActive($value)
    {
        if ($value == 0) {
            $this->SetTextColor(255, 0, 0);
            return Yii::t('zii', 'Inactive');
        } else if ($value == 1) {
            $this->SetTextColor(0, 128, 0);
            return Yii::t('zii', 'Active');
        } else if ($value == 2) {
            return Yii::t('zii', 'Pending');
        } else {
            return $value;
        }
    }

    public function formatVoipCall($value)
    {
        if ($value == 0) {
            return Yii::t('zii', 'Call to PSTN');
        } else if ($value == 1) {
            return Yii::t('zii', 'PJSIP');
        } else if ($value == 2) {
            return Yii::t('zii', 'IVR');
        } else if ($value == 3) {
            return Yii::t('zii', 'CallingCard');
        } else if ($value == 4) {
            return Yii::t('zii', 'Direct extension');
        } else if ($value == 5) {
            return Yii::t('zii', 'CID Callback');
        } else {
            return $value;
        }
    }

    public function formatSipiax($value)
    {
        if ($value == 0) {
            return utf8_decode(Yii::t('zii', 'Standard'));
        } else if ($value == 1) {
            return Yii::t('zii', 'PJSIP');
        } else if ($value == 2) {
            return Yii::t('zii', 'DID');
        } else if ($value == 3) {
            return Yii::t('zii', 'DID voip');
        } else if ($value == 4) {
            return Yii::t('zii', 'CallBack');
        } else if ($value == 5) {
            return Yii::t('zii', 'Voice Broadcasting');
        } else if ($value == 6) {
            return Yii::t('zii', 'SMS');
        } else if ($value == 7) {
            return Yii::t('zii', 'Transfer');
        } else if ($value == 8) {
            return Yii::t('zii', 'Queue');
        } else if ($value == 9) {
            return Yii::t('zii', 'IVR');
        } else {
            return $value;
        }
    }

    public function formatTerminatecauseid($value)
    {
        if ($value == 1) {
            return Yii::t('zii', 'Answer');
        } else if ($value == 2) {
            return Yii::t('zii', 'Busy');
        } else if ($value == 3) {
            return Yii::t('zii', 'No answer');
        } else if ($value == 4) {
            return Yii::t('zii', 'Cancel');
        } else if ($value == 5) {
            return Yii::t('zii', 'Chanunavail');
        } else if ($value == 6) {
            return Yii::t('zii', 'Congestion');
        } else if ($value == 7) {
            return Yii::t('zii', 'Dontcall');
        } else if ($value == 8) {
            return Yii::t('zii', 'Torture');
        } else if ($value == 9) {
            return Yii::t('zii', 'Invalidargs');
        } else {
            return $value;
        }
    }

    public function formatLcrtype($value)
    {
        if ($value == 0) {
            return Yii::t('zii', 'LCR According buyer Price');
        } else if ($value == 1) {
            return Yii::t('zii', 'LCR According seller Price');
        } else if ($value == 2) {
            return Yii::t('zii', 'Load Balancer');
        } else {
            return $value;
        }
    }

    public function formtSeconds($seconds)
    {
        $t = round($seconds);
        return sprintf('%02d:%02d:%02d', ($t / 3600), ($t / 60 % 60), $t % 60);
    }

    public function formatBoolean($value)
    {
        if ($value) {
            $this->SetTextColor(0, 128, 0);
            return utf8_decode($this->yesValue);
        } else {
            $this->SetTextColor(255, 0, 0);
            return utf8_decode($this->noValue);
        }
    }

    public function convertColumns($columnsTable)
    {
        foreach ($columnsTable as $column) {
            $columns[$column['Field']] = $column;
        }
        return $columns;
    }

    public function Footer()
    {
        $this->SetY(-15);
        $this->SetFont($this->fontFamily, '', $this->fontSize);
        $this->Cell(0, 10, utf8_decode($this->strPage) . $this->PageNo() . utf8_decode($this->strOf) . '{nb}', 0, 0, 'C');
    }
}
