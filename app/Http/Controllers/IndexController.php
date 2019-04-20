<?php

namespace App\Http\Controllers;

use App\Index;
use App\Mail\ContactMe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Jenssegers\Agent\Agent;

class IndexController extends Controller
{

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */

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

			return view( 'layouts.server' );

		}

	}


    /**
     * @param Request $request
     * @throws \Illuminate\Validation\ValidationException
     */

    public function store(Request $request){

		$this->validate(request(), [

			'name' => 'required',

			'from' => 'required',

			'message' => 'required'

			]);

		$request->agent = $request->header('User-Agent');

		$data = new Index;

		$data->name = $request->name;
		$data->from = $request->from;
		$data->message = $request->message;
		$data->agent = $request->agent;

		$data->save();

		Mail::to("vitaminas.g@gmail.com")->send(new ContactMe($request));

	}


}
