# MASH E-Commerce - AI Automation System GitHub Tasks

## Epic: AI-001

---

## AI-001: Free Self-Hosted AI Buyer-to-Seller Appointment System

| Field | Value |
|-------|-------|
| Task ID | AI-001 |
| Type | Epic |
| Priority | High |
| Status | Planning |
| Timeline | January 2026 - March 2026 (12 weeks) |
| Assignee | @PP-Namias |
| Child Tasks | 34 |
| Story Points | 240 |
| Repository | MASH-Ecommerce-Web |
| Branch | ai-automation |

### Description

Implement a **100% FREE, self-hosted AI system** that directly connects mushroom buyers to growers through intelligent appointment scheduling. All AI runs on your PC using Ollama (Llama 3.2 3B), n8n workflows, and Firebase—zero cloud costs, unlimited scalability.

### Business Objectives

- **Direct Buyer-Seller Connection**: Enable customers to instantly book appointments with mushroom growers
- **100% Free Infrastructure**: All AI runs locally on PC (Ollama, n8n self-hosted, ChromaDB)
- **Smart Seller Matching**: AI recommends best grower based on location, product type, quantity, and availability
- **Real-Time Availability**: Prevent double-booking with Firestore calendar sync
- **Automated Follow-ups**: Reminder emails, no-show tracking, feedback collection

### Success Metrics

- [ ] 100% free monthly cost ($0 for AI processing)
- [ ] Ollama running smoothly on 8GB RAM PC
- [ ] n8n self-hosted with <2 second response times
- [ ] 90% appointment booking success rate
- [ ] 70% buyer-seller meeting completion rate
- [ ] Seller calendar sync with zero double-bookings

### Technical Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Your PC - FREE Self-Hosted Stack                            │
│  • n8n (Docker): Workflow automation                         │
│  • Ollama (Llama 3.2 3B): AI seller matching                │
│  • ChromaDB: Seller profile vectors                          │
│  • Firestore: Appointments + seller availability             │
└──────────────────────────────────────────────────────────────┘
```

### Dependencies

- ECOM-001 (Sanity CMS Implementation)
- ECOM-052 (Cart & Checkout System)
- Docker Desktop installed
- Ollama installed
- 8GB+ RAM PC

### Expected Outcomes

- [ ] n8n running locally with appointment workflows
- [ ] Ollama processing seller matching requests
- [ ] Buyer appointment widget on product pages
- [ ] Seller dashboard for availability management
- [ ] Automated email confirmations and reminders
- [ ] AI-powered seller insights (weekly analytics)

### Actual Results

(To be filled during implementation)

### Labels

`epic` `ai` `automation` `free` `self-hosted` `appointments` `priority-high`

---

## Phase 1: Foundation

---

### AI-002: n8n Self-Hosted Setup

| Field | Value |
|-------|-------|
| Task ID | AI-002 |
| Type | Feature |
| Priority | Critical |
| Status | ✅ Complete |
| Parent | AI-001 |
| Story Points | 8 |
| Assignee | @PP-Namias |
| Completed | January 8, 2026 |
| PR Guide | [ai-automation-tasks/ai-002-n8n-setup/PR_GUIDE.md](ai-automation-tasks/ai-002-n8n-setup/PR_GUIDE.md) |

#### Description

Install and configure n8n workflow automation on your local PC using Docker. This will be the central hub for all AI workflows, connecting Ollama, Firestore, and Next.js.

#### Dependencies

- Docker Desktop installed

#### Expected Outcomes

- [x] Docker Desktop running on PC
- [x] n8n accessible at `http://localhost:5678`
- [x] Firebase Admin SDK configured in n8n credentials
- [x] Test workflow: Read/write to Firestore
- [x] n8n set to auto-start on PC boot
- [x] Webhook URL documented: `http://localhost:5678/webhook/<workflow-name>`

#### Tasks

1. Install Docker Desktop (Windows/Mac/Linux)
2. Run: `docker run -d -p 5678:5678 -v ~/.n8n:/home/node/.n8n --name n8n n8nio/n8n`
3. Access n8n UI: `http://localhost:5678`
4. Create admin account
5. Add Firebase Admin SDK credentials:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key (JSON)
   - In n8n: Credentials → Google → Service Account
   - Paste JSON content
6. Create test workflow:
   - Webhook trigger → Firestore node (Read `users` collection)
   - Test with curl: `curl -X POST http://localhost:5678/webhook-test/test-firestore`
7. Set Docker compose for auto-restart:
   ```yaml
   # docker-compose.yml
   version: '3'
   services:
     n8n:
       image: n8nio/n8n
       restart: always
       ports:
         - 5678:5678
       volumes:
         - ~/.n8n:/home/node/.n8n
   ```
8. Run: `docker-compose up -d`

#### Labels

`infrastructure` `n8n` `docker` `setup`

---

### AI-003: Ollama + Llama 3.2 Installation

| Field | Value |
|-------|-------|
| Task ID | AI-003 |
| Type | Feature |
| Priority | Critical |
| Status | ✅ Complete |
| Parent | AI-001 |
| Story Points | 10 |
| Assignee | @PP-Namias |
| Completed | January 8, 2026 |
| PR Guide | [ai-automation-tasks/ai-003-ollama-setup/PR_GUIDE.md](ai-automation-tasks/ai-003-ollama-setup/PR_GUIDE.md) |

#### Description

