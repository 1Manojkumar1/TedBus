import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../service/toast.service';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../../environments/environment';

export interface HelpArticle {
  id: string;
  category: 'booking' | 'cancellation' | 'payment' | 'tracking' | 'safety' | 'general';
  title: string;
  badge?: string;
  content: string;
  steps?: string[];
  tips?: string;
}

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './info-page.html',
  styleUrl: './info-page.css',
})
export class InfoPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);

  readonly topic = signal<string>(this.route.snapshot.data['topic'] ?? 'help');

  // Search & Filter state
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('all');

  // Quick PNR Lookup state
  pnrInput = signal<string>('');
  isCheckingPnr = signal<boolean>(false);
  pnrResult = signal<{
    found: boolean;
    pnr?: string;
    route?: string;
    operator?: string;
    status?: string;
    departure?: string;
    boardingPoint?: string;
    droppingPoint?: string;
    fare?: number;
    seats?: string[];
  } | null>(null);

  // Support Ticket Form state
  ticketForm = {
    category: 'Booking Issue',
    pnr: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  };
  isSubmittingTicket = signal<boolean>(false);
  ticketSubmittedId = signal<string | null>(null);

  constructor() {
    this.route.data.subscribe((data) => {
      if (data && data['topic']) {
        this.topic.set(data['topic']);
      }
    });

    const user = this.auth.user();
    if (user) {
      this.ticketForm.name = user.name || '';
      this.ticketForm.email = user.email || '';
    }
  }

  readonly categories = [
    { id: 'all', label: 'All Topics', icon: 'fa-solid fa-layer-group' },
    { id: 'booking', label: 'Booking & Seats', icon: 'fa-solid fa-ticket' },
    { id: 'cancellation', label: 'Cancellations & Refunds', icon: 'fa-solid fa-rotate-left' },
    { id: 'payment', label: 'Payments & Billing', icon: 'fa-solid fa-credit-card' },
    { id: 'tracking', label: 'Live Bus Tracking', icon: 'fa-solid fa-location-dot' },
    { id: 'safety', label: 'Primo & Safety', icon: 'fa-solid fa-shield-heart' },
    { id: 'general', label: 'RTC & Policies', icon: 'fa-solid fa-circle-info' },
  ];

  readonly articles: HelpArticle[] = [
    // Booking Articles
    {
      id: 'book-1',
      category: 'booking',
      title: 'How do I search and book a bus ticket on TedBus?',
      badge: 'Popular',
      content:
        'Booking on TedBus is fast, intuitive, and secure across 180+ nationwide routes and 3,000+ verified private and government RTC bus operators.',
      steps: [
        'Enter your Source city and Destination city on the Home page search bar.',
        'Choose your desired travel date and click "SEARCH BUSES".',
        'Filter buses by AC/Non-AC, Sleeper/Seater, Operator ratings, Departure time, or Price.',
        'Click "View Seats" to interactively pick your preferred window, aisle, lower or upper berth.',
        'Select your exact Boarding and Dropping points from the interactive list.',
        'Enter passenger names, contact email, and mobile number.',
        'Apply promo codes (like FIRST or SUPERHIT) and complete payment using UPI, Cards, or Net Banking.',
      ],
      tips: 'Always double-check your mobile number and email address as your digital m-ticket and GPS tracking links are dispatched there immediately.',
    },
    {
      id: 'book-2',
      category: 'booking',
      title: 'How will I receive my ticket after successful payment?',
      badge: 'Instant',
      content:
        'Your confirmed bus ticket is generated immediately upon successful transaction clearance.',
      steps: [
        'An SMS confirmation with Ticket PNR, bus operator contact, and boarding address is sent to your mobile.',
        'A full WhatsApp ticket card is dispatched with live bus tracking links.',
        'An official PDF invoice ticket is emailed to your registered email address.',
        'You can also view, print, or download it anytime under "My Bookings" in your Profile.',
      ],
      tips: 'A digital copy on your phone along with a government photo ID (Aadhaar, PAN, Driving License) is 100% valid for boarding. No physical printout is required.',
    },
    {
      id: 'book-3',
      category: 'booking',
      title: 'Can I change my boarding or dropping point after booking?',
      badge: 'Self-Serve',
      content:
        'Yes! For most premium operators (including TedBus Primo partners), you can adjust your boarding point up to 2 hours before the scheduled departure time directly from your Profile without calling support.',
      steps: [
        'Go to your Profile page and open the "My Bookings" tab.',
        'Locate your upcoming trip and click "Modify Boarding Point".',
        'Select the newly desired boarding stop from the dropdown and confirm.',
        'An updated SMS with the new landmark and pickup timing will be dispatched immediately.',
      ],
    },
    {
      id: 'book-4',
      category: 'booking',
      title: 'What baggage allowance is included with my bus ticket?',
      content:
        'Standard ticketing permits up to 2 medium luggage bags (approximately 15 to 20 kg per passenger) in the bus luggage boot and 1 personal handbag inside the cabin.',
      tips: 'Oversized commercial goods, motorbikes, or large cartons can be accommodated by notifying the bus conductor at the boarding point for a nominal freight charge.',
    },

    // Cancellation & Refund Articles
    {
      id: 'cancel-1',
      category: 'cancellation',
      title: 'How do I cancel my bus ticket on TedBus?',
      badge: 'Refund Guaranteed',
      content:
        'You can cancel your ticket in just 3 clicks with complete transparency regarding refund amounts.',
      steps: [
        'Log in and navigate to your Profile -> "My Bookings".',
        'Select the active journey you wish to cancel and click "Cancel Ticket".',
        'Review the refund slab breakdown and deduction preview.',
        'Confirm cancellation. Your refund will be initiated instantly to your original payment method.',
      ],
      tips: 'You will receive an instant email and SMS notification containing your Refund Transaction ID.',
    },
    {
      id: 'cancel-2',
      category: 'cancellation',
      title: 'What is the TedBus Cancellation Refund Slab?',
      badge: 'Policy',
      content:
        'Refund deductions depend on the time remaining before the bus departs from its origin point:\n\n' +
        '• More than 24 hours before departure: 100% Full Refund (or 0% deduction with Free Cancellation guarantee)\n' +
        '• Between 12 to 24 hours before departure: 75% Refund\n' +
        '• Between 4 to 12 hours before departure: 50% Refund\n' +
        '• Less than 4 hours before departure: No refund applicable under operator terms\n\n' +
        'Note: If you purchased the "Free Cancellation Protection" during booking, you are eligible for a 100% full refund up to 6 hours before departure.',
    },
    {
      id: 'cancel-3',
      category: 'cancellation',
      title: 'How long does it take for my refund to reflect in my bank account?',
      badge: 'Instant UPI',
      content:
        'Refund turnaround times depend on the original payment channel used during checkout:\n\n' +
        '• UPI (GPay, PhonePe, Paytm): 15 minutes to 2 hours\n' +
        '• TedBus Wallet: Instant (within 60 seconds)\n' +
        '• Credit Card / Debit Card: 3 to 5 business days (depending on your issuing bank)\n' +
        '• Net Banking: 2 to 4 business days',
      tips: 'If your refund does not appear after 5 business days, raise a quick ticket below with your PNR and we will escalate with the banking gateway directly.',
    },
    {
      id: 'cancel-4',
      category: 'cancellation',
      title: 'What happens if the bus operator cancels the service or delays heavily?',
      badge: '100% Protected',
      content:
        'If an operator cancels a service due to mechanical failure, highway disruptions, or unforeseen circumstances, you are entitled to a guaranteed 100% full refund, or free re-booking on another preferred luxury bus service on the same route.',
    },

    // Payment Articles
    {
      id: 'pay-1',
      category: 'payment',
      title: 'Which payment methods are supported on TedBus?',
      badge: 'Secure',
      content:
        'We support all RBI-authorized digital payment channels across India:\n\n' +
        '• UPI Apps: Google Pay, PhonePe, Paytm, CRED, BHIM, and any bank UPI ID\n' +
        '• Credit & Debit Cards: Visa, MasterCard, RuPay, American Express, Diners Club\n' +
        '• Net Banking: 50+ major public and private banks\n' +
        '• Digital Wallets: Paytm Wallet, Mobikwik, Amazon Pay\n' +
        '• TedBus Wallet balance',
    },
    {
      id: 'pay-2',
      category: 'payment',
      title: 'Money was debited from my bank but my ticket was not confirmed. What should I do?',
      badge: 'Auto-Reversal SLA',
      content:
        'Please rest assured that your money is 100% safe. This happens when the bank gateway experiences a temporary timeout after debiting funds.\n\n' +
        'Our automated reconciliation engine checks pending transactions every 10 minutes:\n' +
        '1. If seats are still open: your booking will be confirmed automatically and an SMS will be dispatched.\n' +
        '2. If seats were released: an automatic refund is triggered immediately back to your original source account within 24 to 48 hours.',
      tips: 'Do not panic. You can submit your Bank Reference / UPI UTR Number below to check status instantly.',
    },
    {
      id: 'pay-3',
      category: 'payment',
      title: 'How do I download a GST tax invoice for corporate reimbursement?',
      content:
        'During checkout, check the "Add GST Details" box and input your company name and GSTIN number. Once your trip is confirmed, you can download a GST-compliant tax invoice with input tax credit (ITC) breakdown directly from your Profile.',
    },

    // Tracking & Safety Articles
    {
      id: 'track-1',
      category: 'tracking',
      title: 'How do I track my bus location in real time?',
      badge: 'Live GPS',
      content:
        'TedBus provides live GPS telemetry on all enabled routes via "Track My Bus".',
      steps: [
        'Open your WhatsApp or SMS booking message and tap the "Track Bus" link.',
        'Alternatively, visit TedBus -> "Route Planner" or "Profile" -> "Track Live Bus".',
        'The interactive Leaflet map will show the exact live pin of your bus, current highway speed, upcoming stops, and estimated time of arrival (ETA).',
      ],
      tips: 'You can also share your live bus tracking URL with family and friends so they can monitor your arrival safely.',
    },
    {
      id: 'track-2',
      category: 'tracking',
      title: 'When will I receive driver and bus conductor contact details?',
      content:
        'For passenger safety and operational clarity, the driver’s direct phone number, conductor contact, and bus vehicle registration number (e.g., KA-01-F-1234) are dispatched to your mobile via SMS and WhatsApp exactly 1 hour prior to the scheduled departure time.',
    },
    {
      id: 'safe-1',
      category: 'safety',
      title: 'What is TedBus Primo and what are its safety standards?',
      badge: 'Primo Certified',
      content:
        'TedBus Primo represents top-tier certified operators who strictly maintain:\n\n' +
        '• Punctual departures with 95%+ on-time track record\n' +
        '• Rigorously vetted, courteous, and non-smoking drivers\n' +
        '• Sanitized air-conditioned coaches with freshly laundered blankets and pillows\n' +
        '• In-cabin emergency SOS panic buttons and GPS speed limiters\n' +
        '• Dedicated 24x7 priority support assistance',
    },
    {
      id: 'safe-2',
      category: 'safety',
      title: 'What women safety features are available on TedBus?',
      badge: 'Women Safety',
      content:
        'TedBus has built-in safety safeguards for solo female travelers:\n\n' +
        '• Female-Reserved Seats: A seat next to a solo female passenger can only be booked by another female traveler.\n' +
        '• Dedicated SOS Emergency Contact: Real-time police and transit control room escalation with 1-tap SOS.\n' +
        '• Verified Operator Rating: Female passenger ratings and reviews are prominently highlighted on bus listings.',
    },

    // General & Policies Articles
    {
      id: 'gen-1',
      category: 'general',
      title: 'Can I book Government RTC buses on TedBus?',
      content:
        'Yes! TedBus is an official authorized online booking partner for major state RTC corporations across India, including:\n\n' +
        '• APSRTC (Andhra Pradesh State Road Transport)\n' +
        '• TSRTC (Telangana State Road Transport)\n' +
        '• KSRTC (Karnataka State Road Transport)\n' +
        '• MSRTC (Maharashtra State Road Transport - Shivshahi / Shivneri)\n' +
        '• GSRTC (Gujarat State Road Transport)\n' +
        '• TNSTC & SETC (Tamil Nadu State Transport)\n' +
        '• Kerala RTC (SWIFT & Deluxe)',
    },
  ];

  filteredArticles = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();

    return this.articles.filter((art) => {
      const matchCat = cat === 'all' || art.category === cat;
      if (!matchCat) return false;

      if (!q) return true;

      const titleMatch = art.title.toLowerCase().includes(q);
      const contentMatch = art.content.toLowerCase().includes(q);
      const tipsMatch = art.tips?.toLowerCase().includes(q) ?? false;
      return titleMatch || contentMatch || tipsMatch;
    });
  });

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  // Real PNR Lookup via Backend Database
  checkPnrStatus(): void {
    const pnr = this.pnrInput().trim();
    if (!pnr) {
      this.toast.warning('Enter PNR', 'Please enter your Ticket ID or PNR number to check status.');
      return;
    }

    this.isCheckingPnr.set(true);

    this.http.get<any>(`${environment.apiUrl}/bookings/lookup/${encodeURIComponent(pnr)}`).subscribe({
      next: (res) => {
        this.isCheckingPnr.set(false);
        this.pnrResult.set({
          found: true,
          pnr: res.pnr,
          route: res.route,
          operator: res.operator,
          status: res.status,
          departure: `${res.departureDate} at ${res.departureTime}:00`,
          boardingPoint: res.boardingPoint,
          droppingPoint: res.droppingPoint,
          fare: res.fare,
          seats: res.seats,
        });
        this.toast.success('Ticket Found', `Booking ${res.pnr} status: ${res.status}`);
      },
      error: (err) => {
        this.isCheckingPnr.set(false);
        this.pnrResult.set(null);
        const errMsg =
          err.error?.error ||
          `No booking found with PNR "${pnr}". Please check the number or sign in to view your bookings.`;
        this.toast.error('Booking Not Found', errMsg);
      },
    });
  }

  clearPnrResult(): void {
    this.pnrResult.set(null);
    this.pnrInput.set('');
  }

  // Real Support Ticket submission into MongoDB
  submitSupportTicket(): void {
    if (!this.ticketForm.name || !this.ticketForm.email || !this.ticketForm.message) {
      this.toast.warning('Missing Information', 'Please provide your Name, Email, and Message description.');
      return;
    }

    this.isSubmittingTicket.set(true);

    this.http.post<any>(`${environment.apiUrl}/support/tickets`, this.ticketForm).subscribe({
      next: (res) => {
        this.isSubmittingTicket.set(false);
        const ticketId = res.ticketId;
        this.ticketSubmittedId.set(ticketId);
        this.toast.success(
          'Support Ticket Created',
          `Your case #${ticketId} has been logged in our support database. We will respond to ${this.ticketForm.email} within 2 hours.`
        );
        this.ticketForm.pnr = '';
        this.ticketForm.message = '';
      },
      error: (err) => {
        this.isSubmittingTicket.set(false);
        const errMsg = err.error?.error || 'Failed to submit support ticket. Please try again or call 1800 102 8888.';
        this.toast.error('Submission Failed', errMsg);
      },
    });
  }

  resetTicketForm(): void {
    this.ticketSubmittedId.set(null);
  }
}
