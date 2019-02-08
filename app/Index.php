<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Index extends Model

{

	protected $fillable = ['name', 'message', 'from', 'agent'];

}
