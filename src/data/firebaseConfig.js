// Paste the config object from Firebase Console → Project settings → Your apps.
// The README explains how to create the project and the Firestore database.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Every phone in the family reads the same document. Keep the ID long and
// unguessable: with the no-login rules in the README, the ID itself is the key.
export const CLOUD_COLLECTION = 'familyProgress';
export const CLOUD_DOC_ID = 'sapna-daily-progress-7c4e91';

export function isCloudConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}
