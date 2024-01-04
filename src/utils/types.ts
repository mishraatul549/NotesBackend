export type TApiResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

export type SignUpInput = {
  username: string;
  password: string;
  name: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type CreateNote = {
  title: string;
  content: string;
};

export type DeleteNote = {
  id: string;
}

export type UpdateNote = {
  noteId: string;
  title?: string;
  content?: string;
};
export type shareNote = {
  noteId: string;
  sharedWith: string;
}