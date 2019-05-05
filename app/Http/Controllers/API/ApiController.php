<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\User;
use Hash;
use Illuminate\Support\Str;

class ApiController extends Controller
{

    /**
     * Check Fresh Login
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify()
    {
        $user= new User();

        $admin = User::where('type', $user->isAdmin())->first();

        if(!$admin->verified){
            return response()->json([
                'check' => false,
            ]);
        } else {
            return response()->json([
                'check' => true,
            ]);
        }
    }

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
                'message' => 'Wrong email address!',
                'status' => 401,
            ], 401);
        }

        if(!Hash::check(request('password'), $user->password)) {
            return response()->json([
                'message' => 'Wrong password!',
                'status' => 401,
            ], 401);
        }

        if($user->type === $admin->isAdmin()){

            $token = Str::random(80);
            $user->api_token = hash('sha256', $token);

            $user->save();

            return response()->json([
                'name' => $user->name,
                'token' => $token,
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
     * Change Admin credentials.
     *
     */
    public function register()
    {

        $user = User::where('email', request('oldEmail'))->first();

        if(!$user){
            return response()->json([
                'message' => 'Wrong email address!',
                'status' => 401,
            ], 401);
        }

        if(!Hash::check(request('oldPassword'), $user->password)) {
            return response()->json([
                'message' => 'Wrong password!',
                'status' => 401,
            ], 401);
        }

        $validateData = request()->validate([
           'email' => 'bail|required|unique:users|email',
           'password' => 'required|min:8'
        ]);

        $user->email = $validateData['email'];
        $user->password = Hash::make(htmlentities($validateData['password']));
        $user->verified = true;

        $user->save();

        return response()->json([
            'message' => 'The credentials was changed!',
            'status' => 201,
        ], 201);
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
