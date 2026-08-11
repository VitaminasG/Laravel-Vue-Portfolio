<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Safety net for IndexController: device-based layout selection and visit logging.
 *
 * NOTE: the controller builds Jenssegers\Agent\Agent with no arguments, so it reads
 * the User-Agent from the global $_SERVER rather than the request. Until that is made
 * testable (Phase 3), we set $_SERVER['HTTP_USER_AGENT'] in addition to the header.
 */
class VisitTest extends TestCase
{
    use RefreshDatabase;

    public const DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
    public const MOBILE_UA  = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1';
    public const ROBOT_UA   = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

    protected function tearDown(): void
    {
        unset($_SERVER['HTTP_USER_AGENT']);
        parent::tearDown();
    }

    private function visit(string $ua, string $path = '/')
    {
        $_SERVER['HTTP_USER_AGENT'] = $ua;

        return $this->get($path, ['User-Agent' => $ua]);
    }

    public function test_desktop_visitor_gets_the_spa_shell()
    {
        $this->visit(self::DESKTOP_UA)
            ->assertStatus(200)
            ->assertSee('id="app"', false);
    }

    public function test_mobile_visitor_gets_the_mobile_layout()
    {
        $this->visit(self::MOBILE_UA)
            ->assertStatus(200)
            ->assertSee('mobApp', false);
    }

    public function test_mobile_visitor_is_blocked_on_non_root_paths()
    {
        $this->visit(self::MOBILE_UA, '/Dashboard')
            ->assertStatus(404);
    }

    public function test_a_visit_records_a_stats_row()
    {
        $this->assertSame(0, \DB::table('stats')->count());

        $this->visit(self::DESKTOP_UA)->assertStatus(200);

        $this->assertSame(1, \DB::table('stats')->count());
    }

    public function test_an_empty_user_agent_still_receives_a_layout()
    {
        $this->visit('')
            ->assertStatus(200)
            ->assertSee('id="app"', false);
    }
}
