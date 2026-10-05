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
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
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
  throw new Error(errMsg);
}

// Clean undefined values recursively so Firestore never throws 'Unsupported field value: undefined'
export function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = cleanForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
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
    (snapshot) => {
      // If Firestore is empty (e.g. user emptied/deleted all fleet units), respect empty fleet
      if (snapshot.empty) {
        onData([]);
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

// Check and seed initial data if collection is empty
export async function checkAndSeedIfEmpty(fallbackList?: SaranaLV[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'vehicles'));
    if (snap.empty) {
      console.log('Seeding initial LV vehicles to Firestore...');
      await seedInitialVehicles(fallbackList);
    }
  } catch (err) {
    console.warn('Check and seed notice:', err);
  }
}

// Seed initial vehicles into Firestore
export async function seedInitialVehicles(vehiclesToSeed?: SaranaLV[]): Promise<void> {
  const collectionPath = 'vehicles';
  const dataList = vehiclesToSeed && vehiclesToSeed.length > 0 ? vehiclesToSeed : INITIAL_LV_DATA;
  try {
    const batch = writeBatch(db);
    dataList.forEach((veh) => {
      const docRef = doc(db, collectionPath, veh.id);
      batch.set(docRef, cleanForFirestore({
        ...veh,
        updatedAt: new Date().toISOString(),
      }));
    });
    await batch.commit();
    console.log('Successfully seeded LV vehicles to Firestore!');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

// Save single vehicle (Add or Update) to Firestore real-time cloud
export async function saveVehicleToFirestore(vehicle: SaranaLV): Promise<void> {
  const docPath = `vehicles/${vehicle.id}`;
  try {
    const docRef = doc(db, 'vehicles', vehicle.id);
    const payload = cleanForFirestore({
      ...vehicle,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    console.log(`Saved vehicle ${vehicle.noLambung} to Firestore Cloud.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete vehicle from Firestore
export async function deleteVehicleFromFirestore(vehicleId: string): Promise<void> {
  const docPath = `vehicles/${vehicleId}`;
  try {
    const docRef = doc(db, 'vehicles', vehicleId);
    await deleteDoc(docRef);
    console.log(`Deleted vehicle ${vehicleId} from Firestore Cloud.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Batch update all vehicles to Firestore (e.g. sync from local or Google Sheets)
export async function syncAllVehiclesToFirestore(vehicles: SaranaLV[]): Promise<void> {
  if (!vehicles || vehicles.length === 0) return;
  const collectionPath = 'vehicles';
  try {
    const batch = writeBatch(db);
    vehicles.forEach((v) => {
      const docRef = doc(db, 'vehicles', v.id);
      batch.set(
        docRef,
        cleanForFirestore({
          ...v,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    });
    await batch.commit();
    console.log(`Synchronized ${vehicles.length} vehicles to Firestore Cloud.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}
