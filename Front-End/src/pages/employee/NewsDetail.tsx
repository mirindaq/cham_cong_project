import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Clock, ArrowLeft, User, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";
import { articleApi } from "@/services/article.service";
import type { ArticleResponse } from "@/types/article.type";
import { EmployeeLayout } from "@/components/employee-layout";

export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const res = await articleApi.getArticleBySlug(slug);
        setData(res.data);
      } catch (err) {
        toast.error("Không thể tải bài viết");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, "");
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải bài viết...</p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  if (!data) {
    return (
      <EmployeeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-10">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Không tìm thấy bài viết
              </h3>
              <p className="text-muted-foreground mb-4">
                Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Header with back button */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>

        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground leading-tight mb-6">
              {data.title}
            </h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg" alt={data.employeeName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getAuthorInitials(data.employeeName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{data.employeeName}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(data.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{estimateReadingTime(data.content)} phút đọc</span>
              </div>
            </div>
          </div>

          {/* Article Content */}

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: data.content || "" }}
          ></div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