Install Ollama and download Llama 3.2 3B model to provide FREE local AI for seller matching, appointment parsing, and analytics. This replaces expensive OpenAI API calls.

#### Dependencies

- 8GB+ RAM on PC
- 10GB free disk space

#### Expected Outcomes

- [x] Ollama installed and running
- [x] Llama 3.2 3B model downloaded (2GB)
- [x] Test successful: "Match buyer to best seller in Manila"
- [x] n8n HTTP node calling Ollama API
- [x] Response time <5 seconds on average PC ✅ **ACHIEVED: 1.4-2s**
- [x] Documented prompts for seller matching

#### Tasks

1. Download Ollama from [ollama.com](https://ollama.com)
   - Windows: `ollama-windows-amd64.exe`
   - Mac: `ollama-darwin.pkg`
   - Linux: `curl https://ollama.ai/install.sh | sh`
2. Install Ollama (double-click installer)
3. Pull Llama 3.2 3B model:
   ```bash
   ollama pull llama3.2:3b
   ```
   (This downloads ~2GB, takes 5-10 mins)
4. Test chat interface:
   ```bash
   ollama run llama3.2:3b "Hello, I need 10kg of oyster mushrooms in Manila"
   ```
5. Verify API endpoint:
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "llama3.2:3b",
     "prompt": "Match this buyer request to best seller: Need 10kg oyster mushrooms, Manila area",
     "stream": false
   }'
   ```
6. Create n8n workflow to call Ollama:
   - Add HTTP Request node
   - Method: POST
   - URL: `http://host.docker.internal:11434/api/generate`
     (Note: Use `host.docker.internal` to call localhost from Docker)
   - Body (JSON):
     ```json
     {
       "model": "llama3.2:3b",
       "prompt": "{{ $json.prompt }}",
       "stream": false
     }
     ```
7. Test prompt for seller matching:
   ```text
   You are a seller matcher for MASH mushroom marketplace.
   
   Buyer request:
   - Product: Oyster Mushrooms
   - Quantity: 10kg (bulk order)
   - Location: Manila
   
   Available sellers:
   1. Juan's Farm - Specializes in oyster, king oyster. Location: Quezon City (15km from Manila). Capacity: 50kg/week
   2. Maria's Mushrooms - All types. Location: Pasig (20km). Capacity: 30kg/week
   3. Pedro's Organic - Shiitake specialist. Location: Makati (10km). Capacity: 20kg/week
   
   Rank top 3 sellers by: 1) Product match, 2) Proximity, 3) Capacity
   Return format: Seller name, reason, distance
   ```
8. Document response parsing logic

#### Labels

`ai` `ollama` `llama` `setup` `free`

---

### AI-004: Seller Appointment Widget UI

| Field | Value |
|-------|-------|
| Task ID | AI-004 |
| Type | Feature |
| Priority | High |
| Status | ✅ Complete |
| Parent | AI-001 |
| Story Points | 10 |
| Assignee | @PP-Namias |
| Completed | January 8, 2026 |
| Documentation | [ai-automation-tasks/ai-004-appointment-widget/IMPLEMENTATION_SUMMARY.md](ai-automation-tasks/ai-004-appointment-widget/IMPLEMENTATION_SUMMARY.md) |

#### Description

Create a beautiful, user-friendly widget that allows buyers to instantly book appointments with mushroom growers. Displays available sellers, their specialties, time slots, and location—all in one click.

#### Dependencies

- AI-002 (n8n setup)
- Sanity CMS with seller profiles

#### Expected Outcomes

- [x] "Book Meeting with Grower" button on product pages
- [x] Modal shows 3 recommended sellers
- [x] Each seller card displays: Name, specialty, distance, available slots
- [x] One-click booking confirmation
- [x] Success message with appointment details
- [x] Email confirmation sent automatically

#### Tasks

1. Create component: `src/components/ai/AppointmentWidget.tsx`
2. Design modal UI (Radix Dialog):
   ```tsx
   <Dialog>
     <DialogTrigger>
       <Button>📅 Book Meeting with Grower</Button>
     </DialogTrigger>
     <DialogContent>
       <h2>Meet Your Perfect Mushroom Supplier</h2>
       <p>We'll match you with the best grower based on your needs</p>
       
       {/* Seller Cards */}
       {sellers.map(seller => (
         <SellerCard
           name={seller.name}
           specialty={seller.specialty}
           distance={seller.distance}
           availableSlots={seller.slots}
           onBook={(slot) => handleBooking(seller, slot)}
         />
       ))}
     </DialogContent>
   </Dialog>
   ```
3. Create `SellerCard` component:
   - Avatar with seller photo
   - Name + specialty badge (e.g., "Oyster Expert")
   - Location pin + distance (e.g., "15km away")
   - Star rating (if available)
   - Available time slots (next 7 days)
   - "Book Appointment" button
