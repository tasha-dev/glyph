import type { Models } from "appwrite";

export type AppwriteUser = Models.User<Models.Preferences>;
export interface DBNote {
  $id: string;
  $createdAt: string;
  $updatedAt: string;

  content: string;
  title: string;
  userId: string;
}
