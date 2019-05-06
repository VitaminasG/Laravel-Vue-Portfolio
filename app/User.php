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

    protected $roles = [
        'su' => 'admin',
    ];

    public function returnRole($type)
    {
        return $this->roles[$type];
    }

    /**
     * Check if User Type is Admin
     *
     * @return boolean
     */
    public function isAdmin()
    {
        return $this->returnRole('su');
    }

    /**
     * Return Admin Type
     *
     * @return string
     */
    public static function admin()
    {

        return $admin = 'admin';
    }

    /**
     * Return Default Type
     *
     * @return string
     */
    public static function default()
    {
        return $default = 'user';
    }
}
