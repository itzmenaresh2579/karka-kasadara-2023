# Karka Kasadara Kids School — Website

Full React + Firebase website. Public pages are visible to everyone;
Admin panel (Staff Login) lets logged-in staff edit content and view
admission applications.

## 1. Set Firestore security rules (important — do this first)

1. Go to your Firebase project → **Firestore Database → Rules** tab.
2. Delete everything there and paste in the contents of `firestore.rules`
   (included in this folder).
3. Click **Publish**.

Without this step, the site's Firestore requests will be blocked by the
default "deny all" rules.

## 2. Run it locally (optional, to preview before deploying)

You'll need [Node.js](https://nodejs.org) installed (any recent version).

```
npm install
npm run dev
```

This opens the site at `http://localhost:5173`.

## 3. Deploy to Netlify (get a public link)

```
npm install
npm run build
```

This creates a `dist` folder with the finished, static website.

1. Go to **https://app.netlify.com/drop**
2. Drag and drop the `dist` folder onto the page.
3. Netlify gives you a public link immediately, e.g.
   `https://random-name-123.netlify.app`
4. (Optional) Create a free Netlify account to rename the site
   (Site settings → Change site name) or connect a custom domain you own.

Every time you make changes to the code and want to update the live site,
run `npm run build` again and drag the new `dist` folder onto Netlify
Drop (or connect this project to a GitHub repo for automatic deploys).

## 4. Adding or removing staff logins

Go to **Firebase Console → Authentication → Users → Add user** and enter
each staff member's email + password. They can then log in from the
"Staff Login" button on the website using that email and password.

Each staff member can change their own password from
**Admin panel → Settings** once logged in.

## 5. What lives where

- **Public site content** (school info, faculty, activities, achievements,
  gallery captions, colors) — stored in Firestore under the `content`
  collection. Anyone can view it; only logged-in staff can edit it via the
  Admin panel.
- **Admission applications** — stored in the `admissions` collection.
  Anyone can submit one; only logged-in staff can view the list.

## 6. Notes

- The map on the Contact page uses the latitude/longitude set in
  Admin → School Info. Right-click your school's exact location on
  Google Maps to copy precise coordinates.
- Logo: set a hosted image URL in Admin → School Info → "Logo image URL",
  or leave it as-is to keep the current embedded logo.
