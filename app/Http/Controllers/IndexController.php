<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Jenssegers\Agent\Agent;

class IndexController extends Controller
{
	public function index()

	{

		$agent = new Agent();

		if( $agent->isDesktop() ){

			return view( 'layouts.master' );

		}

		if ( $agent->isMobile() ) {

			if( request()->path() != '/' ){

				abort(404);

			} else {

				return view( 'layouts.mobile' );

			}

		}

		if ( $agent->isRobot() ) {

			return view( 'layouts.master' );

		}

	}

	public function store(Request $request){

		$this->validate(request(), [

			'name' => 'required',

			'from' => 'required',

			'message' => 'required'

			]);

		return ['Your message Submited. Thank you!'];

	}
}
