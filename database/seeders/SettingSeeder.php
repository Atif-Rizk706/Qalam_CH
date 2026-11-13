<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Contact settings
            [
                'key'          => 'phone',
                'value'        => '+201234567890',
                'display_name' => 'رقم الهاتف',
                'group'        => 'contact',
                'type'         => 'text',
            ],
            [
                'key'          => 'whatsapp',
                'value'        => '+201234567890',
                'display_name' => 'رقم الواتساب',
                'group'        => 'contact',
                'type'         => 'text',
            ],
            [
                'key'          => 'email',
                'value'        => 'contact@qalam-library.com',
                'display_name' => 'البريد الإلكتروني',
                'group'        => 'contact',
                'type'         => 'email',
            ],
            [
                'key'          => 'address',
                'value'        => 'القاهرة، مصر',
                'display_name' => 'العنوان',
                'group'        => 'contact',
                'type'         => 'text',
            ],

            // Social Media settings
            [
                'key'          => 'facebook',
                'value'        => 'https://facebook.com/qalamlibrary',
                'display_name' => 'فيسبوك',
                'group'        => 'social',
                'type'         => 'url',
            ],
            [
                'key'          => 'instagram',
                'value'        => 'https://instagram.com/qalamlibrary',
                'display_name' => 'انستجرام',
                'group'        => 'social',
                'type'         => 'url',
            ],
            [
                'key'          => 'youtube',
                'value'        => 'https://youtube.com/@qalamlibrary',
                'display_name' => 'يوتيوب',
                'group'        => 'social',
                'type'         => 'url',
            ],
            [
                'key'          => 'twitter',
                'value'        => 'https://x.com/qalamlibrary',
                'display_name' => 'منصة إكس (تويتر)',
                'group'        => 'social',
                'type'         => 'url',
            ],
            [
                'key'          => 'telegram',
                'value'        => 'https://t.me/qalamlibrary',
                'display_name' => 'تيليجرام',
                'group'        => 'social',
                'type'         => 'url',
            ],
            [
                'key'          => 'tiktok',
                'value'        => 'https://tiktok.com/@qalamlibrary',
                'display_name' => 'تيك توك',
                'group'        => 'social',
                'type'         => 'url',
            ],

            // General & Library settings
            [
                'key'          => 'site_name',
                'value'        => 'مكتبة قلم CH',
                'display_name' => 'اسم المكتبة / الموقع',
                'group'        => 'general',
                'type'         => 'text',
            ],
            [
                'key'          => 'about_app',
                'value'        => 'مكتبة قلم CH - منصة رقمية متخصصة في الكتب والمقالات والدراسات الروحية واللاهوتية المسيحية الموثوقة.',
                'display_name' => 'نبذة عن المكتبة',
                'group'        => 'general',
                'type'         => 'textarea',
            ],
            [
                'key'          => 'copyright',
                'value'        => 'جميع الحقوق محفوظة لمكتبة قلم CH © 2026',
                'display_name' => 'حقوق النشر',
                'group'        => 'general',
                'type'         => 'text',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command?->info('Settings seeded successfully: ' . count($settings));
    }
}

