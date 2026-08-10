<?php

namespace Tests\Feature;

use App\User;
use Tests\TestCase;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Safety net for the admin auth flow (verify / login / register / stats).
 * The users migration seeds admin@example.com / 12345678 (type=admin, verified=0).
 */
class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('cache:clear');
    }

    public function test_verify_returns_false_for_an_unverified_admin()
    {
        $this->getJson('/api/verify')
            ->assertStatus(200)
            ->assertExactJson(['check' => false]);
    }

    public function test_verify_returns_true_once_the_admin_is_verified()
    {
        User::where('email', 'admin@example.com')->update(['verified' => true]);

        $this->getJson('/api/verify')
            ->assertStatus(200)
            ->assertExactJson(['check' => true]);
    }

    public function test_verify_returns_false_when_no_admin_row_exists()
    {
        User::query()->delete();

        $this->getJson('/api/verify')
            ->assertStatus(200)
            ->assertExactJson(['check' => false]);
    }

    public function test_login_fails_with_an_unknown_email()
    {
        $this->postJson('/api/login', ['email' => 'nobody@example.com', 'password' => 'x'])
            ->assertStatus(401)
            ->assertJson(['message' => 'Wrong email address!']);
    }

    public function test_login_fails_with_a_wrong_password()
    {
        $this->postJson('/api/login', ['email' => 'admin@example.com', 'password' => 'nope'])
            ->assertStatus(401)
            ->assertJson(['message' => 'Wrong password!']);
    }

    public function test_login_succeeds_with_the_seeded_admin_and_issues_a_token()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => '12345678',
        ])->assertStatus(200)
          ->assertJson(['name' => 'admin', 'status' => 200]);

        $token = $response->json('token');
        $this->assertNotEmpty($token);
        $this->assertSame($token, User::where('email', 'admin@example.com')->first()->api_token);
    }

    public function test_register_changes_credentials_and_marks_verified()
    {
        $token = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => '12345678',
        ])->json('token');

        $this->postJson('/api/register', [
            'oldEmail' => 'admin@example.com',
            'oldPassword' => '12345678',
            'email' => 'new@example.com',
            'password' => 'newpassword123',
        ])->assertStatus(201)
          ->assertJson(['message' => 'The credentials was changed!']);

        $admin = User::where('email', 'new@example.com')->first();
        $this->assertNotNull($admin);
        $this->assertTrue((bool) $admin->verified);
        $this->assertTrue(Hash::check('newpassword123', $admin->password));
        $this->assertNull($admin->api_token);

        // The test harness shares one application instance across these
        // chained requests, so the 'api' guard resolved during login is
        // still cached with the now-stale token attached. Drop it here to
        // simulate the fresh container a real follow-up request would get.
        $this->app->forgetInstance('auth');

        $this->getJson('/api/stats', ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(401);
    }

    public function test_register_rejects_wrong_old_credentials()
    {
        $this->postJson('/api/register', [
            'oldEmail' => 'admin@example.com',
            'oldPassword' => 'wrong',
            'email' => 'new@example.com',
            'password' => 'newpassword123',
        ])->assertStatus(401);
    }

    public function test_register_validates_the_new_password_length()
    {
        $this->postJson('/api/register', [
            'oldEmail' => 'admin@example.com',
            'oldPassword' => '12345678',
            'email' => 'new@example.com',
            'password' => 'short',
        ])->assertStatus(422);
    }

    public function test_can_log_in_with_the_new_credentials_after_register()
    {
        $this->postJson('/api/register', [
            'oldEmail' => 'admin@example.com',
            'oldPassword' => '12345678',
            'email' => 'new@example.com',
            'password' => 'newpassword123',
        ])->assertStatus(201);

        $this->postJson('/api/login', [
            'email' => 'new@example.com',
            'password' => 'newpassword123',
        ])->assertStatus(200);
    }

    public function test_stats_requires_authentication()
    {
        $this->getJson('/api/stats')->assertStatus(401);
    }

    public function test_stats_returns_data_for_an_authenticated_admin()
    {
        $token = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => '12345678',
        ])->json('token');

        $this->getJson('/api/stats', ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_stats_returns_403_for_an_authenticated_non_admin()
    {
        $visitor = User::create([
            'name' => 'visitor',
            'email' => 'visitor@example.com',
            'password' => Hash::make('password123'),
            'type' => User::ROLE_DEFAULT,
            'api_token' => Str::random(80),
        ]);

        $this->getJson('/api/stats', ['Authorization' => 'Bearer ' . $visitor->api_token])
            ->assertStatus(403);
    }

    public function test_a_password_with_html_characters_survives_register_and_login()
    {
        $password = 'p<a>&"\'ssw0rd';

        $this->postJson('/api/register', [
            'oldEmail' => 'admin@example.com',
            'oldPassword' => '12345678',
            'email' => 'new@example.com',
            'password' => $password,
        ])->assertStatus(201);

        $this->postJson('/api/login', [
            'email' => 'new@example.com',
            'password' => $password,
        ])->assertStatus(200);
    }

    public function test_unauthenticated_request_returns_401_without_a_json_accept_header()
    {
        $this->get('/api/stats')->assertStatus(401);
    }

    public function test_logout_clears_the_token_and_invalidates_it()
    {
        $token = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => '12345678',
        ])->json('token');

        $this->postJson('/api/logout', [], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200)
            ->assertJson(['message' => 'Logged out.']);

        $this->assertNull(User::where('email', 'admin@example.com')->first()->api_token);

        // The test harness shares one application instance across these chained
        // requests, so the 'api' guard resolved during the logout call is still
        // cached with the now-stale user attached. Drop it here to simulate the
        // fresh container a real follow-up request would get.
        $this->app->forgetInstance('auth');

        $this->getJson('/api/stats', ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(401);
    }

    public function test_register_is_not_reachable_over_get()
    {
        $this->getJson('/api/register')->assertStatus(405);
    }

    public function test_login_is_throttled_after_ten_attempts()
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong',
            ])->assertStatus(401);
        }

        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong',
        ])->assertStatus(429);
    }

    public function test_verify_traffic_does_not_consume_the_login_throttle_budget()
    {
        // /api/verify allows 60 requests/min; /api/login allows 10. Before the
        // per-route throttle fix, both shared one IP-keyed counter, so this
        // burst of verify calls alone was enough to exhaust login's budget.
        for ($i = 0; $i < 10; $i++) {
            $this->getJson('/api/verify')->assertStatus(200);
        }

        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong',
        ])->assertStatus(401);
    }

    public function test_anonymous_traffic_to_a_guarded_route_is_throttled_not_just_rejected()
    {
        // The guarded group declares the throttle before auth:api on purpose.
        // Middleware runs in declared order, so an anonymous request is counted
        // by the rate limiter first and only then rejected by the guard. With
        // the order reversed, auth:api answers 401 before the limiter ever sees
        // the request, and /api/stats and /api/logout can be hammered forever
        // at no cost — each rejection still costs a users-table lookup.
        //
        // The limit is 60/min, so the first 60 are refused for lack of a token
        // and the 61st is refused for exceeding the budget.
        for ($i = 0; $i < 60; $i++) {
            $this->getJson('/api/stats')->assertStatus(401);
        }

        $this->getJson('/api/stats')->assertStatus(429);
    }

    public function test_is_admin_returns_a_real_boolean()
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $this->assertTrue($admin->isAdmin());

        $visitor = new User(['type' => User::ROLE_DEFAULT]);

        $this->assertFalse($visitor->isAdmin());
    }

    public function test_login_refuses_a_non_admin_with_valid_credentials()
    {
        User::create([
            'name' => 'visitor',
            'email' => 'visitor@example.com',
            'password' => Hash::make('password123'),
            'type' => User::ROLE_DEFAULT,
        ]);

        // The credentials are correct; only the role is wrong, so this proves
        // the admin check rather than the password check.
        $this->postJson('/api/login', [
            'email' => 'visitor@example.com',
            'password' => 'password123',
        ])->assertStatus(401)
          ->assertJson(['message' => 'You are not admin!']);

        $this->assertNull(User::where('email', 'visitor@example.com')->first()->api_token);
    }

    public function test_logout_requires_authentication()
    {
        $this->postJson('/api/logout')->assertStatus(401);
    }

    public function test_register_is_throttled_after_ten_attempts()
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/register', [
                'oldEmail' => 'admin@example.com',
                'oldPassword' => 'wrong',
                'email' => 'new@example.com',
                'password' => 'newpassword123',
            ])->assertStatus(401);
        }

        $this->postJson('/api/register', [
            'oldEmail' => 'admin@example.com',
            'oldPassword' => 'wrong',
            'email' => 'new@example.com',
            'password' => 'newpassword123',
        ])->assertStatus(429);
    }
}
