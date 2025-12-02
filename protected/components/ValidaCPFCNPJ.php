<?php
/**
 * ValidaCPFCNPJ valida e formata CPF e CNPJ
 *
 * Exemplo de uso:
 * $cpf_cnpj  = new ValidaCPFCNPJ('71569042000196');
 * $formatado = $cpf_cnpj->formata(); // 71.569.042/0001-96
 * $valida    = $cpf_cnpj->valida(); // True -> Válido
 *
 * @package  valida-cpf-cnpj
 * @author   Luiz Otávio Miranda <contato@tutsup.com>
 * @version  v1.3
 * @access   public
 * @see      http://www.tutsup.com/
 */
class ValidaCPFCNPJ
{
    /**
     * Configura o valor (Construtor)
     *
     * Remove caracteres inválidos do CPF ou CNPJ
     *
     * @param string $valor - O CPF ou CNPJ
     */
    public function __construct($valor = null)
    {
        // Deixa apenas números no valor
        $this->valor = preg_replace('/[^0-9]/', '', $valor);

        // Garante que o valor é uma string
        $this->valor = (string) $this->valor;
    }

    /**
     * Verifica se é CPF ou CNPJ
     *
     * Se for CPF tem 11 caracteres, CNPJ tem 14
     *
     * @access protected
     * @return string CPF, CNPJ ou false
     */
    protected function verifica_cpf_cnpj()
    {
        // Verifica CPF
        if (strlen($this->valor) === 11) {
            return 'CPF';
        }
        // Verifica CNPJ
        elseif (strlen($this->valor) === 14) {
            return 'CNPJ';
        }
        // Não retorna nada
        else {
            return false;
        }
    }

    /**
     * Multiplica dígitos vezes posições
     *
     * @access protected
     * @param  string    $digitos      Os digitos desejados
     * @param  int       $posicoes     A posição que vai iniciar a regressão
     * @param  int       $soma_digitos A soma das multiplicações entre posições e dígitos
     * @return int                     Os dígitos enviados concatenados com o último dígito
     */
    protected function calc_digitos_posicoes($digitos, $posicoes = 10, $soma_digitos = 0)
    {
        // Faz a soma dos dígitos com a posição
        // Ex. para 10 posições:
        //   0    2    5    4    6    2    8    8   4
        // x10   x9   x8   x7   x6   x5   x4   x3  x2
        //   0 + 18 + 40 + 28 + 36 + 10 + 32 + 24 + 8 = 196
        for ($i = 0; $i < strlen($digitos); $i++) {
            // Preenche a soma com o dígito vezes a posição
            $soma_digitos = $soma_digitos + ($digitos[$i] * $posicoes);

            // Subtrai 1 da posição
            $posicoes--;

            // Parte específica para CNPJ
            // Ex.: 5-4-3-2-9-8-7-6-5-4-3-2
            if ($posicoes < 2) {
                // Retorno a posição para 9
                $posicoes = 9;
            }
        }

        // Captura o resto da divisão entre $soma_digitos dividido por 11
        // Ex.: 196 % 11 = 9
        $soma_digitos = $soma_digitos % 11;

        // Verifica se $soma_digitos é menor que 2
        if ($soma_digitos < 2) {
            // $soma_digitos agora será zero
            $soma_digitos = 0;
        } else {
            // Se for maior que 2, o resultado é 11 menos $soma_digitos
            // Ex.: 11 - 9 = 2
            // Nosso dígito procurado é 2
            $soma_digitos = 11 - $soma_digitos;
        }

        // Concatena mais um dígito aos primeiro nove dígitos
        // Ex.: 025462884 + 2 = 0254628842
        $cpf = $digitos . $soma_digitos;

        // Retorna
        return $cpf;
    }

    /**
     * Valida CPF
     *
     * @author                Luiz Otávio Miranda <contato@tutsup.com>
     * @access protected
     * @param  string    $cpf O CPF com ou sem pontos e traço
     * @return bool           True para CPF correto - False para CPF incorreto
     */
    public function valida_cpf()
    {
        // Captura os 9 primeiros dígitos do CPF
        // Ex.: 02546288423 = 025462884
        $digitos = substr($this->valor, 0, 9);

        // Faz o cálculo dos 9 primeiros dígitos do CPF para obter o primeiro dígito
        $novo_cpf = $this->calc_digitos_posicoes($digitos);

        // Faz o cálculo dos 10 dígitos do CPF para obter o último dígito
        $novo_cpf = $this->calc_digitos_posicoes($novo_cpf, 11);

        // Verifica se o novo CPF gerado é idêntico ao CPF enviado
        if ($novo_cpf === $this->valor) {
            // CPF válido
            return true;
        } else {
            // CPF inválido
            return false;
        }
    }

    /**
     * Valida CNPJ
     *
     * @author                  Luiz Otávio Miranda <contato@tutsup.com>
     * @access protected
     * @param  string     $cnpj
     * @return bool             true para CNPJ correto
     */
    public function valida_cnpj()
    {
        // O valor original
        $cnpj_original = $this->valor;

        // Captura os primeiros 12 números do CNPJ
        $primeiros_numeros_cnpj = substr($this->valor, 0, 12);

        // Faz o primeiro cálculo
        $primeiro_calculo = $this->calc_digitos_posicoes($primeiros_numeros_cnpj, 5);

        // O segundo cálculo é a mesma coisa do primeiro, porém, começa na posição 6
        $segundo_calculo = $this->calc_digitos_posicoes($primeiro_calculo, 6);

        // Concatena o segundo dígito ao CNPJ
        $cnpj = $segundo_calculo;

        // Verifica se o CNPJ gerado é idêntico ao enviado
        if ($cnpj === $cnpj_original) {
            return true;
        }
    }

    /**
     * Valida
     *
     * Valida o CPF ou CNPJ
     *
     * @access public
     * @return bool      True para válido, false para inválido
     */
    public function valida()
    {
        // Valida CPF
        if ($this->verifica_cpf_cnpj() === 'CPF') {
            // Retorna true para cpf válido
            return $this->valida_cpf();
        }
        // Valida CNPJ
        elseif ($this->verifica_cpf_cnpj() === 'CNPJ') {
            // Retorna true para CNPJ válido
            return $this->valida_cnpj();
        }
        // Não retorna nada
        else {
            return false;
        }
    }

    /**
     * Formata CPF ou CNPJ
     *
     * @access public
     * @return string  CPF ou CNPJ formatado
     */
    public function formata()
    {
        // O valor formatado
        $formatado = false;

        // Valida CPF
        if ($this->verifica_cpf_cnpj() === 'CPF') {
            // Verifica se o CPF é válido
            if ($this->valida_cpf()) {
                // Formata o CPF ###.###.###-##
                $formatado = substr($this->valor, 0, 3) . '.';
                $formatado .= substr($this->valor, 3, 3) . '.';
                $formatado .= substr($this->valor, 6, 3) . '-';
                $formatado .= substr($this->valor, 9, 2) . '';
            }
        }
        // Valida CNPJ
        elseif ($this->verifica_cpf_cnpj() === 'CNPJ') {
            // Verifica se o CPF é válido
            if ($this->valida_cnpj()) {
                // Formata o CNPJ ##.###.###/####-##
                $formatado = substr($this->valor, 0, 2) . '.';
                $formatado .= substr($this->valor, 2, 3) . '.';
                $formatado .= substr($this->valor, 5, 3) . '/';
                $formatado .= substr($this->valor, 8, 4) . '-';
                $formatado .= substr($this->valor, 12, 14) . '';
            }
        }

        // Retorna o valor
        return $formatado;
    }
}
