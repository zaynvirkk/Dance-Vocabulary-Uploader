export interface Entry {
  id?: string; // Add this if using UUID
  title: string;
  danceStyle: string;
  level: string;
  tags: string[];
  video: File | null;
  thumbnail: File | null;
  fileSize?: string;
}
