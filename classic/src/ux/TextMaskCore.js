/**
 * autor: Rodrigo Krummenauer do Nascimento
 * site: www.rkn.com.br
 * email: rodrigoknascimento@gmail.com
 * 
 * Versão: 4.2
 * Lincença: GPLv3
 **/
/**
 * CHANGE LOG
 * 
 * 2.3
 *   - Problema resolvido que ocorrria no Chrome quando se digitava um mesmo numero 3 vezes
 *     na mascara do tipo Money
 *   - Adicionada funcionalidade de poder iniciar o componente com um valor usando a propriedade
 *     value fazendo mascara do valor
 *
 * 2.4
 *   - Resolvido BUG do IE, nenhuma mascara funcionava no IE
 * 
 * 2.5
 *   - Problema ao setvar valores sem decimais resolvido
 * 
 * 2.6
 *   - Problema de disparar o validade do campo ao apagar tudo selecionando todo o campo e dando um BACKSPACE resolvido.
 * 
 * 2.7
 *   - Adicionado suporte a propriedade readOnly
 * 
 * 2.8
 *   - Adicionado Ext.util.Format.MoneyMask
 * 
 * 2.9
 *   - Adicionada funcionalidade useMask quer ativa ou desativa o uso da classe de mascara.
 * 
 * 3.0
 *   - Adicionada funcionalidade de negativar ou positivar o valor da mascara monetária.
 * 
 * 4.0
 *   - Compatibildade com ExtJS 4.x
 **/
/**
 * TODO
 * 
 * - Selection para o IE
 * - Copy e Paste
 * 
 **/
/**
 * MODO DE USO DO Ext.ux.TextMaskCore
 *
 * Métodos:
 *    mask(valor) - Mascara um valor
 *    unmask(valor) - Tira a mascara de um valor
 *    setMask(mascara) - Define uma nova mascara para o componente
 *
 *
 * São 2 parametros (mask, money):
 *     mask - Aqui definimos a mascara esta mascara vai ter comportamento diferente dependendo
 *            do valor setado no money.
 *
 *     money - Aqui definimos se teremos uma mascara do tipo dinheiro ou do tipo fixo, true para dinheiro
 *             false para normal.
 *
 * Mascara Normal:
 *    Podemos definir os seguintes caracteres:
 *       _ - Qualquer caracter
 *       A - Letras MAIUSCULAS ou minusculas
 *       L - Letras MAIUSCULAS
 *       l - Letras minusculas
 *       9 - Números de 0 a 9
 *       <!!> - Expressão regular, exemplo <![0123]!> aceita números de 0 a 3
 *
 *    Os demais caracteres serão considerados parte da mascara, exemplo:
 *        var mask = new Ext.ux.TextMask('999.999.999-99', false);
 *        mask.mask('00173008915'); //Deve retornar 001.730.089-15
 *        mask.mask('001'); //Deve retornar 001.___.___-__
 *        mask.unmask('001.730.089-15'); //Deve retornar 00173008915
 *
 *
 * Mascara Money:
 *    Esta mascara funciona basicamente igual a Mascara Normal
 *    Podemos definir todos os caracteres da Mascara Normal e mais o 0 e o #
 *    os zeros serão considerados valor inicial, o # será considerado o fim da mascara
 *    considerando da direita pra esquerda permitindo prefixos e o numero de casas decimais
 *    será contado pela quantidade de caracteres depois do ultimo ponto ou virgula, exemplo:
 *        var mask = new Ext.ux.TextMask('R$ #9.999.990,00', true);
 *        mask.mask(31324587202.18); //Deve retornar R$ 31324.587.202,18
 *        mask.mask(0.01); //Deve retornar R$ 0,01
 *        mask.mask(0); //Deve retornar R$ 0,00
 *        mask.unmask('R$ 31324.587.202,18'); //Deve retornar 31324587202.18
 **/
