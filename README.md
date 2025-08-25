# School Site (Netlify + Firebase)

Features:
- Email/password auth (students by default; set admin role in Realtime Database under `users/{uid}/role = "admin"`)
- Real-time class chat
- Quiz page (client-side)
- Notice board (from Firebase)
- Admin panel for notices + uploaded files
- Student uploads to Firebase Storage

## Setup
1. Create a Firebase project and a Web App. Copy your config into `firebase.js` (replace placeholders).
2. Enable products:
   - Authentication → Email/Password (Enabled)
   - Realtime Database → Create DB (test rules allowed for dev)
   - Storage → Enable (test rules allowed for dev)
3. (Optional) Set an admin:
   - In Realtime Database add: `users/{uid} = { "email": "admin@school.com", "role": "admin" }`
4. Deploy to Netlify:
   - Drag-and-drop the folder or connect your Git repo.
5. Visit `/signup.html` to create a student, then `/admin.html` with an admin user.

> NOTE: For production, lock down Database & Storage rules.


## Your Firebase Config
- Project ID: school-site-86150
- Realtime DB URL: https://school-site-86150-default-rtdb.firebaseio.com
- Storage Bucket: school-site-86150.appspot.com