4. Implement time slot picker:
   - Show next 7 days
   - 30-minute intervals (9:00 AM, 9:30 AM, etc.)
   - Disable already booked slots
   - Highlight recommended times (seller's most available)
5. Add booking confirmation modal:
   - Appointment summary (seller, date, time, product)
   - Buyer details form (name, phone, quantity)
   - Special requests textarea
   - "Confirm Appointment" button
6. Style with Tailwind CSS (match MASH theme)
7. Add to product pages:
   - `/product/[slug]` - Below "Add to Cart"
   - `/shop` - In product cards as icon button

#### Labels

`ui` `frontend` `appointments` `widget`

---

### AI-005: Firebase Collections

| Field | Value |
|-------|-------|
| Task ID | AI-005 |
| Type | Feature |
| Priority | High |
| Status | ✅ Complete |
| Parent | AI-001 |
| Story Points | 5 |
| Assignee | @PP-Namias |
| Completed | January 8, 2026 |
| Documentation | [ai-automation-tasks/ai-005-firebase-collections/COLLECTION_SCHEMA.md](ai-automation-tasks/ai-005-firebase-collections/COLLECTION_SCHEMA.md) |

#### Description

Create two Firestore collections (`availability_slots` and `appointments`) to enable the AI appointment booking system with proper security rules, composite indexes, and seed data.

#### Dependencies

- AI-002 (n8n setup)
- AI-003 (Ollama setup)
- AI-004 (Frontend Widget)

#### Expected Outcomes

- [x] `availability_slots` collection schema (9 fields)
- [x] `appointments` collection schema (18 fields)
- [x] Security rules for both collections in firestore.rules
- [x] 5 composite indexes in firestore.indexes.json
- [x] Seed data script with 3 sellers + 672 slots + 2 appointments
- [x] Complete documentation with query examples

#### Tasks

1. ✅ Design collection schemas:
   - `availability_slots`: seller_uid, seller_name, available_date, start_time, end_time, scheduled_time, is_available, created_at, updated_at
   - `appointments`: buyer info (uid, name, email, phone, location), seller info (uid, name, email), product_type, quantity, scheduled_date, scheduled_time, status, special_requests, timestamps
2. ✅ Add security rules to firestore.rules:
   - `availability_slots`: Public read, seller-only write
   - `appointments`: Buyer/seller read for own appointments, buyer create, buyer/seller update, admin delete
3. ✅ Add composite indexes to firestore.indexes.json:
   - availability_slots: seller_uid + date + availability, seller_uid + availability + date + time
   - appointments: buyer_uid + status + time, seller_uid + status + time, seller_uid + date + time
4. ✅ Create seed data script:
   - 3 sample sellers (Juan's Farm, Maria's Mushrooms, Pedro's Organic)
   - 7 days of availability (9 AM - 5 PM, 30-min intervals)
   - 2 sample appointments (1 confirmed, 1 pending)
5. ✅ Create documentation:
   - COLLECTION_SCHEMA.md with field descriptions, query examples, security rules, deployment instructions
   - PROGRESS.md tracking implementation

#### Deployment (Manual Step)

```bash
# Deploy security rules and indexes
firebase deploy --only firestore

# Run seed data script
node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
```

---

### AI-006: n8n Appointment Workflow

| Field | Value |
|-------|-------|
| Task ID | AI-006 |
| Type | Feature |
| Priority | High |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 8 |
| Assignee | @PP-Namias |

#### Description

Build the n8n workflow that processes appointment requests using the 5 webhook actions defined in AI-004. This workflow connects Ollama AI matching with Firestore database operations and email notifications.

#### Dependencies

- AI-002 (n8n setup)
- AI-003 (Ollama setup)
- AI-004 (Frontend Widget with 5 webhook actions defined)
- AI-005 (Firebase Collections)

#### Expected Outcomes

- [ ] `find_sellers` action - Match sellers using Ollama AI + query availability
- [ ] `get_availability` action - Query availability_slots for seller
- [ ] `set_appointment` action - Create appointment + mark slot unavailable + send email
- [ ] `cancel_appointment` action - Update status + free slot + notify
- [ ] `get_appointments` action - Query user's appointments

#### Tasks

1. Create `src/app/api/ai/appointment/book/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { z } from 'zod';
   
   const BookingSchema = z.object({
     buyerId: z.string(),
     productType: z.enum(['oyster', 'shiitake', 'king-oyster']),
     quantity: z.number().min(1),
     location: z.object({
       lat: z.number(),
       lng: z.number(),
       address: z.string(),
     }),
     preferredTime: z.string().datetime(),
   });
   
   export async function POST(req: NextRequest) {
     const body = await req.json();
     const validated = BookingSchema.parse(body);
     
     // Call n8n webhook
     const response = await fetch('http://localhost:5678/webhook/book-appointment', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(validated),
     });
     
     const result = await response.json();
     return NextResponse.json(result);
   }
   ```
2. Create `check-availability/route.ts`:
   - Accept: productType, quantity, location
   - Call n8n webhook for seller matching
   - Return: Top 3 sellers with available slots
3. Create `cancel/route.ts`:
   - Accept: appointmentId, reason
   - Update Firestore appointment status to 'cancelled'
   - Free up seller's time slot
   - Send cancellation emails
4. Implement rate limiting (simple in-memory):
   ```typescript
   const rateLimiter = new Map<string, { count: number, resetAt: number }>();
   
   function checkRateLimit(userId: string): boolean {
     const now = Date.now();
     const userLimit = rateLimiter.get(userId);
     
     if (!userLimit || now > userLimit.resetAt) {
       rateLimiter.set(userId, { count: 1, resetAt: now + 60000 });
       return true;
     }
     
     if (userLimit.count >= 10) return false;
     
     userLimit.count++;
     return true;
   }
   ```
5. Add error handling middleware
6. Document API with examples

#### Labels

`api` `backend` `appointments` `n8n`

---

## Phase 2: Seller Matching & Booking

---

### AI-006: n8n Appointment Workflow

| Field | Value |
|-------|-------|
| Task ID | AI-006 |
| Type | Feature |
| Priority | Critical |
| Status | In Progress |
| Parent | AI-001 |
| Story Points | 13 |
| Assignee | @PP-Namias |

#### Description

Build the n8n workflow that processes appointment requests using the 5 webhook actions defined in AI-004. This workflow connects Ollama AI matching with Firestore database operations and email notifications.

#### Dependencies

- AI-002 (n8n setup) ✅
- AI-003 (Ollama setup) ✅
- AI-004 (Frontend Widget with 5 webhook actions) ✅
- AI-005 (Firebase Collections with availability_slots + appointments) ✅

#### Expected Outcomes

- [ ] `find_sellers` action - Match sellers using Ollama AI + query availability_slots
- [ ] `get_availability` action - Query availability_slots for specific seller
- [ ] `set_appointment` action - Create appointment + mark slot unavailable + send email
- [ ] `cancel_appointment` action - Update status + free slot + notify parties
- [ ] `get_appointments` action - Query user's appointments (buyer or seller)

#### Tasks

1. Create `/firestore-schemas/appointments.md` documentation:
   ```
   Collection: appointments
   Document ID: Auto-generated
   
   Fields:
   - appointmentId (string) - Unique ID
   - buyerId (string) - User ID from Firebase Auth
   - buyerName (string)
   - buyerPhone (string)
   - sellerId (string) - Seller's user ID
   - sellerName (string)
   - productType (string) - oyster|shiitake|king-oyster
   - quantity (number) - In kilograms
   - scheduledTime (timestamp) - Meeting date/time
   - duration (number) - Minutes (default: 30)
   - location (object)
     - lat (number)
     - lng (number)
     - address (string)
   - status (string) - pending|confirmed|completed|cancelled|no-show
   - createdAt (timestamp)
   - updatedAt (timestamp)
   - specialRequests (string, optional)
   - cancelReason (string, optional)
   - completedAt (timestamp, optional)
   ```
2. Create `seller_availability` collection:
   ```
   Collection: seller_availability
   Document ID: {sellerId}_{date}
   
   Fields:
   - sellerId (string)
   - date (string) - YYYY-MM-DD
   - slots (array of objects)
     - startTime (string) - HH:mm format (e.g., "09:00")
     - endTime (string)
     - isBooked (boolean)
     - appointmentId (string, if booked)
   - timezone (string) - "Asia/Manila"
   ```
3. Create `ai_conversations` for chatbot logs:
   ```
   Collection: ai_conversations
   Document ID: Auto-generated session ID
   
   Fields:
   - sessionId (string)
   - userId (string, optional - null for guests)
   - messages (array)
     - role (string) - "user"|"assistant"
     - content (string)
     - timestamp (timestamp)
     - intentDetected (string, optional)
     - productsShown (array of product IDs, optional)
   - createdAt (timestamp)
   - lastMessageAt (timestamp)
   ```
4. Update `firestore.rules` to add appointment permissions:
   ```
   match /appointments/{appointmentId} {
     allow read: if request.auth != null && 
       (resource.data.buyerId == request.auth.uid || 
        resource.data.sellerId == request.auth.uid);
     allow create: if request.auth != null;
     allow update: if request.auth != null && 
       resource.data.sellerId == request.auth.uid;
   }
   
   match /seller_availability/{docId} {
     allow read: if true; // Public read for booking widget
     allow write: if request.auth != null && 
       request.auth.token.role == 'seller';
   }
   ```
5. Create Firestore indexes (`firestore.indexes.json`):
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "appointments",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "buyerId", "order": "ASCENDING" },
           { "fieldPath": "scheduledTime", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "appointments",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "sellerId", "order": "ASCENDING" },
           { "fieldPath": "status", "order": "ASCENDING" },
           { "fieldPath": "scheduledTime", "order": "ASCENDING" }
         ]
       }
     ]
   }
   ```
6. Deploy indexes: `firebase deploy --only firestore:indexes`
7. Seed test data with script: `scripts/seed-appointments.js`

#### Labels

`firebase` `firestore` `schema` `appointments` `critical`

---

### AI-007: Product Recommendation Engine

| Field | Value |
|-------|-------|
| Task ID | AI-007 |
| Type | Feature |
| Priority | High |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 12 |
| Assignee | @PP-Namias |

#### Description

Build AI-powered product recommendation system that analyzes buyer messages, queries Sanity for matching products, and returns structured product cards for the chatbot UI.

#### Dependencies

- AI-003 (Ollama running)
- ECOM-001 (Sanity CMS operational)

#### Expected Outcomes

- [ ] Ollama correctly classifies product intent from user messages
- [ ] Returns top 3-5 relevant products from Sanity
- [ ] Product cards include: image, name, price, rating, stock status
- [ ] "Add to Cart" and "Book Consultation" buttons functional
- [ ] Response time <3 seconds

#### Tasks

1. Create `src/app/api/ai/product-recommend/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { sanityClient } from '@/lib/sanity/client';
   
   export async function POST(req: NextRequest) {
     const { message, sessionId } = await req.json();
     
     // Step 1: Call Ollama for intent + product type extraction
     const intentResponse = await fetch('http://localhost:11434/api/generate', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         model: 'llama3.2:3b',
         prompt: `Analyze this customer message and extract product intent:
           
           Message: "${message}"
           
           Return JSON with:
           {
             "intent": "product_inquiry" | "appointment" | "support" | "order_tracking",
             "productType": "oyster" | "shiitake" | "king-oyster" | "growing-kit" | null,
             "quantity": <number or null>,
             "priceRange": "budget" | "premium" | null,
             "useCase": "cooking" | "cultivation" | "bulk-order" | null
           }`,
         stream: false,
         format: 'json'
       })
     });
     
     const intentData = await intentResponse.json();
     const intent = JSON.parse(intentData.response);
     
     // Step 2: Query Sanity for matching products
     if (intent.intent === 'product_inquiry' && intent.productType) {
       const products = await sanityClient.fetch(
         `*[_type == "product" && 
            category->slug.current == $categorySlug &&
            inStock == true
          ] | order(salesCount desc)[0...5] {
           _id,
           name,
           slug,
           price,
           "image": coalesce(mainImage.asset->url, image.asset->url),
           "category": category->name,
           "rating": coalesce(averageRating, 4.5),
           "reviewCount": count(*[_type == "review" && product._ref == ^._id]),
           inStock,
           shortDescription
         }`,
         { categorySlug: intent.productType }
       );
       
       return NextResponse.json({
         intent: intent.intent,
         products: products,
         suggestAppointment: products.length > 0,
         aiMessage: `I found ${products.length} ${intent.productType} mushroom products for you. Would you like to discuss bulk pricing with one of our growers?`
       });
     }
     
     // Fallback for non-product intents
     return NextResponse.json({
       intent: intent.intent,
       products: [],
       aiMessage: "How else can I help you today?"
     });
   }
   ```
2. Create `ProductSuggestionCard.tsx` component:
   ```typescript
   'use client';
   import { Card, CardContent } from '@/components/ui/card';
   import { Button } from '@/components/ui/button';
   import { useCart } from '@/contexts/CartContext';
   import Image from 'next/image';
   
   interface ProductSuggestionCardProps {
     product: {
       _id: string;
       name: string;
       slug: { current: string };
       price: number;
       image: string;
       rating: number;
       reviewCount: number;
       inStock: boolean;
     };
     onBookConsultation: () => void;
   }
   
   export function ProductSuggestionCard({ product, onBookConsultation }: ProductSuggestionCardProps) {
     const { addToCart } = useCart();
     
     return (
       <Card className="hover:shadow-lg transition-shadow">
         <CardContent className="p-4">
           <Image 
             src={product.image} 
             alt={product.name}
             width={200}
             height={200}
             className="rounded-md mb-3"
           />
           <h3 className="font-semibold text-lg">{product.name}</h3>
           <div className="flex items-center gap-2 mb-2">
             <span className="text-2xl font-bold text-primary">₱{product.price}</span>
             <span className="text-sm text-muted-foreground">/kg</span>
           </div>
           <div className="flex items-center gap-1 mb-3">
             <span className="text-yellow-500">⭐</span>
             <span className="font-medium">{product.rating}</span>
             <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
           </div>
           <div className="flex gap-2">
             <Button 
               onClick={() => addToCart(product, 1)}
               className="flex-1"
             >
               Add to Cart
             </Button>
             <Button 
               onClick={onBookConsultation}
               variant="outline"
               className="flex-1"
             >
               Talk to Grower
             </Button>
           </div>
         </CardContent>
       </Card>
     );
   }
   ```
3. Integrate into chatbot UI (`ChatbotWidget.tsx`):
   - Display product cards when `response.products` is not empty
   - Animate cards sliding in from bottom
   - Handle "Talk to Grower" click → Open appointment widget
4. Test with sample queries:
   - "I need oyster mushrooms"
   - "Looking for cheap growing kits"
   - "Best mushrooms for soup"
5. Track analytics in Firestore:
   - Product views from AI chat
   - Add to cart conversions
   - Consultation button clicks

#### Labels

`ai` `products` `recommendations` `sanity` `ollama`

---

### AI-008: Chatbot Product Card UI

| Field | Value |
|-------|-------|
| Task ID | AI-008 |
| Type | Feature |
| Priority | Medium |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 8 |
| Assignee | @PP-Namias |

#### Description

Create responsive, animated product card components that display in the AI chatbot, with smooth transitions and mobile-optimized layout.

#### Dependencies

- AI-007 (Product recommendation API)

#### Expected Outcomes

- [ ] Product cards display in chatbot with smooth animations
- [ ] Mobile-responsive (stack vertically on small screens)
- [ ] Accessibility (keyboard navigation, screen reader support)
- [ ] Loading skeleton while products fetch
- [ ] Error state if products fail to load

#### Tasks

1. Create `ProductCardSkeleton.tsx` for loading state
2. Add animation variants with Framer Motion:
   ```typescript
   const cardVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: (i: number) => ({
       opacity: 1,
       y: 0,
       transition: {
         delay: i * 0.1,
         duration: 0.3,
       },
     }),
   };
   ```
3. Implement horizontal scroll for 3+ products on mobile
4. Add "View All" button if more than 5 products
5. Style with Tailwind CSS (match MASH theme colors)
6. Test on multiple screen sizes (mobile, tablet, desktop)
7. Add accessibility attributes (aria-labels, roles)

#### Labels

`ui` `frontend` `chatbot` `products` `responsive`

---

### AI-009: n8n Appointment Booking Workflow

| Field | Value |
|-------|-------|
| Task ID | AI-009 |
| Type | Feature |
| Priority | Critical |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 15 |
| Assignee | @PP-Namias |

#### Description

Build the core n8n workflow that receives buyer requests, uses Ollama to match sellers, checks availability, and creates appointments in Firestore.

#### Dependencies

- AI-002 (n8n setup)
- AI-003 (Ollama running)
- AI-006 (Firestore schema)

#### Expected Outcomes

- [ ] Workflow: Webhook → Ollama → Seller Match → Availability Check → Create Appointment
- [ ] Response time <10 seconds for full booking
- [ ] Handles 100+ requests/day without issues
- [ ] Automatic error recovery and retries
- [ ] Logs all bookings to Firestore `appointment_logs`

#### Tasks

1. In n8n, create new workflow: "Book Seller Appointment"
2. Add Webhook node:
   - HTTP Method: POST
   - Path: `/webhook/book-appointment`
   - Response Mode: Wait for response
3. Add Function node "Parse Request":
   ```javascript
   const { productType, quantity, location } = $json;
   return {
     prompt: `Match buyer to best seller:
       Product: ${productType}
       Quantity: ${quantity}kg
       Location: ${location.address}
       
       Find sellers within 20km who can supply this quantity.`
   };
   ```
4. Add HTTP Request node "Call Ollama":
   - URL: `http://host.docker.internal:11434/api/generate`
   - Method: POST
   - Body:
     ```json
     {
       "model": "llama3.2:3b",
       "prompt": "{{ $json.prompt }}",
       "stream": false
     }
     ```
