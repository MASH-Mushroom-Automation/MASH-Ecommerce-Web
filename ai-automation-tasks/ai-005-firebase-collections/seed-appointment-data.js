/**
 * Seed Appointment Data Script (AI-005)
 * 
 * This script creates sample data for the appointment booking system:
 * - 3 sample sellers with Firebase auth UIDs
 * - 7 days of availability slots for each seller
 * - 2 sample appointments (1 confirmed, 1 pending)
 * 
 * Usage:
 *   node ai-automation-tasks/ai-005-firebase-collections/seed-appointment-data.js
 * 
 * Prerequisites:
 *   - Firebase Admin SDK initialized
 *   - GOOGLE_APPLICATION_CREDENTIALS set to service account key
 *   - Firebase project: mash-ddf8d
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../mash-ddf8d-firebase-adminsdk-credentials.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mash-ddf8d'
});

const db = admin.firestore();

// Sample seller data (matching growers collection)
const SELLERS = [
  {
    uid: 'seller_juan_farm_001',
    name: "Juan's Farm",
    email: 'juan@example.com',
    phone: '+639171234567',
    specialty: ['Oyster', 'King Oyster'],
    location: {
      address: '123 Farm Road, Baguio City',
      city: 'Baguio',
      coordinates: { lat: 16.4023, lng: 120.5960 }
    },
    capacity: '50kg/week',
    rating: 4.8
  },
  {
    uid: 'seller_maria_mushrooms_002',
    name: "Maria's Mushrooms",
    email: 'maria@example.com',
    phone: '+639181234567',
    specialty: ['Shiitake', 'Enoki'],
    location: {
      address: '456 Harvest St, Tagaytay City',
      city: 'Tagaytay',
      coordinates: { lat: 14.1053, lng: 120.9601 }
    },
    capacity: '75kg/week',
    rating: 4.9
  },
  {
    uid: 'seller_pedro_organic_003',
    name: "Pedro's Organic",
    email: 'pedro@example.com',
    phone: '+639191234567',
    specialty: ['Oyster', 'Button'],
    location: {
      address: '789 Green Valley, Laguna',
      city: 'Laguna',
      coordinates: { lat: 14.2691, lng: 121.4113 }
    },
    capacity: '100kg/week',
    rating: 4.7
  }
];

// Generate 7 days of availability slots (next week)
function generateAvailabilitySlots(sellerUid, sellerName) {
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to midnight
  
  // Generate slots for next 7 days
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Generate slots from 9:00 AM to 5:00 PM (30-minute intervals)
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Randomly mark some slots as unavailable (30% chance)
        const isAvailable = Math.random() > 0.3;
        
        // Create DateTime object for scheduled_time (Firestore Timestamp)
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);
        
        slots.push({
          seller_uid: sellerUid,
          seller_name: sellerName,
          available_date: dateString,
          start_time: timeString,
          end_time: `${hour}:${minute + 30 === 60 ? '00' : (minute + 30).toString().padStart(2, '0')}`,
          is_available: isAvailable,
          scheduled_time: admin.firestore.Timestamp.fromDate(slotDateTime),
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  }
  
  return slots;
}

// Generate sample appointments
function generateSampleAppointments() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0); // 10:00 AM tomorrow
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 0, 0, 0); // 2:00 PM day after tomorrow
  
  return [
    {
      // Confirmed appointment
      buyer_uid: 'buyer_test_001',
      buyer_name: 'John Buyer',
      buyer_email: 'john@example.com',
      buyer_phone: '+639201234567',
      buyer_location: 'Manila',
      seller_uid: SELLERS[0].uid,
      seller_name: SELLERS[0].name,
      seller_email: SELLERS[0].email,
      product_type: 'Oyster Mushroom',
      quantity: 10,
      scheduled_date: tomorrow.toISOString().split('T')[0],
      scheduled_time: admin.firestore.Timestamp.fromDate(tomorrow),
      status: 'confirmed',
      special_requests: 'Please call before delivery',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      confirmed_at: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      // Pending appointment
      buyer_uid: 'buyer_test_002',
      buyer_name: 'Jane Smith',
      buyer_email: 'jane@example.com',
      buyer_phone: '+639211234567',
      buyer_location: 'Quezon City',
      seller_uid: SELLERS[1].uid,
      seller_name: SELLERS[1].name,
      seller_email: SELLERS[1].email,
      product_type: 'Shiitake Mushroom',
      quantity: 15,
      scheduled_date: dayAfter.toISOString().split('T')[0],
      scheduled_time: admin.firestore.Timestamp.fromDate(dayAfter),
      status: 'pending',
      special_requests: '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
}

// Main seed function
async function seedAppointmentData() {
  try {
    console.log('🌱 Starting appointment data seeding...\n');
    
    // 1. Create availability slots for each seller
    console.log('📅 Creating availability slots...');
    let totalSlots = 0;
    
    for (const seller of SELLERS) {
      const slots = generateAvailabilitySlots(seller.uid, seller.name);
      console.log(`  - Creating ${slots.length} slots for ${seller.name}...`);
      
      // Batch write for efficiency
      const batch = db.batch();
      slots.forEach((slot) => {
        const docRef = db.collection('availability_slots').doc();
        batch.set(docRef, slot);
      });
      
      await batch.commit();
      totalSlots += slots.length;
      console.log(`    ✅ ${slots.length} slots created`);
    }
    
    console.log(`  ✅ Total: ${totalSlots} availability slots created\n`);
    
    // 2. Create sample appointments
    console.log('🤝 Creating sample appointments...');
    const appointments = generateSampleAppointments();
    
    for (const appointment of appointments) {
      const docRef = await db.collection('appointments').add(appointment);
      console.log(`  ✅ Created ${appointment.status} appointment (ID: ${docRef.id})`);
      console.log(`     Buyer: ${appointment.buyer_name}`);
      console.log(`     Seller: ${appointment.seller_name}`);
      console.log(`     Date: ${appointment.scheduled_date}`);
    }
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`  - ${SELLERS.length} sellers`);
    console.log(`  - ${totalSlots} availability slots (7 days)`);
    console.log(`  - ${appointments.length} sample appointments`);
    
    console.log('\n🧪 Test Queries:');
    console.log(`  1. Get slots for Juan's Farm:`);
    console.log(`     db.collection('availability_slots').where('seller_uid', '==', '${SELLERS[0].uid}').where('is_available', '==', true).get()`);
    console.log(`  2. Get buyer appointments:`);
    console.log(`     db.collection('appointments').where('buyer_uid', '==', 'buyer_test_001').get()`);
    console.log(`  3. Get seller appointments:`);
    console.log(`     db.collection('appointments').where('seller_uid', '==', '${SELLERS[0].uid}').get()`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run seed function
seedAppointmentData();
