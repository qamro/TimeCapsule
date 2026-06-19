import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Collections ──────────────────────────────
const capsulesCol = (uid) => collection(db, 'users', uid, 'capsules')
const userDoc     = (uid) => doc(db, 'users', uid)

// ── User Profile ─────────────────────────────

/** Get user profile from Firestore */
export async function getUserProfile(uid) {
  try {
    const snap = await getDoc(userDoc(uid))
    if (!snap.exists()) return null
    return snap.data()
  } catch (e) {
    console.error('getUserProfile error:', e.message)
    return null
  }
}

/** Save user profile to Firestore */
export async function saveUserProfile(uid, data) {
  try {
    await setDoc(userDoc(uid), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (e) {
    console.error('saveUserProfile error:', e.message)
  }
}

/** Subscribe to user profile changes in realtime */
export function subscribeUserProfile(uid, callback) {
  return onSnapshot(userDoc(uid), (snap) => {
    if (snap.exists()) callback(snap.data())
    else callback(null)
  }, (err) => {
    console.error('subscribeUserProfile error:', err.message)
  })
}

// ── Capsules ─────────────────────────────────

/** Create a new capsule */
export async function createCapsule(uid, data) {
  const ref = await addDoc(capsulesCol(uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    opened:    false,
  })
  return ref.id
}

/** Get all capsules for a user (realtime) */
export function subscribeCapsules(uid, callback, onError) {
  const q = query(capsulesCol(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const capsules = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(capsules)
  }, (err) => {
    console.error('subscribeCapsules error:', err.message)
    onError?.(err)
  })
}

/** Get a single capsule */
export async function getCapsule(uid, capsuleId) {
  const ref  = doc(capsulesCol(uid), capsuleId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/** Mark capsule as opened */
export async function openCapsule(uid, capsuleId) {
  const ref = doc(capsulesCol(uid), capsuleId)
  await updateDoc(ref, { opened: true, openedAt: serverTimestamp() })
}

/** Delete a capsule */
export async function deleteCapsule(uid, capsuleId) {
  await deleteDoc(doc(capsulesCol(uid), capsuleId))
}

/** Convert JS Date to Firestore Timestamp */
export function toTimestamp(date) {
  return Timestamp.fromDate(date)
}

/** Convert Firestore Timestamp to JS Date */
export function fromTimestamp(ts) {
  if (!ts) return null
  if (ts.toDate) return ts.toDate()
  if (ts.seconds) return new Date(ts.seconds * 1000)
  return new Date(ts)
}