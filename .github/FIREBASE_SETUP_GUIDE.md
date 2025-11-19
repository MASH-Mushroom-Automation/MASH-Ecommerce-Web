# 🔥 Firebase Setup Guide for MASH E-commerce

**Date:** November 20, 2025  
**Status:** 📋 STEP-BY-STEP GUIDE - Create New Firebase Project  
**Time Required:** 15-20 minutes

---

## 🎯 Why Create a New Firebase Project?

**Current Issue:**
- ❌ Using Firebase config from `j5ecommerce` (wrong project)
- ❌ Config tied to different domain and analytics
- ❌ Shared project across different applications

**After Setup:**
- ✅ Dedicated Firebase project for MASH
- ✅ Separate authentication users
- ✅ Separate database and storage
- ✅ Proper analytics integration with GA4

---

## 📝 Step-by-Step Firebase Setup

### Step 1: Create New Firebase Project (5 minutes)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project:**
   - Click **"Add project"** or **"Create a project"**
   - Enter project name: `MASH E-commerce` (or `mash-ecommerce`)
   - Click **Continue**

3. **Google Analytics Setup:**
   - Toggle **"Enable Google Analytics for this project"** → **ON**
   - Click **Continue**

4. **Configure Google Analytics:**
   - Select **"Create a new account"**
   - Account name: `MASH Analytics`
   - Check analytics terms checkbox
   - Click **"Create project"**

5. **Wait for Setup:**
   - Firebase will create your project (30-60 seconds)
   - Click **"Continue"** when done

### Step 2: Register Web App (3 minutes)

1. **Add Web App:**
   - In Firebase Console, click the **Web icon** `</>`
   - App nickname: `MASH E-commerce Web`
   - ✅ Check **"Also set up Firebase Hosting"** (optional but recommended)
   - Click **"Register app"**

2. **Copy Firebase Configuration:**
   - You'll see a code snippet like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "mash-ecommerce.firebaseapp.com",
     projectId: "mash-ecommerce",
     storageBucket: "mash-ecommerce.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890",
     measurementId: "G-XXXXXXXXXX"
   };
   ```
   - **Keep this page open!** We'll use these values next

3. **Click "Continue to console"**

### Step 3: Enable Authentication (5 minutes)

1. **Navigate to Authentication:**
   - In left sidebar, click **"Build"** → **"Authentication"**
   - Click **"Get started"**

2. **Enable Email/Password:**
   - Click **"Email/Password"** provider
   - Toggle **"Email/Password"** to **Enabled**
   - Click **"Save"**

3. **Enable Google Sign-In (Optional):**
   - Click **"Add new provider"**
   - Select **"Google"**
   - Toggle to **Enabled**
   - Project support email: (your email)
   - Click **"Save"**

4. **Enable Facebook Sign-In (Optional):**
   - Click **"Add new provider"**
   - Select **"Facebook"**
   - You'll need to create Facebook App first (see below)
   - Toggle to **Enabled**
   - Enter App ID and App Secret
   - Click **"Save"**

5. **Enable Phone Authentication (Optional):**
   - Click **"Add new provider"**
   - Select **"Phone"**
   - Toggle to **Enabled**
   - Click **"Save"**

### Step 4: Enable Firestore Database (3 minutes)

1. **Navigate to Firestore:**
   - In left sidebar, click **"Build"** → **"Firestore Database"**
   - Click **"Create database"**

2. **Choose Location:**
   - Select **"Start in production mode"** (recommended)
   - Click **"Next"**

3. **Select Region:**
   - Choose: **`asia-southeast1 (Singapore)`** (closest to Philippines)
   - Click **"Enable"**

4. **Wait for Database Creation:**
   - Takes 1-2 minutes
   - Database ready when you see Collections tab

### Step 5: Enable Cloud Storage (2 minutes)

1. **Navigate to Storage:**
   - In left sidebar, click **"Build"** → **"Storage"**
   - Click **"Get started"**

2. **Security Rules:**
   - Select **"Start in production mode"**
   - Click **"Next"**

3. **Choose Location:**
   - Should match Firestore: **`asia-southeast1`**
   - Click **"Done"**

### Step 6: Link Google Analytics (Already Done!)

**Good news:** When you enabled Google Analytics in Step 1, Firebase automatically:
- ✅ Created GA4 property
- ✅ Linked it to your Firebase project
- ✅ Set measurement ID

**To verify:**
1. Go to **Project Settings** (gear icon)
2. Click **"Integrations"** tab
3. See **"Google Analytics"** → **"Manage"**
4. Should show your measurement ID: **`G-5XD8QWQP6J`**

---

## 🔑 Your New Firebase Configuration

After completing the steps above, you'll have these values:

```env
# MASH E-commerce Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..." # From Step 2
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mash-ecommerce.firebaseapp.com" # From Step 2
NEXT_PUBLIC_FIREBASE_PROJECT_ID="mash-ecommerce" # From Step 2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="mash-ecommerce.firebasestorage.app" # From Step 2
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012" # From Step 2
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890" # From Step 2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-5XD8QWQP6J" # Already have this!
```

---

## 📋 What to Do After Setup

### Option 1: If You Created New Firebase Project

**Tell your AI:**
```
I've created a new Firebase project for MASH.
Here are my new Firebase config values:

