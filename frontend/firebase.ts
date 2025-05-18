// firebase.ts - Initialisering og eksport av Firebase-tjenester i henhold til frontend.
// Dette gir en felles fil å hente Authentification og Firestore i hele appen.

// Importerer Firebase-moduler i henhold til React-Native.
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Initialiserer Firebase Authentification og brukes som gjenbrukbar instans.
export const authInstance = auth();
// Initialiserer Firestore-databasen.
export const db = firestore();


