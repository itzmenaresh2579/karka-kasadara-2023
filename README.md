# Karka Kasadara Kids School — Website

React + Vite + Firebase website for Karka Kasadara Kids School, Kodumudi.

## Stack
- React + Vite
- Firebase Firestore (content storage)
- Firebase Authentication (staff login)
- React Router
- Deployed via Netlify

## Editable content
Everything on the site (hero text, about story, programs, contact info, gallery
photos) is stored in Firestore and can be edited by staff at **/staff** without
touching any code.

## Firestore Security Rules
Paste the rules from `firestore.rules` into
Firebase Console → Firestore Database → Rules → Publish.

## Local development
```
npm install
npm run dev
```

## Build
```
npm run build
```
Output goes to `dist/`, which Netlify publishes automatically (see `netlify.toml`).

## Adding a staff login
Firebase Console → Authentication → Users → Add user (email + password).
That email/password can then be used to sign in at `/staff`.
