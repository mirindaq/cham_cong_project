export type ArticleRequest = {
  title: string;
  thumbnail: string;
  content: string;
  isActive?: boolean;
};

export type ArticleResponse = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  createdAt: string;
  isActive: boolean;
  employeeName: string;
};
