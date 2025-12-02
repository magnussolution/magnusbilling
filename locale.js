(function() {
    var _constants = {};
    window.Locale = {
        load: function(constants) {
            _constants = constants;
        }
    };
    /**
     * Recebe uma string. Se achar tradução, retorna. 
     * Caso contrário, retorna a própria string.
     * 
     *      _('Administração') em pt-BR retorna 'Administração'
     *      mas em en-US vai achar a tradução e retornar 'Administration'
     * 
     */
    window.t = function(string) {
        return _constants[string] || string;
    }
}());
(function() {
    var _constants = {};
    window.Help = {
        load: function(constants) {
            _constants = constants;
        }
    };
    window.h = function(string) {
        if (_constants[string] && _constants[string].match(/\|\|/)) {
            partOfString = _constants[string].split('||');
            data = string.split('.');
            return '<a href="https://wiki.magnusbilling.org/' + window.lang + '/source/modules/' + data[0] + '/' + data[0] + '.html#' + data[0] + '-' + data[1].replace('_', '-') + '" target="_blank" alt="' + partOfString[0] + '. ' + t('Click to more details') + '" class="tooltipHelp" > <img src="./resources/images/help.png" /> </a>&nbsp;&nbsp;&nbsp;';
        } else if (_constants[string] && _constants[string].match(/\|http/)) {
            partOfString = _constants[string].split('|');
            return '<a href="' + partOfString[1] + '" target="_blank" alt="' + partOfString[0] + '" class="tooltipHelp" > <img src="./resources/images/help.png" /> </a>&nbsp;&nbsp;&nbsp;';
        } else {
            return _constants[string] ? '<a href="#" alt="' + _constants[string] + '" class="tooltipHelp" > <img src="./resources/images/help.png" /> </a>&nbsp;&nbsp;&nbsp;' : '';
        }
    }
}());