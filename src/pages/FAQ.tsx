import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	HelpCircle,
	Truck,
	RefreshCw,
	ShieldCheck,
	Globe,
	Package,
	Phone,
	AlertTriangle,
	Clock,
	CreditCard,
	Info
} from 'lucide-react';

const FAQ = () => {
	const policyHighlights = [
		{
			icon: AlertTriangle,
			title: 'No cancellations or returns',
			description: 'Orders are final once paid. We do not accept cancellations or monetary refunds.'
		},
		{
			icon: RefreshCw,
			title: 'Exchange only for damage',
			description: 'Same-product exchange is possible only when damage is clearly shown in a continuous unpacking video.'
		},
		{
			icon: Truck,
			title: 'Free India shipping',
			description: 'Complimentary shipping across India; processing takes 2-3 working days before dispatch.'
		},
		{
			icon: Globe,
			title: 'Worldwide delivery',
			description: 'International shipping delivers in about 10-12 working days after dispatch; customs duties are extra.'
		}
	];

	const faqSections = [
		{
			icon: Truck,
			title: 'Shipping & Delivery',
			items: [
				{
					question: 'What are the processing and delivery timelines?',
					answer:
						'We need 2-3 working days to process, quality-check, and pack your order. After dispatch, India deliveries take about 8-9 working days and international deliveries take about 10-12 working days (excluding weekends/holidays).'
				},
				{
					question: 'Do you offer free shipping?',
					answer:
						'Yes, shipping is free across India. International orders have shipping charges. Remote areas may need 2-3 extra days.'
				},
				{
					question: 'How do I track my order?',
					answer:
						'Once shipped, we send tracking details via email (and SMS/WhatsApp if enabled). Use the tracking link or number for live updates.'
				},
				{
					question: 'What if tracking says delivered but I have not received it?',
					answer:
						'Visit or call the nearest courier branch with your tracking number. If door delivery is not possible, the courier may ask you to collect the package from their center.'
				}
			]
		},
		{
			icon: RefreshCw,
			title: 'Returns & Exchanges',
			items: [
				{
					question: 'Can I cancel or return my order?',
					answer:
						'No. Orders cannot be cancelled after payment, and we do not offer returns or monetary refunds.'
				},
				{
					question: 'When is an exchange possible?',
					answer:
						'A same-product exchange is considered only if clear damage or a wrong item is visible in a continuous unpacking video recorded within 24 hours of delivery.'
				},
				{
					question: 'What issues are NOT eligible for exchange?',
					answer:
						'Size or fit issues, personal preference, minor loose threads, removable stains, small stitching gaps, or slight color variations from lighting/monitors are not treated as damage.'
				},
				{
					question: 'Who pays for return shipping during an exchange?',
					answer:
						'If damage is confirmed from your unpacking video, VedhaTrendz covers return shipping. If the request is denied, return shipping (if sent) is customer-paid.'
				}
			]
		},
		{
			icon: CreditCard,
			title: 'Payments & Security',
			items: [
				{
					question: 'Which payment methods do you accept?',
					answer:
						'Payments are processed via Razorpay with major credit/debit cards, UPI, and net banking. Prices are in INR and include applicable taxes.'
				},
				{
					question: 'Is my payment information secure?',
					answer:
						'Yes. Transactions use SSL encryption and are handled by Razorpay. We do not store complete card details on our servers.'
				},
				{
					question: 'Why was my order declined or adjusted?',
					answer:
						'Orders depend on stock and accurate pricing. If a pricing or stock error occurs, we may cancel or adjust the order and will notify you.'
				}
			]
		},
		{
			icon: Globe,
			title: 'International Shipping',
			items: [
				{
					question: 'Do you ship outside India?',
					answer:
						'Yes, we ship worldwide. Delivery typically takes 10-12 working days after dispatch; some countries may have restrictions on textiles.'
				},
				{
					question: 'Who handles customs duties and taxes?',
					answer:
						'Customs duties, taxes, and any clearance delays are the recipient’s responsibility. These are not included in product prices or shipping charges.'
				}
			]
		},
		{
			icon: Package,
			title: 'Packaging & Product Care',
			items: [
				{
					question: 'How are sarees packaged?',
					answer:
						'We use acid-free tissue, moisture-resistant layers, and sturdy boxes; fragile items are marked to reduce transit damage.'
				},
				{
					question: 'Why can colors look different in person?',
					answer:
						'Minor color variations can occur due to lighting, photography, and screen settings. This is not treated as a defect.'
				}
			]
		},
		{
			icon: Phone,
			title: 'Support & Contact',
			items: [
				{
					question: 'How can I reach support?',
					answer:
						'Email vedhatrendz@gmail.com or call/WhatsApp +91 7702284509. Support hours: Monday-Saturday, 10:00 AM - 6:00 PM (IST).'
				},
				{
					question: 'What details help speed up support?',
					answer:
						'Share your order number, tracking number, and (for exchanges) the continuous unpacking video so we can review quickly.'
				}
			]
		}
	];

	return (
		<div className="min-h-screen bg-background py-8">
			<div className="max-w-5xl mx-auto mobile-padding space-y-8">
				<div className="text-center space-y-3">
					<div className="flex items-center justify-center gap-2">
						<HelpCircle className="h-8 w-8 text-primary" />
						<h1 className="mobile-heading">Frequently Asked Questions</h1>
					</div>
					<p className="mobile-text text-muted-foreground max-w-3xl mx-auto">
						Concise answers to the questions we receive most often. These summaries come from our Shipping, Refund, Terms, and Privacy pages.
					</p>
					<div className="mobile-small-text text-muted-foreground">Last updated: July 23, 2025</div>
				</div>

				<Card className="bg-muted/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 mobile-text">
							<Info className="h-5 w-5 text-primary" />
							Key policies at a glance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-4">
							{policyHighlights.map((item) => {
								const Icon = item.icon;
								return (
									<div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
											<Icon className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="font-semibold mobile-small-text">{item.title}</div>
											<p className="mobile-small-text text-muted-foreground">{item.description}</p>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				<div className="space-y-6">
					{faqSections.map((section) => {
						const Icon = section.icon;
						return (
							<Card key={section.title} className="shadow-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 mobile-text">
										<Icon className="h-5 w-5 text-primary" />
										{section.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{section.items.map((item) => (
										<div key={item.question} className="space-y-1">
											<h3 className="font-semibold mobile-small-text">{item.question}</h3>
											<p className="mobile-small-text text-muted-foreground">{item.answer}</p>
										</div>
									))}
								</CardContent>
							</Card>
						);
					})}
				</div>

				<Card className="bg-primary/5 border-primary/20">
					<CardContent className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h3 className="font-semibold mobile-text">Need more help?</h3>
							<p className="mobile-small-text text-muted-foreground">
								Reach out with your order number and tracking details for the fastest resolution.
							</p>
						</div>
						<div className="space-y-1 mobile-small-text">
							<div><strong>Email:</strong> vedhatrendz@gmail.com</div>
							<div><strong>Phone/WhatsApp:</strong> +91 7702284509</div>
							<div><strong>Hours:</strong> Mon-Sat, 10:00 AM - 6:00 PM (IST)</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default FAQ;
