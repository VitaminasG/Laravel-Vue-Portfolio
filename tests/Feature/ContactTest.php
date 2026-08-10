<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Mail\ContactMe;
use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Covers POST /ContactMe: persistence, mail dispatch and the response.
 */
class ContactTest extends TestCase
{
    use RefreshDatabase;

    private function payload()
    {
        return [
            'name' => 'Tester',
            'from' => 'tester@example.com',
            'message' => 'Hello there',
        ];
    }

    public function test_the_message_is_mailed_to_the_configured_recipient()
    {
        Mail::fake();
        config(['contact.recipient' => 'configured@example.com']);

        $this->post('/ContactMe', $this->payload())->assertSuccessful();

        Mail::assertSent(ContactMe::class, function ($mail) {
            return $mail->hasTo('configured@example.com');
        });
    }

    public function test_the_mailable_carries_a_plain_payload()
    {
        Mail::fake();

        $this->post('/ContactMe', $this->payload(), ['User-Agent' => 'TestAgent/1.0'])
            ->assertSuccessful();

        Mail::assertSent(ContactMe::class, function ($mail) {
            return $mail->payload['name'] === 'Tester'
                && $mail->payload['from'] === 'tester@example.com'
                && $mail->payload['body'] === 'Hello there'
                && $mail->payload['agent'] === 'TestAgent/1.0';
        });
    }

    public function test_a_submission_is_stored_and_answered_with_json()
    {
        Mail::fake();

        $this->postJson('/ContactMe', $this->payload(), ['User-Agent' => 'TestAgent/1.0'])
            ->assertStatus(200)
            ->assertExactJson(['message' => 'Message sent.']);

        $this->assertSame(1, \DB::table('indices')->count());
    }

    public function test_a_submission_without_a_message_is_rejected()
    {
        Mail::fake();

        $this->postJson('/ContactMe', ['name' => 'Tester', 'from' => 'tester@example.com'])
            ->assertStatus(422);

        Mail::assertNothingSent();
        $this->assertSame(0, \DB::table('indices')->count());
    }
}