5. Add Function node "Parse AI Response":
   - Extract seller IDs from Ollama response
   - Clean up text formatting
6. Add Firestore node "Get Seller Profiles":
   - Collection: `sellers`
   - Query: WHERE `_id` IN `{{ $json.sellerIds }}`
7. Add Firestore node "Check Availability":
   - Collection: `seller_availability`
   - For each seller, find open slots in next 7 days
8. Add Function node "Rank Sellers":
   - Sort by: Distance, Capacity, Rating
   - Return top 3
9. Add Firestore node "Create Appointment":
   - Collection: `appointments`
   - Document:
     ```json
     {
       buyerId: "{{ $json.buyerId }}",
       sellerId: "{{ $json.topSeller.id }}",
       scheduledTime: "{{ $json.selectedSlot }}",
       productType: "{{ $json.productType }}",
       quantity: "{{ $json.quantity }}",
       status: "pending",
       createdAt: "{{ $now }}"
     }
     ```
10. Add Gmail node "Send Confirmation":
    - To: Buyer email
    - Subject: "Appointment Confirmed with {{ $json.sellerName }}"
    - Body: Use template with appointment details
11. Connect all nodes and test end-to-end
12. Enable workflow and document webhook URL

#### Labels

`n8n` `workflow` `ai` `appointments` `critical`

