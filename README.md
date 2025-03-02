# Thank You QR - Gratitude Tracking App

A web application that allows users to create and share QR codes to express gratitude. When a QR code is scanned, it tracks unique visitors and their locations around the world.

## Features

- Create unique QR codes to share gratitude
- Track how many people have scanned the QR code
- See where in the world people have scanned from 
- View detailed stats about each QR code's usage
- User authentication and profile management
- Global statistics dashboard

## Technologies

- React
- TypeScript
- Firebase (Authentication, Firestore, Hosting)
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
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password) and Firestore
   - Update the Firebase configuration in `src/firebase.ts` with your own project details

4. Set up Mapbox:
   - Create an account at https://www.mapbox.com/
   - Generate an access token
   - Add your Mapbox token in the environment variables or appropriate configuration file

5. Run development server:
```
npm run dev
```

## Deployment

This project is configured for Firebase Hosting. To deploy:

```
# Log in to Firebase (first time only)
firebase login

# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

For hosting only (not updating Firestore rules):
```
firebase deploy --only hosting
```

## Project Structure

- `/src/components`: React components
- `/src/contexts`: Context providers including authentication
- `/src/services`: Service layer for API/Firebase interactions
- `/src/types`: TypeScript interfaces and types
- `/public`: Static assets

## Development

Run type checking:
```
npm run typecheck
```

Run linting:
```
npm run lint
```

## License

MIT
