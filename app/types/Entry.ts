export interface Entry {
  title: string;
  danceStyle: string;
  level: string;
  tags: string[];
  video: File | null;
  thumbnail: File | null;
  fileSize?: string;
}