---

### AI-010: Seller Availability Management UI

| Field | Value |
|-------|-------|
| Task ID | AI-010 |
| Type | Feature |
| Priority | High |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 10 |
| Assignee | @PP-Namias |

#### Description

Build seller dashboard page where growers can set their weekly availability, block specific dates, and manage appointment preferences.

#### Dependencies

- AI-006 (Firestore schema)
- ECOM-052 (Auth system)

#### Expected Outcomes

- [ ] Sellers can set weekly recurring availability (e.g., "Mon-Fri 9AM-5PM")
- [ ] Block specific dates (vacations, holidays)
- [ ] Set appointment duration (30min, 1hr, 2hr)
- [ ] Toggle auto-approve appointments
- [ ] Calendar view shows booked vs available slots

#### Tasks

1. Create `/seller/availability/page.tsx`
2. Weekly schedule builder with time slot picker
3. Date blocker (date range picker component)
4. Save to Firestore `seller_availability` collection
5. Real-time sync (update UI when new appointment booked via Firestore listener)
6. Export availability as iCal for Google Calendar sync (optional)

#### Labels

`seller` `dashboard` `appointments` `availability`

---

### AI-011: Appointment Confirmation Emails

| Field | Value |
|-------|-------|
| Task ID | AI-011 |
| Type | Feature |
| Priority | Medium |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 6 |
| Assignee | @PP-Namias |

