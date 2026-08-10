<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'type', 'api_token',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'api_token', 'remember_token', 'id',
    ];

    public const ROLE_ADMIN = 'admin';
    public const ROLE_DEFAULT = 'user';

    /**
     * Check if the user has the admin role.
     *
     * @return boolean
     */
    public function isAdmin()
    {
        return $this->type === self::ROLE_ADMIN;
    }
}
