import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from './firebase'

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signOut          = () => fbSignOut(auth)
export const onAuth           = (cb) => onAuthStateChanged(auth, cb)