#### Description

Automated email notifications for appointment lifecycle: booking confirmation, 24-hour reminders, cancellations, and post-meeting feedback requests.

#### Dependencies

- AI-009 (n8n workflow)
- ECOM-052 (Gmail SMTP configured)

#### Expected Outcomes

- [ ] Buyer receives booking confirmation within 1 minute
- [ ] Seller receives new appointment notification
- [ ] 24-hour reminder sent to both parties
- [ ] Cancellation emails sent instantly
- [ ] Post-meeting feedback email 1 hour after scheduled time

#### Tasks

1. Create React Email templates in `src/lib/email/templates/`
2. Add Gmail nodes to n8n appointment workflow (use existing Gmail SMTP credentials)
3. Schedule reminder emails using n8n Schedule Trigger
4. Track email delivery status in Firestore `email_logs` collection
5. Add unsubscribe link for optional reminders

#### Labels

`email` `notifications` `n8n` `automation`

---

## Phase 3: Customer Support Chatbot

---

### AI-012: FAQ Knowledge Base Setup

| Field | Value |
|-------|-------|
| Task ID | AI-012 |
| Type | Feature |
| Priority | High |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 8 |
| Assignee | @PP-Namias |

#### Description

Create structured FAQ database in Sanity CMS, vectorize with ChromaDB, and integrate with Ollama for accurate customer support responses.

