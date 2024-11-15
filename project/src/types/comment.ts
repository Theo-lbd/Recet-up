export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: Date;
  parentId?: string | null;
  isEdited?: boolean;
  updatedAt?: Date;
}

export interface CommentFormData {
  content: string;
  parentId?: string | null;
}