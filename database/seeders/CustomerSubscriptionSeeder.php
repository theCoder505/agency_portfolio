<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\SaasProduct;
use App\Models\SaasSubscription;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds for 1 customer account and 2 business subscription records.
     */
    public function run(): void
    {
        // 1. Create / Update Customer Account
        $customer = User::updateOrCreate(
            ['email' => 'customer@codeventure.tech'],
            [
                'name' => 'Tanvir Ahmed',
                'password' => Hash::make('password'),
                'phone' => '+880 1711-223344',
                'company_name' => 'Apex Digital Solutions Ltd.',
                'address' => 'House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh',
                'status' => 'active',
                'admin_notes' => 'VIP Enterprise Account. Priority deployment SLA tier 1.',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $admin = Admin::first();
        $adminId = $admin ? $admin->id : 1;

        // 2. Fetch SaaS Products
        $erpProduct = SaasProduct::where('slug', 'clouderp-suite-enterprise')->first();
        $ecommerceProduct = SaasProduct::where('slug', 'omnistore-ecommerce-engine')->first();

        // 3. Business Record 1: Active CloudERP Subscription (Monthly Term)
        if ($erpProduct) {
            $sub1Starts = Carbon::now()->subDays(5);
            $sub1Expires = Carbon::now()->addDays(25);

            $subscription1 = SaasSubscription::updateOrCreate(
                ['order_number' => 'ORD-2026-1088'],
                [
                    'user_id' => $customer->id,
                    'saas_product_id' => $erpProduct->id,
                    'billing_cycle' => 'monthly',
                    'amount' => $erpProduct->monthly_price,
                    'currency' => 'BDT',
                    'status' => 'active',
                    'payment_method' => 'bkash',
                    'sender_number' => '01711223344',
                    'transaction_id' => 'BK9876543210',
                    'payment_notes' => 'Urgent deployment requested for Dhaka headquarters.',
                    'domain' => 'erp.apexdigital.com.bd',
                    'subdomain' => 'apexdigital',
                    'admin_notes' => "Portal URL: https://erp.apexdigital.com.bd/login\nSuperadmin: admin@apexdigital.com.bd\nTemp Password: ApexERP#2026Secure!\n\nSetup Guide: Multi-warehouse module has been initialized with Banani central hub.",
                    'starts_at' => $sub1Starts,
                    'expires_at' => $sub1Expires,
                    'approved_at' => $sub1Starts,
                    'approved_by' => $adminId,
                ]
            );

            // Invoice for Subscription 1 (Paid)
            SubscriptionInvoice::updateOrCreate(
                ['invoice_number' => 'INV-2026-1042'],
                [
                    'subscription_id' => $subscription1->id,
                    'user_id' => $customer->id,
                    'billing_cycle' => 'monthly',
                    'amount' => $erpProduct->monthly_price,
                    'payment_method' => 'bkash',
                    'sender_number' => '01711223344',
                    'transaction_id' => 'BK9876543210',
                    'type' => 'initial',
                    'status' => 'paid',
                    'period_start' => $sub1Starts->toDateString(),
                    'period_end' => $sub1Expires->toDateString(),
                    'paid_at' => $sub1Starts,
                    'notes' => 'bKash payment validated and confirmed by Admin.',
                ]
            );
        }

        // 4. Business Record 2: Pending OmniStore E-Commerce Subscription (Half-Yearly Term)
        if ($ecommerceProduct) {
            $subscription2 = SaasSubscription::updateOrCreate(
                ['order_number' => 'ORD-2026-1092'],
                [
                    'user_id' => $customer->id,
                    'saas_product_id' => $ecommerceProduct->id,
                    'billing_cycle' => 'half_yearly',
                    'amount' => $ecommerceProduct->half_yearly_price,
                    'currency' => 'BDT',
                    'status' => 'pending',
                    'payment_method' => 'nagad',
                    'sender_number' => '01811223344',
                    'transaction_id' => 'NG5544332211',
                    'payment_notes' => 'Please connect our custom domain store.apexdigital.com.bd and enable bKash automated gateway.',
                    'domain' => 'store.apexdigital.com.bd',
                    'subdomain' => 'apexshop',
                    'admin_notes' => null,
                    'starts_at' => null,
                    'expires_at' => null,
                    'approved_at' => null,
                    'approved_by' => null,
                ]
            );

            // Invoice for Subscription 2 (Pending Verification)
            SubscriptionInvoice::updateOrCreate(
                ['invoice_number' => 'INV-2026-1049'],
                [
                    'subscription_id' => $subscription2->id,
                    'user_id' => $customer->id,
                    'billing_cycle' => 'half_yearly',
                    'amount' => $ecommerceProduct->half_yearly_price,
                    'payment_method' => 'nagad',
                    'sender_number' => '01811223344',
                    'transaction_id' => 'NG5544332211',
                    'type' => 'initial',
                    'status' => 'pending',
                    'period_start' => null,
                    'period_end' => null,
                    'paid_at' => null,
                    'notes' => 'Awaiting admin cross-check for Nagad TrxID NG5544332211.',
                ]
            );
        }
    }
}
