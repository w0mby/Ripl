# Thank You QR - Gratitude Tracking App

A web application that allows users to create and share QR codes to express gratitude. When a QR code is scanned, it tracks unique visitors and their locations around the world.

## Features

- Create unique QR codes to share gratitude
- Track how many people have scanned the QR code
- See where in the world people have scanned from 
- View detailed stats about each QR code's usage

## Technologies

- React 19
- TypeScript
- Firebase (Firestore, Hosting)
- Vite
- react-qr-code for QR generation
- Mapbox for location visualization

## Setup

1. Clone the repository
2. Install dependencies:
```
npm install
```

3. Configure Firebase:
   - Update the Firebase configuration in `src/firebase.ts` with your own project details

4. Set up Mapbox:
   - Add your Mapbox token in `src/components/QrStats.tsx`

5. Run development server:
```
npm run dev
```

## Deployment

This project is configured for Firebase Hosting. To deploy:

```
# Log in to Firebase (first time only)
npm run firebase:login

# Deploy to Firebase
npm run deploy
```

For hosting only (not updating Firestore rules):
```
npm run deploy:hosting
```

## Project Structure

- `/src/components`: React components
- `/src/services`: Service layer for API/Firebase interactions
- `/src/types`: TypeScript interfaces and types
- `/public`: Static assets

## License

MIT