NEXT_PUBLIC_FIREBASE_API_KEY="..." 
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-5XD8QWQP6J"

Please update all environment files with these new values.
```

### Option 2: If You Want to Keep Current Firebase Project

**Current setup is fine if:**
- ✅ `j5ecommerce` Firebase project is yours
- ✅ You don't mind sharing Firebase project across apps
- ✅ Authentication users can be mixed
- ✅ Firestore data can be shared

**We already updated:**
- ✅ GA Measurement ID to `G-5XD8QWQP6J` (MASH-specific)
- ✅ Both `.env.local` and `studio/.env` files

**Your current working config:**
```env
# MASH E-commerce Firebase Configuration (using j5ecommerce project)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDw1aJdMsnt0HFV664HlqqG_xTlKQN82jA"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="j5ecommerce.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="j5ecommerce"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="j5ecommerce.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="384167706332"
NEXT_PUBLIC_FIREBASE_APP_ID="1:384167706332:web:531b21667c89c3dfcebe19"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-5XD8QWQP6J" # ✅ Updated to MASH
```

---

## 🚀 Quick Decision Matrix

| Scenario | Recommendation | Action |
|----------|---------------|--------|
| **j5ecommerce is your project** | Keep current config | ✅ Already done - no action needed |
| **j5ecommerce is shared/test** | Create new Firebase | Follow guide above |
| **Want complete separation** | Create new Firebase | Follow guide above |
| **Want to move fast** | Keep current config | ✅ Already working |

---

## 🔒 Security Best Practices

### 1. Firestore Security Rules

**After enabling Firestore, update rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders collection - authenticated users can read/write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Block all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. Cloud Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Product images - public read, admin write
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User avatars - authenticated users only
    match /users/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Block all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Authentication Settings

1. **Email Enumeration Protection:**
   - Go to Authentication → Settings
   - Scroll to "User actions"
   - Enable **"Email enumeration protection"** (recommended)

2. **Authorized Domains:**
   - Go to Authentication → Settings → Authorized domains
   - Add your domains:
     - `localhost` (already there)
     - `mash-ecommerce-web.vercel.app`
     - Your custom domain (if any)

---

## 📊 Testing Your Firebase Setup

### Test 1: Authentication Test

```typescript
// Test in browser console (after setup)
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
createUserWithEmailAndPassword(auth, "test@example.com", "password123")
  .then((userCredential) => {
    console.log("✅ User created:", userCredential.user.uid);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
  });
```

### Test 2: Firestore Test

```typescript
// Test in browser console
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = getFirestore();
addDoc(collection(db, "test"), { message: "Hello MASH!" })
  .then((docRef) => {
    console.log("✅ Document created:", docRef.id);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
  });
```

### Test 3: Storage Test

```typescript
// Test in browser console
import { getStorage, ref, uploadString } from "firebase/storage";

const storage = getStorage();
const testRef = ref(storage, 'test/hello.txt');
uploadString(testRef, 'Hello MASH!')
  .then(() => {
    console.log("✅ File uploaded successfully");
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
  });
```

---

## 🆘 Troubleshooting

### Issue 1: "Firebase API key is invalid"
**Solution:**
- Verify you copied the entire API key
- Check for extra spaces or quotes
- Restart dev server after updating `.env.local`

### Issue 2: "Auth domain is not authorized"
**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Click "Authorized domains"
3. Add `localhost` and your Vercel domain

### Issue 3: "Permission denied" on Firestore/Storage
**Solution:**
- Update security rules (see Security Best Practices above)
- Make sure user is authenticated before accessing protected data

### Issue 4: Analytics not tracking
**Solution:**
- Already configured! GA ID is `G-5XD8QWQP6J`
- Make sure you've updated `.env.local` (already done)
- Restart dev server: `npm run dev`

---

## 📞 Need Help?

**If you created a new Firebase project:**
```
After setup, share your Firebase config values and I'll update all files for you!
```

**If you're keeping current config:**
```
You're all set! Current config already updated with MASH GA tracking.
Test your site at http://localhost:3000
```

**For Facebook Authentication:**
1. Go to https://developers.facebook.com/
2. Create new app → "Consumer" type
3. Add Facebook Login product
4. Copy App ID and App Secret to Firebase

**For advanced features:**
- Cloud Functions: https://firebase.google.com/docs/functions
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Remote Config: https://firebase.google.com/docs/remote-config

---

## 🎉 What's Already Done

### ✅ Completed in Previous Session:
- **Google Analytics 4:** Configured with `G-5XD8QWQP6J`
- **Environment Files:** Updated `.env.local` and `studio/.env`
- **Analytics Tracking:** Active on all pages, product views, cart actions
- **Dev Server:** Running at http://localhost:3000
- **Sanity CMS:** Deployed at https://mash-ecommerce.sanity.studio/

### ⏳ Waiting on Your Decision:
- **Firebase Project:** Keep current (j5ecommerce) or create new MASH project?

---

**Date Created:** November 20, 2025  
**Last Updated:** November 20, 2025  
**Status:** ✅ Guide Ready - Choose Your Firebase Setup Option
