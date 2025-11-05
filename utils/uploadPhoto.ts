import * as FileSystem from 'expo-file-system';
import { supabase } from '../config/supabaseClient';

export async function uploadPhoto(fileUri: string, userId: string, fileName: string, mimeType: string) {
  try {
    console.log('uploadPhoto: fileUri received:', fileUri);
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log('uploadPhoto: fileInfo:', fileInfo);

    // Read file as base64
    console.log('uploadPhoto: reading file as base64');
    const file = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    console.log('uploadPhoto: base64 length', file.length);
    console.log('uploadPhoto: first 100 chars of base64:', file.substring(0, 100));
    if (!file || file.length === 0) {
      throw new Error('Base64 string is empty');
    }
    if (!file.startsWith('/9j/')) {
      console.warn('uploadPhoto: base64 does NOT start with /9j/ (JPEG)! Actual start:', file.substring(0, 10));
    } else {
      console.log('uploadPhoto: base64 starts with /9j/ (JPEG)');
    }

    console.log('uploadPhoto: uploading to storage');
    const { error } = await supabase.storage
      .from('user-uploads')
      .upload(`${userId}/${fileName}`, file, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('uploadPhoto: upload error:', error);
      throw error;
    }

    const storagePath = `${userId}/${fileName}`;
    console.log('uploadPhoto: success, storagePath:', storagePath);
    return storagePath;
  } catch (e) {
    console.error('uploadPhoto: error:', e);
    throw e;
  }
}

export async function getPhotoUrl(storagePath: string) {
  console.log('getPhotoUrl: called with', storagePath);
  
  // Ensure the path has the correct prefix
  let finalStoragePath = storagePath;
  if (!storagePath.startsWith('user-uploads/')) {
    finalStoragePath = `user-uploads/${storagePath}`;
    console.log('getPhotoUrl: added user-uploads prefix:', finalStoragePath);
  }
  
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .createSignedUrl(finalStoragePath, 60 * 60 * 24);
  if (error) {
    console.error('getPhotoUrl: error', error);
    throw error;
  }
  console.log('getPhotoUrl: signedUrl', data.signedUrl);
  return data.signedUrl;
}

export async function deletePhoto(userId: string, fileName: string) {
  const { error } = await supabase.storage
    .from('user-uploads')
    .remove([`${userId}/${fileName}`]);
  if (error) throw error;
} 