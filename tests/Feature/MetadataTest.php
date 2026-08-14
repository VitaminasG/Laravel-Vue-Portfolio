<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Phase D of the UX work.
 *
 * Every layout used to render `<title>Portfolio</title>` and nothing else — no
 * description, no Open Graph, no Twitter card — so sharing the URL anywhere
 * produced a bare link with no image, no summary and nobody's name on it. All
 * three layouts now include the same partial, and this pins that down for each
 * of them rather than for whichever one happened to be checked.
 *
 * The User-Agent handling mirrors VisitTest: the controller reads $_SERVER.
 */
class MetadataTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        unset($_SERVER['HTTP_USER_AGENT']);
        parent::tearDown();
    }

    private function visit(string $ua)
    {
        $_SERVER['HTTP_USER_AGENT'] = $ua;

        return $this->get('/', ['User-Agent' => $ua]);
    }

    public static function layoutProvider(): array
    {
        return [
            'desktop' => [VisitTest::DESKTOP_UA],
            'mobile' => [VisitTest::MOBILE_UA],
            'crawler' => [VisitTest::ROBOT_UA],
        ];
    }

    #[DataProvider('layoutProvider')]
    public function test_every_layout_names_the_person_in_its_title(string $ua): void
    {
        $response = $this->visit($ua);

        $response->assertOk();
        $response->assertSee('<title>' . config('site.title') . '</title>', false);
        $response->assertDontSee('<title>Portfolio</title>', false);
    }

    #[DataProvider('layoutProvider')]
    public function test_every_layout_carries_a_description(string $ua): void
    {
        $response = $this->visit($ua);

        $response->assertSee('name="description"', false);
        $response->assertSee(config('site.description'), false);
    }

    #[DataProvider('layoutProvider')]
    public function test_every_layout_carries_a_link_preview_card(string $ua): void
    {
        $response = $this->visit($ua);

        foreach (['og:title', 'og:description', 'og:image', 'og:url', 'og:type'] as $property) {
            $response->assertSee('property="' . $property . '"', false);
        }

        $response->assertSee('name="twitter:card"', false);
        $response->assertSee('content="summary_large_image"', false);
    }

    #[DataProvider('layoutProvider')]
    public function test_the_preview_image_is_an_absolute_url(string $ua): void
    {
        // Relative paths are silently ignored by most platforms, which is a
        // failure that only shows up once a link is already out in the world.
        $this->visit($ua)->assertSee(
            'property="og:image" content="' . url(config('site.image')) . '"',
            false
        );
    }

    public function test_the_preview_image_exists_and_is_the_size_it_claims(): void
    {
        $path = public_path(ltrim(config('site.image'), '/'));

        $this->assertFileExists($path);

        // The tags declare 1200x630; a mismatch gets the image cropped or dropped.
        [$width, $height] = getimagesize($path);
        $this->assertSame(1200, $width);
        $this->assertSame(630, $height);
    }

    public function test_the_crawler_page_has_a_real_heading_and_links_to_follow(): void
    {
        $response = $this->visit(VisitTest::ROBOT_UA);

        $response->assertSee('<h1>' . config('site.author') . '</h1>', false);

        foreach (config('site.profiles') as $url) {
            $response->assertSee('href="' . $url . '"', false);
        }

        $response->assertSee('mailto:' . config('contact.recipient'), false);
    }

    public function test_the_crawler_page_references_the_avatar_by_its_real_filename(): void
    {
        // The file is Gediminas.png; the markup asked for gediminas.png, which
        // macOS resolves and a Linux server does not.
        $this->visit(VisitTest::ROBOT_UA)->assertSee('/images/Gediminas.png', false);

        $this->assertFileExists(public_path('images/Gediminas.png'));
    }
}
