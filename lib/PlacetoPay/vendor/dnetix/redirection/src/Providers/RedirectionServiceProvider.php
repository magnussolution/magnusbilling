<?php

namespace Dnetix\Redirection\Providers;

use Dnetix\Redirection\PlacetoPay;
use Illuminate\Support\ServiceProvider;

class RedirectionServiceProvider extends ServiceProvider
{
    public function boot()
    {
    }

    public function register()
    {
        $this->app->singleton(PlacetoPay::class, function () {
            return new PlacetoPay([
                'login' => env('P2P_LOGIN'),
                'tranKey' => env('P2P_TRANKEY'),
                'url' => env('P2P_URL', 'https://dev.placetopay.com/redirection'),
                'type' => env('P2P_TYPE', 'rest'),
            ]);
        });
    }

    public function provides()
    {
        return [
            PlacetoPay::class,
        ];
    }
}
