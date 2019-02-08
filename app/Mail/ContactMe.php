<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ContactMe extends Mailable
{
    use Queueable, SerializesModels;

    protected $message, $from, $name;

    /**
     * message for me
     * from who I have message
     * @return void
     */
    public function __construct($message, $from, $name)
    {
        $this->message = $message;

        $this->from = $from;

        $this->name = $name;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()

    {

        return $this->from($from)->message($message)-name($name)->markdown('emails.contactMe');
    }
}
