<?php


namespace Dnetix\Redirection\Entities;


use Dnetix\Redirection\Contracts\Entity;
use Dnetix\Redirection\Traits\LoaderTrait;

class Item extends Entity
{
    use LoaderTrait;

    protected $sku;
    protected $name;
    protected $category;
    protected $qty;
    protected $price;
    protected $tax;

    public function __construct($data = [])
    {
        $this->load($data, ['sku', 'name', 'category', 'qty', 'price', 'tax']);
    }

    public function sku()
    {
        return $this->sku;
    }

    public function name()
    {
        return $this->name;
    }

    public function category()
    {
        return $this->category;
    }

    public function qty()
    {
        return $this->qty;
    }

    public function price()
    {
        return $this->price;
    }

    public function tax()
    {
        return $this->tax;
    }

    public function toArray()
    {
        return $this->arrayFilter([
            'sku' => $this->sku(),
            'name' => $this->name(),
            'category' => $this->category(),
            'qty' => $this->qty(),
            'price' => $this->price(),
            'tax' => $this->tax(),
        ]);
    }

}