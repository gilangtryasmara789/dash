import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SaranaLV } from '../types';
import { INITIAL_LV_DATA } from '../data/initialData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Operation Types for Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration or network connection.');
    }
    return false;
  }
}

// Auth functions
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Check if user is system admin
export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  const adminEmails = [
    'gilangtryasmara789@gmail.com',
  ];
  return adminEmails.includes(user.email.toLowerCase());
}

// Subscribe to real-time vehicles data
export function subscribeToVehicles(
  onData: (vehicles: SaranaLV[]) => void,
  onError?: (err: unknown) => void
) {
  const collectionPath = 'vehicles';
  const vehiclesCol = collection(db, collectionPath);

  return onSnapshot(
    vehiclesCol,
    async (snapshot) => {
      // If Firestore is empty on the very first run
      if (snapshot.empty) {
        // If an authenticated user is active, seed the database
        if (auth.currentUser) {
          try {
            await seedInitialVehicles();
            return;
          } catch (seedErr) {
            console.warn('Could not auto-seed to Firestore:', seedErr);
          }
        }
        // For unauthenticated visitors (e.g. supervisor on mobile/pc), deliver initial local fleet data
        onData(INITIAL_LV_DATA);
        return;
      }

      const list: SaranaLV[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SaranaLV;
        list.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort by noLambung (LV-001, LV-002, etc.)
      list.sort((a, b) => a.noLambung.localeCompare(b.noLambung));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } catch (e) {
        if (typeof onError === 'function') {
          onError(e);
        }
      }
    }
  );
}

// Check and seed initial data if collection is empty (only when authenticated)
export async function checkAndSeedIfEmpty(): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const snap = await getDocs(collection(db, 'vehicles'));
    if (snap.empty) {
      console.log('Seeding initial LV vehicles for authenticated user...');
      await seedInitialVehicles();
    }
  } catch (err) {
    console.warn('Check and seed empty notice:', err);
  }
}

// Seed initial vehicles (requires authentication)
export async function seedInitialVehicles(): Promise<void> {
  if (!auth.currentUser) {
    console.log('Skipping seedInitialVehicles: user is not authenticated.');
    return;
  }
  const collectionPath = 'vehicles';
  try {
    const batch = writeBatch(db);
    INITIAL_LV_DATA.forEach((veh) => {
      const docRef = doc(db, collectionPath, veh.id);
      batch.set(docRef, {
        ...veh,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
    console.log('Successfully seeded initial LV vehicles to Firestore!');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

// Save single vehicle (Add or Update)
export async function saveVehicleToFirestore(vehicle: SaranaLV): Promise<void> {
  if (!auth.currentUser) {
    console.info('saveVehicleToFirestore: unauthenticated client, skipping Firestore write.');
    return;
  }
  const docPath = `vehicles/${vehicle.id}`;
  try {
    const docRef = doc(db, 'vehicles', vehicle.id);
    const payload = {
      ...vehicle,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete vehicle from Firestore
export async function deleteVehicleFromFirestore(vehicleId: string): Promise<void> {
  if (!auth.currentUser) {
    console.info('deleteVehicleFromFirestore: unauthenticated client, skipping Firestore delete.');
    return;
  }
  const docPath = `vehicles/${vehicleId}`;
  try {
    const docRef = doc(db, 'vehicles', vehicleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Batch update all vehicles (e.g. after sync or bulk import)
export async function syncAllVehiclesToFirestore(vehicles: SaranaLV[]): Promise<void> {
  if (!auth.currentUser) {
    console.info('syncAllVehiclesToFirestore: unauthenticated client, skipping bulk sync.');
    return;
  }
  const collectionPath = 'vehicles';
  try {
    const batch = writeBatch(db);
    vehicles.forEach((v) => {
      const docRef = doc(db, 'vehicles', v.id);
      batch.set(
        docRef,
        {
          ...v,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}
