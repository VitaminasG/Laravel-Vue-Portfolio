<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Stats extends Model
{
    protected $fillable = ['ip', 'agent', 'date'];


    public function getDate(){

        $dt = Carbon::now();

        return $dt->toDateString();
    }
}
