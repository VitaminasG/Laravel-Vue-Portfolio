<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\User;
use Hash;

class ApiController extends Controller
{
    /**
     * Login the Admin.
     *
     * @return \Illuminate\Http\Response
     */
    public function login()
    {

        $admin = new User();

        $user = User::where('email', request('email'))->first();

        if(!$user){
            return response()->json([
                'message' => 'Wrong email address'
            ], 401);
        }

        if(!Hash::check(request('password'), $user->password)) {
            return response()->json([
                'message' => 'Wrong password',
            ], 401);
        }

        if($user->type === $admin->isAdmin()){
            return response()->json([
                'message' => $user,
                'status' => 200
            ], 200);
        } else {
            return response()->json([
               'message' => 'You are not admin!',
               'status' => 401
            ], 401);
        }

    }


    /**
     * Register the Admin.
     *
     */
    public function register()
    {

        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
