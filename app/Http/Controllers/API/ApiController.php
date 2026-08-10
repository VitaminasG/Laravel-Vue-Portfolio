<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\User;
use App\Stats;
use App\Http\Resources\Stats as StatResource;
use Hash;
use Illuminate\Support\Str;

class ApiController extends Controller
{

    /**
     * Check Fresh Login
     *
     */
    public function verify()
    {
        $admin = User::where('type', User::ROLE_ADMIN)->first();

        return response()->json([
            'check' => (bool) optional($admin)->verified,
        ]);
    }

    /**
     * Resolve a user from request credentials.
     *
     * @param  string  $emailKey
     * @param  string  $passwordKey
     * @return array  [User|null, JsonResponse|null]
     */
    private function findUser($emailKey, $passwordKey)
    {
        $user = User::where('email', request($emailKey))->first();

        if (! $user) {
            return [null, response()->json([
                'message' => 'Wrong email address!',
                'status' => 401,
            ], 401)];
        }

        if (! Hash::check(request($passwordKey), $user->password)) {
            return [null, response()->json([
                'message' => 'Wrong password!',
                'status' => 401,
            ], 401)];
        }

        return [$user, null];
    }

    /**
     * Login the Admin.
     *
     */
    public function login()
    {
        list($user, $error) = $this->findUser('email', 'password');

        if ($error) {
            return $error;
        }

        if($user->isAdmin()){

            $token = Str::random(80);
            $user->api_token = $token;

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
        list($user, $error) = $this->findUser('oldEmail', 'oldPassword');

        if ($error) {
            return $error;
        }

        $validateData = request()->validate([
           'email' => 'bail|required|unique:users|email',
           'password' => 'required|min:8'
        ]);

        $user->email = $validateData['email'];
        $user->password = Hash::make($validateData['password']);
        $user->verified = true;
        $user->api_token = null;

        $user->save();

        return response()->json([
            'message' => 'The credentials was changed!',
            'status' => 201,
        ], 201);
    }


    /**
     * Get Statistic for Dashboard
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        if (! auth('api')->user()->isAdmin()) {

            return response()->json([
                'message' => 'You are not Admin!',
            ], 403);
        }

        return response()->json([
            'data' => StatResource::collection(Stats::latest()->take(5)->get()),
        ], 200);
    }

    /**
     * Invalidate the current API token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $user = auth('api')->user();

        $user->api_token = null;
        $user->save();

        return response()->json([
            'message' => 'Logged out.',
        ], 200);
    }

}
