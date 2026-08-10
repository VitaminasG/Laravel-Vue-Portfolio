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
}
