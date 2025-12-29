export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  bio?: string;
  photoURL?: string;
  createdAt?: any;
}

export interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  text: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: any;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: any;
}
