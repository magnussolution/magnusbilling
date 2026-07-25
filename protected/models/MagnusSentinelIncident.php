<?php

/**
 * Modelo mínimo usado somente para integrar autenticação e autorização.
 *
 * @magnus-sentinel-managed
 *
 * A API usa comandos SELECT explícitos e bloqueia todas as ações herdadas de
 * escrita. A permissão de leitura reutilizada é a do módulo administrativo
 * trunk do MagnusBilling.
 */
class MagnusSentinelIncident extends Model
{
    protected $_module = 'trunk';

    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    public function tableName()
    {
        return 'pkg_magnus_sentinel_incident';
    }

    public function primaryKey()
    {
        return 'id';
    }

    public function rules()
    {
        return [];
    }
}
