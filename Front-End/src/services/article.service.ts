import type { ArticleRequest } from "@/types/article.type";
import http from "@/utils/http";

export const articleApi = {
  createArticle: async (articleData: ArticleRequest) => {
    const response = await http.post("/articles", articleData);
    return response.data;
  },

  getAllArticles: async (dataFilter: any) => {
    const response = await http.get("/articles", { params: dataFilter });
    return response.data.data;
  },

  getArticleBySlug: async (slug: string) => {
    const response = await http.get(`/articles/${slug}`);
    return response.data;
  },

  updateArticle: async (slug: string, articleData: ArticleRequest) => {
    const response = await http.put(`/articles/${slug}`, articleData);
    return response.data;
  },

  updateArticleStatus: async (id: number, status: boolean) => {
    const response = await http.put(`/articles/update-status/${id}/${status}`);
    return response.data;
  },
};
