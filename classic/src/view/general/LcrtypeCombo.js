/**
 * Classe que define a combo "lcrtype"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 24/07/2012
 */
Ext.define('MBilling.view.general.LcrtypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.lcrtypecombo',
    fieldLabel: t('LCR type'),
    forceSelection: true,
    editable: false,
    value: 1,
    store: [
        [1, t('LCR According buyer Price')],
        [0, t('LCR According seller Price')]
    ]
});