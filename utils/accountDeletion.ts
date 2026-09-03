import { collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { 
  deleteUser, 
  User, 
  reauthenticateWithPopup, 
  reauthenticateWithCredential, 
  GoogleAuthProvider, 
  EmailAuthProvider 
} from 'firebase/auth';
import { db } from './firebase';

/**
 * Deletes all Firestore data belonging to a user:
 * - Subcollection: tasks
 * - Subcollection: taskactivities
 * - Subcollection: categories
 * - Subcollection: rewards
 * - Root document: users/{userId}
 */
export async function deleteAllUserFirestoreData(userId: string): Promise<void> {
  const subcollections = ['tasks', 'taskactivities', 'categories', 'rewards'];

  for (const subcol of subcollections) {
    const colRef = collection(db, 'users', userId, subcol);
    const snap = await getDocs(colRef);
    
    if (!snap.empty) {
      const docs = snap.docs;
      // Firestore batch limit is 500 writes
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + 400);
        chunk.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
  }

  // Delete root user document in 'users' collection
  const userDocRef = doc(db, 'users', userId);
  await deleteDoc(userDocRef);
}

/**
 * Re-authenticates the user if necessary, deletes all Firestore documents,
 * and deletes the Firebase Auth user account.
 */
export async function deleteUserAccountAndData(
  user: User, 
  password?: string
): Promise<void> {
  const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
  const isPasswordUser = user.providerData.some(p => p.providerId === 'password');

  // If password user, re-authenticate first to verify password and refresh credentials
  if (isPasswordUser && password && user.email) {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } else if (isGoogleUser) {
    // Re-authenticate Google user via popup to ensure recent login requirement is satisfied
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await reauthenticateWithPopup(user, provider);
    } catch (err: any) {
      // If user closed the popup, cancel the deletion flow
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        throw new Error('REAUTH_CANCELLED');
      }
      // Otherwise re-throw to display error
      throw err;
    }
  }

  // Delete all user documents from Firestore
  await deleteAllUserFirestoreData(user.uid);

  // Delete Firebase Auth user
  try {
    await deleteUser(user);
  } catch (err: any) {
    if (err.code === 'auth/requires-recent-login') {
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        await deleteUser(user);
        return;
      }
    }
    throw err;
  }
}
