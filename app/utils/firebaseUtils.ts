import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc, getDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Entry } from '../types/Entry';

const firebaseConfig = {
    apiKey: "AIzaSyCDEXkHwMZq1DrcGB_2TJd1R13pwTT68wk",
    authDomain: "dance-vocabulary-uploader.firebaseapp.com",
    projectId: "dance-vocabulary-uploader",
    storageBucket: "dance-vocabulary-uploader.appspot.com",
    messagingSenderId: "933742884431",
    appId: "1:933742884431:web:a2a452c0fb3aadf61b1c3a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export async function uploadEntries(entries: Entry[]) {
  for (const entry of entries) {
    if (!entry.video) continue;

    // Check if video is too big
    if (entry.video.size > 100 * 1024 * 1024) {
      throw new Error(`The video "${entry.video.name}" is larger than 100MB. Please upload a smaller file.`);
    }

    // Check if a dance move with the same title already exists
    const titleQuery = query(collection(db, 'dance_moves'), where('title', '==', entry.title));
    const titleQuerySnapshot = await getDocs(titleQuery);
    if (!titleQuerySnapshot.empty) {
      throw new Error(`A dance move with the title "${entry.title}" already exists.`);
    }

    // Check if a video with the same name already exists
    const videoRef = ref(storage, `videos/${entry.video.name}`);
    try {
      await getDownloadURL(videoRef);
      throw new Error(`A video with the name "${entry.video.name}" already exists.`);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        throw error;
      }
    }

    // Upload video to Firebase Storage
    await uploadBytes(videoRef, entry.video);
    const videoUrl = await getDownloadURL(videoRef);

    // Add dance move data to Firestore
    await addDoc(collection(db, 'dance_moves'), {
      title: entry.title,
      danceStyle: entry.danceStyle,
      level: entry.level,
      videoUrl,
    });
  }
}

export async function uploadEntryWithVideo(entry: Entry) {
  if (!entry.video || !entry.thumbnail) {
    throw new Error('Video and thumbnail are required');
  }

  // Check if a document with the same title already exists
  const docRef = doc(db, 'dance_moves', entry.title);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    throw new Error(`A dance move with the title "${entry.title}" already exists.`);
  }

  // Check if video with the same name already exists
  const videoRef = ref(storage, `videos/${entry.video.name}`);
  try {
    await getDownloadURL(videoRef);
    throw new Error(`A video with the name "${entry.video.name}" already exists.`);
  } catch (error: any) {
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }

  // Check if thumbnail with the same name already exists
  const thumbnailRef = ref(storage, `thumbnails/${entry.thumbnail.name}`);
  try {
    await getDownloadURL(thumbnailRef);
    throw new Error(`A thumbnail with the name "${entry.thumbnail.name}" already exists.`);
  } catch (error: any) {
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }

  // Upload video to Firebase Storage
  await uploadBytes(videoRef, entry.video);
  const videoUrl = await getDownloadURL(videoRef);

  // Upload thumbnail to Firebase Storage
  await uploadBytes(thumbnailRef, entry.thumbnail);
  const thumbnailUrl = await getDownloadURL(thumbnailRef);

  // Create entry document in Firestore with the title as the document ID
  const entryData = {
    title: entry.title,
    danceStyle: entry.danceStyle,
    level: entry.level,
    tags: entry.tags,
    videoUrl: videoUrl,
    thumbnailUrl: thumbnailUrl,
    createdAt: new Date()
  };

  await setDoc(doc(db, 'dance_moves', entry.title), entryData);
}