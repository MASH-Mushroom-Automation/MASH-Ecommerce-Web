#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkAboutPage() {
  console.log('=== Checking About Page Configuration ===\n');

  // Check aboutPage singleton
  const aboutPage = await client.fetch(`*[_type == "aboutPage"][0]{
    heroTitle,
    mentorTitle,
    mentorSubtitle,
    mentor->{
      _id,
      firstName,
      lastName,
      role,
      personType,
      shortBio,
      "pictureUrl": picture.asset->url
    },
    autoFetchTeam,
    teamMembers[]->{
      _id,
      firstName,
      lastName,
      role
    }
  }`);

  console.log('About Page Singleton:');
  console.log(JSON.stringify(aboutPage, null, 2));

  // Check mentor person directly
  console.log('\n=== Mentor Person ===\n');
  const mentor = await client.fetch(`*[_type == "person" && personType == "mentor"][0]{
    _id,
    firstName,
    lastName,
    role,
    personType,
    shortBio,
    "pictureUrl": picture.asset->url
  }`);
  console.log(JSON.stringify(mentor, null, 2));
}

checkAboutPage().catch(console.error);
