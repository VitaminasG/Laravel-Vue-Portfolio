<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Http\Request;

class ContactMe extends Mailable
{
    use Queueable, SerializesModels;

    public $request;

    /**
     * Create a message instance
     *
     * @return void
     */
    public function __construct(Request $request)
    {

    	$this->request = $request;

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()

    {

        return $this->view('emails.contactMe')
	        ->with([
	        	'name' => $this->request->name,
	        	'from' => $this->request->from,
	        	'body' => $this->request->message,
		        'agent' => $this->request->agent
	        ]);
    }
}