String.leftPad = function(d, b, c) {
    var a = String(d);
    if (!c) {
        c = " "
    }
    while (a.length < b) {
        a = c + a
    }
    return a
}
Ext.define('Ext.ux.TextMaskCore', {
    constructor: function(mask, money) {
        this.money = money === true;
        this.setMask(mask);
    },
    blankChar: '_',
    money: false,
    moneyZeros: 0,
    moneyPrecision: 0,
    version: '2.6',
    specialChars: {
        'L': /^[A-Z]$/,
        'l': /^[a-z]$/,
        '9': /^[0-9]$/,
        'A': /^[A-Za-z]$/,
        '_': /^.$/
    },
    mask: function(v) {
        return this.money ? this.maskMoney(v) : this.maskNormal(v);
    },
    maskNormal: function(v) {
        v = this.unmask(v);
        v = v.split('');
        var m = '';
        var i = 0;
        Ext.each(this.maskList, function(item) {
            if (Ext.isString(item)) {
                m += item;
            } else {
                if (v[i] && item.test(v[i])) {
                    m += v[i];
                } else {
                    m += this.blankChar;
                }
                i++;
            }
        }, this)
        return m;
    },
    maskMoney: function(v) {
        v = String(this.unmask(v));
        var negativo = false;
        if (v.indexOf('-') >= 0) {
            negativo = true;
            v = v.replace(new RegExp('\[-\]', 'g'), '');
        }
        if (Math.round(v) !== v) {
            v = Math.round(Number(Ext.num(v, 0)) * Number('1' + String.leftPad('', this.moneyPrecision, '0')));
        }
        v = String.leftPad(Number(Ext.num(v, 0)), this.moneyZeros, '0');
        v = v.split('');
        var m = '';
        var i = v.length - 1;
        var mi = this.maskList.length - 1;
        while (i >= 0) {
            var item = this.maskList[mi];
            if (mi >= 0) {
                if (Ext.isString(item)) {
                    m = item + m;
                } else {
                    if (v[i] && item.test(v[i])) {
                        m = v[i] + m;
                    } else {
                        m = '0' + m;
                    }
                    i--;
                }
                mi--;
            } else {
                if (this.specialChars['9'].test(v[i])) {
                    m = v[i] + m;
                }
                i--;
            }
        }
        if (this.textMask.indexOf('#') >= 0) {
            m = this.textMask.slice(0, this.textMask.indexOf('#')) + (negativo ? '-' : '') + m;
        }
        return m;
    },
    unmask: function(v) {
        v = v === undefined ? '' : v;
        return this.money ? this.unmaskMoney(v) : this.unmaskNormal(v);
    },
    unmaskNormal: function(v) {
        v = String(v);
        var specialChars = '';
        Ext.iterate(this.specialChars, function(k) {
            specialChars += k;
        })
        var chars = this.textMask.replace(new RegExp('\[' + specialChars + '\]', 'g'), '');
        v = v.replace(new RegExp('\[' + chars + '\]', 'g'), '');
        v = v.split('');
        var m = '';
        var i = 0;
        Ext.each(this.maskList, function(item) {
            if (!Ext.isString(item)) {
                if (v[i] && item.test(v[i])) {
                    m += v[i];
                }
                i++;
            }
        }, this)
        return m;
    },
    unmaskMoney: function(v) {
        v = String(v);
        if (v.indexOf('+') >= 0) {
            v = v.replace(new RegExp('\[-\]', 'g'), '');
        }
        var negativo = v.indexOf('-') >= 0;
        var precision = v.lastIndexOf('.');
        if (precision === -1) {
            precision = 0;
        } else {
            precision = v.length - precision - 1;
        }
        if (precision > this.moneyPrecision) {
            v = v.slice(0, -(precision - this.moneyPrecision));
            precision = this.moneyPrecision;
        }
        var specialChars = '';
        Ext.iterate(this.specialChars, function(k) {
            specialChars += k;
        })
        var chars = this.textMask.replace(new RegExp('\[' + specialChars + '\]', 'g'), '');
        v = v.replace(new RegExp('\[' + chars + '\]', 'g'), '');
        v = v.split('');
        var m = '';
        var i = v.length - 1;
        var mi = this.maskList.length - 1;
        while (i >= 0) {
            if (mi >= 0) {
                var item = this.maskList[mi];
                if (!Ext.isString(item)) {
                    if (v[i] && item.test(v[i])) {
                        m = v[i] + m;
                    }
                    i--;
                }
                mi--;
            } else {
                if (v[i] && this.specialChars['9'].test(v[i])) {
                    m = v[i] + m;
                }
                i--;
            }
        }
        m = this.parsePrecision(m, precision);
        if (negativo) {
            m = '-' + m;
        }
        return String(m);
    },
    parsePrecision: function(v, precision) {
        v = String(v);
        var sinal = v.indexOf('-') >= 0 ? '-' : '';
        v = v + String.leftPad('', this.moneyPrecision - precision, '0');
        if (this.moneyPrecision > 0) {
            v = String.leftPad(v, this.moneyPrecision + 1, '0');
            return sinal + String(Ext.num(v.slice(0, -this.moneyPrecision), 0)) + '.' + v.slice(-this.moneyPrecision);
        } else {
            return sinal + v;
        }
    },
    parseMask: function(mask) {
        var regList = [];
        if (this.money) {
            this.moneyZeros = 0;
            while (mask.indexOf('0') >= 0) {
                mask = mask.replace('0', '9');
                this.moneyZeros++;
            }
            this.moneyPrecision = Math.min(mask.length - Math.max(mask.lastIndexOf('.'), mask.lastIndexOf(',')) - 1, mask.length);
        }
        //
        Ext.each(mask.match(/<![^<][^!]*!>/g), function(exp) {
            regList.push(new RegExp('^' + exp.replace(/(<!)|(!>)/g, '') + '$', ''));
        })
        mask = mask.replace(/<![^<][^!]*!>/g, '?');
        this.textMask = mask;
        if (this.money) {
            mask = mask.slice(mask.indexOf('#') + 1);
        }
        this.maskList = [];
        var regI = 0;
        var maskArr = mask.split('');
        for (var i = 0; i < maskArr.length; i++) {
            if (maskArr[i] === '?') {
                this.maskList.push(regList[regI]);
                regI++;
            } else {
                this.maskList.push(this.specialChars[maskArr[i]] || maskArr[i]);
            }
        }
        return this.maskList;
    },
    getLength: function(v) {
        v = this.mask(v);
        var i = v.indexOf(this.blankChar);
        if (i === -1) {
            i = v.length;
        }
        return i;
    },
    setMask: function(mask) {
        if (!Ext.isEmpty(mask) && mask !== this.oldMask) {
            this.oldMkask = mask;
            this.parseMask(mask);
        } else if (Ext.isEmpty(this.oldMask)) {
            this.parseMask('');
        }
        return this;
    }
})
/**
 * Aqui temos um Sigleton para a mascara, use para formatações rapidas, exemplo
 *   Ext.util.Format.TextMask.setMask('99/99/9999').mask('10102010'); //Vai retornar 10/10/2010
 **/
Ext.util.Format.TextMask = new Ext.ux.TextMaskCore();
/**
 * Aqui temos um Sigleton para a mascara de valores, use para formatações rapidas, exemplo
 *   Ext.util.Format.MoneyMask.setMask('R$#9.990,00').mask('100'); //Vai retornar R$100,00
 **/
Ext.util.Format.MoneyMask = new Ext.ux.TextMaskCore('', true);
/*** 
 * Aqui temos um renderer pra colunas de um grid
 *   {
 *     header: 'Telefone',
 *     dataIndex: 'fone',
 *     renderer: Ext.util.Format.maskRenderer('(099) 9999-9999')
 *   }
 **/
Ext.util.Format.maskRenderer = function(mask, money) {
    return function(v) {
        Ext.util.Format.TextMask.money = money;
        return Ext.util.Format.TextMask.setMask(mask).mask(v);
    }
}