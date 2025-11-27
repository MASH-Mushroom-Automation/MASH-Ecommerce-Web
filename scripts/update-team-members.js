/**
 * Update Team Members Script
 * Updates the person documents in Sanity with correct team member information
 * 
 * Run: node scripts/update-team-members.js
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

console.log('═'.repeat(60));
console.log('       MASH Team Members Update Script');
console.log('═'.repeat(60));
console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);
console.log('═'.repeat(60));

// Correct team member data
const teamMembers = [
  {
    firstName: 'Kevin',
    lastName: 'A. Llanes',
    role: 'Project Manager',
    personType: 'team',
    shortBio: 'Leading the MASH project with expertise in project management and team coordination.',
    displayOrder: 1,
    showOnAboutPage: true,
    isActive: true,
  },
  {
    firstName: 'Irheil Mae',
    lastName: 'S. Antang',
    role: 'Software Engineer',
    personType: 'team',
    shortBio: 'Developing robust software solutions for the MASH mushroom automation system.',
    displayOrder: 2,
    showOnAboutPage: true,
    isActive: true,
  },
  {
    firstName: 'Ma. Catherine',
    lastName: 'H. Bae',
    role: 'Front-end Developer',
    personType: 'team',
    shortBio: 'Crafting beautiful and responsive user interfaces for the MASH e-commerce platform.',
    displayOrder: 3,
    showOnAboutPage: true,
    isActive: true,
  },
  {
    firstName: 'Jin Harold',
    lastName: 'A. Failana',
    role: 'Hardware Programmer',
    personType: 'team',
    shortBio: 'Programming IoT devices and sensors for mushroom cultivation automation.',
    displayOrder: 4,
    showOnAboutPage: true,
    isActive: true,
  },
  {
    firstName: 'Jhon Keneth Ryan',
    lastName: 'B. Namias',
    role: 'Back-end Developer',
    personType: 'team',
    shortBio: 'Building scalable APIs and server infrastructure for the MASH platform.',
    displayOrder: 5,
    showOnAboutPage: true,
    isActive: true,
  },
  {
    firstName: 'Emannuel',
    lastName: 'L. Pabua',
    role: 'Database Administrator',
    personType: 'team',
    shortBio: 'Managing and optimizing databases for efficient data storage and retrieval.',
    displayOrder: 6,
    showOnAboutPage: true,
    isActive: true,
  },
  {
    firstName: 'Ronan Renz',
    lastName: 'T. Valencia',
    role: 'Full Stack Developer',
    personType: 'team',
    shortBio: 'Developing end-to-end solutions across the entire MASH technology stack.',
    displayOrder: 7,
    showOnAboutPage: true,
    isActive: true,
  },
];

// Thesis adviser (mentor)
const mentor = {
  firstName: 'Joemen',
  lastName: 'G. Barrios, MIT',
  role: 'Thesis Adviser',
  personType: 'mentor',
  shortBio: 'Guiding the MASH team with expertise in information technology and academic research.',
  displayOrder: 0,
  showOnAboutPage: true,
  isFeatured: true,
  isActive: true,
};

async function deleteExistingPersons() {
  console.log('\n🗑️  Removing existing person documents...');
  
  try {
    const existingPersons = await client.fetch(`*[_type == "person"]._id`);
    
    if (existingPersons.length > 0) {
      for (const id of existingPersons) {
        await client.delete(id);
        console.log(`   ✅ Deleted: ${id}`);
      }
      console.log(`   📊 Removed ${existingPersons.length} existing persons`);
    } else {
      console.log('   ℹ️  No existing persons to remove');
    }
  } catch (error) {
    console.error('   ❌ Error deleting persons:', error.message);
  }
}

async function createTeamMember(member, index) {
  const slug = `${member.firstName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${member.lastName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`.replace(/-+/g, '-');
  
  const doc = {
    _type: 'person',
    firstName: member.firstName,
    lastName: member.lastName,
    role: member.role,
    personType: member.personType,
    shortBio: member.shortBio,
    displayOrder: member.displayOrder,
    showOnAboutPage: member.showOnAboutPage,
    isFeatured: member.isFeatured || false,
    isActive: member.isActive,
  };

  try {
    const created = await client.create(doc);
    console.log(`   ✅ Created: ${member.firstName} ${member.lastName} (${member.role})`);
    return created;
  } catch (error) {
    console.error(`   ❌ Error creating ${member.firstName} ${member.lastName}:`, error.message);
    return null;
  }
}

async function updateAboutPage(teamMemberIds) {
  console.log('\n📄 Updating About Page with team members...');
  
  try {
    // Check if aboutPage exists
    const aboutPage = await client.fetch(`*[_type == "aboutPage"][0]`);
    
    if (!aboutPage) {
      console.log('   ⚠️  About page not found, creating new one...');
      
      // Create about page with team settings
      await client.create({
        _type: 'aboutPage',
        _id: 'aboutPageDoc',
        heroTitle: 'About MASH',
        heroSubtitle: 'Mushroom Automation System for Harvest - Revolutionizing mushroom cultivation through IoT technology.',
        teamSectionTitle: 'Meet Our Team',
        teamSectionSubtitle: 'The brilliant minds behind MASH - passionate about technology and sustainable agriculture.',
        autoFetchTeam: true, // Auto-fetch all persons with showOnAboutPage=true
      });
      
      console.log('   ✅ Created About page with auto-fetch enabled');
    } else {
      // Update existing about page
      await client.patch(aboutPage._id)
        .set({
          teamSectionTitle: 'Meet Our Team',
          teamSectionSubtitle: 'The brilliant minds behind MASH - passionate about technology and sustainable agriculture.',
          autoFetchTeam: true,
        })
        .commit();
      
      console.log('   ✅ Updated About page with team settings');
    }
  } catch (error) {
    console.error('   ❌ Error updating About page:', error.message);
  }
}

async function main() {
  try {
    // Step 1: Delete existing persons
    await deleteExistingPersons();
    
    // Step 2: Create mentor first
    console.log('\n👨‍🏫 Creating Thesis Adviser...');
    const mentorDoc = await createTeamMember(mentor, 0);
    
    // Step 3: Create team members
    console.log('\n👥 Creating Team Members...');
    const createdMembers = [];
    for (let i = 0; i < teamMembers.length; i++) {
      const member = await createTeamMember(teamMembers[i], i + 1);
      if (member) {
        createdMembers.push(member);
      }
    }
    
    // Step 4: Update about page
    const allMemberIds = mentorDoc ? [mentorDoc._id, ...createdMembers.map(m => m._id)] : createdMembers.map(m => m._id);
    await updateAboutPage(allMemberIds);
    
    console.log('\n' + '═'.repeat(60));
    console.log('                    UPDATE COMPLETE');
    console.log('═'.repeat(60));
    console.log('\n📋 Summary:');
    console.log(`   • 1 thesis adviser created`);
    console.log(`   • ${createdMembers.length} team members created`);
    console.log(`   • About page updated with auto-fetch enabled`);
    console.log('\n✅ Team members will now appear on the About page!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open Sanity Studio (cd studio && npm run dev)');
    console.log('   2. Go to Blog → Authors & Team');
    console.log('   3. Upload profile pictures for each team member');
    console.log('   4. Refresh the About page to see changes');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
