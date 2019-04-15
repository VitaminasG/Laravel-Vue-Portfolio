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
        'name', 'email', 'password', 'type'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $roles = [
        'su' => 'admin',
        'author' => 'author'
    ];

    public function returnRole($type){
        return $this->roles[$type];
    }
    /**
     * Check if User Type is Admin
     *
     * @return boolean
     */
    public function isAdmin(){
        return $this->type === $this->returnRole('su');
    }
    /**
     * Check if User Type is Author
     *
     * @return boolean
     */
    public function isAuthor(){
        return $this->type === $this->returnRole('author');
    }
    /**
     * Return Default Type
     *
     * @return string
     */
    public static function default(){
        return $default = 'user';
    }
    /**
     * Return Admin Type
     *
     * @return string
     */
    public static function admin(){
        return $admin = 'admin';
    }
}
