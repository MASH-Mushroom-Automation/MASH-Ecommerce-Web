/**
 * Check Team Members in Sanity
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26'
});

async function checkTeamMembers() {
  console.log('=== Checking Team Members in Sanity ===\n');
  
  const persons = await client.fetch(`*[_type == "person"] {
    _id,
    firstName,
    lastName,
    role,
    showOnAboutPage,
    isActive,
    displayOrder,
    personType,
    "pictureUrl": picture.asset->url,
    picture
  }`);
  
  console.log(`Found ${persons.length} persons:\n`);
  
  persons.forEach((p, i) => {
    console.log(`${i + 1}. ${p.firstName} ${p.lastName}`);
    console.log(`   Role: ${p.role || 'N/A'}`);
    console.log(`   Type: ${p.personType || 'N/A'}`);
    console.log(`   showOnAboutPage: ${p.showOnAboutPage}`);
    console.log(`   isActive: ${p.isActive}`);
    console.log(`   displayOrder: ${p.displayOrder}`);
    console.log(`   Has Picture: ${!!p.picture}`);
    console.log(`   Picture URL: ${p.pictureUrl || 'NO IMAGE'}`);
    console.log('');
  });
  
  // Also check aboutPage singleton
  console.log('\n=== Checking About Page Singleton ===\n');
  const aboutPage = await client.fetch(`*[_type == "aboutPage"][0] {
    heroTitle,
    teamTitle,
    autoFetchTeam,
    "teamMembersCount": count(teamMembers),
    "mentorName": mentor->firstName + " " + mentor->lastName,
    "mentorPicture": mentor->picture.asset->url
  }`);
  
  console.log('About Page:', JSON.stringify(aboutPage, null, 2));
}

checkTeamMembers().catch(console.error);