#### Dependencies

- AI-003 (Ollama running)
- ECOM-001 (Sanity CMS)

#### Expected Outcomes

- [ ] 30+ FAQ entries in Sanity
- [ ] ChromaDB vectors for semantic search
- [ ] Ollama retrieves relevant FAQs with 85%+ accuracy
- [ ] Fallback to "Contact Support" if confidence <70%

#### Tasks

1. Create Sanity schema `studio/src/schemaTypes/documents/faqEntry.ts`
2. Seed 30+ FAQs via `scripts/seed-faqs.js` (shipping, returns, products, growing tips)
3. Install ChromaDB: `pip install chromadb` (Python required)
4. Create vectorization script `scripts/vectorize-faqs.py`
5. Create API route `/api/ai/faq-search/route.ts` (query ChromaDB + Ollama response generation)
6. Test queries: "What's your return policy?", "Do you deliver to Manila?", "How to grow oyster mushrooms?"

#### Labels

`ai` `chatbot` `faq` `chromadb` `ollama`

---

### AI-013: Chatbot Main UI Widget

| Field | Value |
|-------|-------|
| Task ID | AI-013 |
| Type | Feature |
| Priority | Critical |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 12 |
| Assignee | @PP-Namias |

#### Description

Build floating chatbot widget that appears on all pages, handles text conversations, displays product cards, triggers appointment flows, and persists conversation history.

#### Dependencies

- AI-007 (Product recommendations)
- AI-012 (FAQ system)

#### Expected Outcomes

- [ ] Floating chat button (bottom-right corner)
- [ ] Expandable chat window (350px x 500px)
- [ ] Message bubbles (user vs AI)
- [ ] Typing indicator animation
- [ ] Product card rendering inside chat
- [ ] Conversation saved to Firestore `ai_conversations`
- [ ] Guest mode (no login required, sessionId in localStorage)

#### Tasks

1. Create `ChatbotWidget.tsx` with Radix Dialog primitive
2. Message input with Enter key to send
3. Auto-scroll to latest message (useEffect on messages array)
4. Typing indicator (3 bouncing dots animation with Framer Motion)
5. Product card grid inside chat (horizontal scroll on mobile)
6. "Book Appointment" quick action button
7. Minimize/maximize state persisted in localStorage
8. Close button + minimize button (icon buttons)
9. Notification badge (unread AI messages count)
10. Mobile-optimized (full-screen overlay on screens <640px)

#### Labels

`ui` `chatbot` `frontend` `critical`

---

## Phase 4: Analytics & Optimization

---

### AI-014: Conversation Analytics Dashboard

| Field | Value |
|-------|-------|
| Task ID | AI-014 |
| Type | Feature |
| Priority | Medium |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 10 |
| Assignee | @PP-Namias |

#### Description

Admin dashboard to track chatbot performance, appointment booking rates, product recommendation CTR, and AI accuracy metrics.

#### Dependencies

- AI-013 (Chatbot operational)
- AI-009 (Appointments tracking)

#### Expected Outcomes

- [ ] `/admin/ai-analytics` dashboard page
- [ ] Metrics: Total conversations, avg response time, resolution rate
- [ ] Appointment funnel: Chat → Appointment Click → Booked → Completed
- [ ] Product recommendation click-through rate
- [ ] Top 10 asked questions
- [ ] Export all data to CSV

#### Tasks

1. Create analytics aggregation queries in Firestore
2. Build dashboard UI with Recharts (line charts, bar charts, pie charts)
3. Real-time metrics using Firestore listeners
4. Date range filters (last 7 days, 30 days, custom date picker)
5. Download reports as CSV button

#### Labels

`admin` `analytics` `dashboard` `reporting`

---

### AI-015: ChromaDB Seller Profile Vectors

| Field | Value |
|-------|-------|
| Task ID | AI-015 |
| Type | Feature |
| Priority | High |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 8 |
| Assignee | @PP-Namias |

#### Description

Vectorize seller profiles (specialties, location, product types) in ChromaDB for intelligent semantic matching when buyers request appointments.

#### Dependencies

- AI-003 (Ollama)
- ECOM-001 (Sanity seller data)

#### Expected Outcomes

- [ ] All seller profiles embedded in ChromaDB `seller_profiles` collection
- [ ] Semantic search returns relevant sellers (not just keyword matching)
- [ ] Query "Oyster mushroom expert in Manila" matches correctly
- [ ] Auto-update vectors when seller profiles change in Sanity

#### Tasks

1. Create Python script `scripts/vectorize-sellers.py`
2. Fetch seller profiles from Sanity (name, specialty, location, products sold)
3. Generate embeddings using Ollama `nomic-embed-text` model
4. Store vectors in ChromaDB with metadata
5. Create Sanity webhook → n8n → trigger re-vectorization on profile update
6. Test semantic queries: "Best grower for restaurants", "Bulk oyster supplier"

#### Labels

`ai` `chromadb` `sellers` `embeddings`

---

## Phase 5: Advanced Automation

---

### AI-016: Automated Follow-up System

| Field | Value |
|-------|-------|
| Task ID | AI-016 |
| Type | Feature |
| Priority | Medium |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 7 |
| Assignee | @PP-Namias |

#### Description

n8n workflows for automated email follow-ups: post-appointment feedback, no-show recovery, re-engagement campaigns for inactive chatbot users.

#### Tasks

1. n8n workflow: "Post-Appointment Feedback" (1hr after meeting, ask for rating)
2. n8n workflow: "No-Show Recovery" (if buyer doesn't show, offer reschedule)
3. Email templates for each scenario (use React Email)
4. Track feedback responses in Firestore `appointment_feedback` collection
5. A/B test email subject lines (store variants in Firestore, track open rates)

#### Labels

`automation` `n8n` `email` `follow-ups`

---

### AI-017: Appointment Rescheduling

| Field | Value |
|-------|-------|
| Task ID | AI-017 |
| Type | Feature |
| Priority | Medium |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 6 |
| Assignee | @PP-Namias |

#### Description

Allow buyers and sellers to reschedule appointments with one-click, automatic availability checking, and conflict resolution.

#### Tasks

1. Create API route: `/api/ai/appointment/reschedule/route.ts`
2. Check new time slot availability (query Firestore `seller_availability`)
3. Update Firestore `appointments` document (status, scheduledTime)
4. Send reschedule confirmation emails to both parties
5. Add "Reschedule" button to buyer's order history page

#### Labels

`appointments` `rescheduling` `api`

---

### AI-018: Seller Performance Insights

| Field | Value |
|-------|-------|
| Task ID | AI-018 |
| Type | Feature |
| Priority | Low |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 8 |
| Assignee | @PP-Namias |

#### Description

AI-generated weekly reports for sellers showing: appointment stats, no-show rates, buyer feedback, and personalized improvement suggestions.

#### Tasks

1. n8n cron job (every Monday 8AM Philippine time)
2. Query Firestore for seller's appointments (last 7 days)
3. Calculate metrics: completion rate, avg rating, no-show percentage
4. Use Ollama to generate improvement suggestions based on data
5. Email PDF report to seller (attach charts)

#### Labels

`sellers` `analytics` `automation` `insights`

---

## Phase 6: Polish & Optional Features

---

### AI-019: Multi-Language Support (Filipino)

| Field | Value |
|-------|-------|
| Task ID | AI-019 |
| Type | Feature |
| Priority | Low |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 10 |
| Assignee | @PP-Namias |

#### Description

Add Filipino language support to chatbot, allowing buyers to converse in Tagalog/Taglish with natural responses.

#### Tasks

1. Fine-tune Ollama model with Filipino dataset (mushroom terminology)
2. Detect language from first message (simple keyword detection)
3. Switch chatbot system prompts to Filipino
4. Translate product descriptions in Sanity (add `description_tl` field)
5. Bilingual email templates (English + Filipino)

#### Labels

`i18n` `filipino` `chatbot` `optional`

---

### AI-020: Voice Input (Optional - Piper TTS)

| Field | Value |
|-------|-------|
| Task ID | AI-020 |
| Type | Feature |
| Priority | Low |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 12 |
| Assignee | @PP-Namias |

#### Description

Add voice input/output to chatbot using FREE Piper TTS (local) and Web Speech API for an enhanced accessibility experience.

#### Tasks

1. Install Piper TTS locally: `pip install piper-tts`
2. Add microphone button to chatbot UI
3. Web Speech API for voice input (browser native)
4. Piper TTS for AI voice responses (Filipino + English voices)
5. Test on mobile devices (iOS Safari, Android Chrome)
6. Fallback to text-only if browser doesn't support Speech API

#### Labels

`voice` `tts` `optional` `piper` `accessibility`

---

### AI-021: Cart Abandonment Recovery

| Field | Value |
|-------|-------|
| Task ID | AI-021 |
| Type | Feature |
| Priority | Low |
| Status | Not Started |
| Parent | AI-001 |
| Story Points | 6 |
| Assignee | @PP-Namias |

#### Description

Detect cart abandonment events, send AI-personalized reminder emails with product suggestions and dynamic discount offers.

#### Tasks

1. n8n workflow triggered when cart inactive for 24 hours
2. Fetch abandoned cart items from Firestore
3. Use Ollama to generate personalized email copy
4. Include 5-10% discount code
5. Track recovery conversion rates

#### Labels

`automation` `cart` `email` `recovery`

---

### AI-022 through AI-034: Future Enhancements

**AI-022:** Seller Onboarding Chatbot (8 pts)  
**AI-023:** Product Image Recognition (10 pts - requires Vision AI)  
**AI-024:** Review Sentiment Analysis (8 pts)  
**AI-025:** AI-Generated Blog Content (7 pts)  
**AI-026:** WhatsApp Integration (10 pts)  
**AI-027:** SMS Notifications via Semaphore (6 pts)  
**AI-028:** Appointment Video Calls (12 pts - requires WebRTC)  
**AI-029:** AI Order Fraud Detection (8 pts)  
**AI-030:** Dynamic Pricing Suggestions (10 pts)  
**AI-031:** Seller Matching Algorithm Refinement (8 pts)  
**AI-032:** Chatbot A/B Testing Framework (6 pts)  
**AI-033:** Multi-Channel Support (Discord, Telegram) (10 pts)  
**AI-034:** AI System Health Monitoring (5 pts)

---

## Summary

**Total Epic Points:** 240  
**Phases:** 6  
**Timeline:** 12 weeks  
**Cost:** $0.00/month  

**Key Technologies:**
- n8n (self-hosted)
- Ollama (Llama 3.2 3B)
- Firebase Firestore
- Sanity CMS
- Next.js 15

**Primary Goal:** Direct buyer-to-seller appointments with 100% FREE AI infrastructure.
