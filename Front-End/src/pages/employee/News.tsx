import { useEffect, useState } from "react";
import type { ArticleResponse } from "@/types/article.type";
import { Link, useSearchParams } from "react-router";
import PaginationComponent from "@/components/PaginationComponent";
import { toast } from "sonner";
import { articleApi } from "@/services/article.service";
import { EmployeeLayout } from "@/components/employee-layout";
import Spinner from "@/components/Spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { parseISO, format } from "date-fns";

export default function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ArticleResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [, setTotalItems] = useState<number>(0);
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());

      const apiParams = {
        ...params,
        isActive: true,
      };

      const res = await articleApi.getAllArticles(apiParams);

      setData(res.data);
      setTotalPage(res.totalPage);
      setTotalItems(res.totalItems);
    } catch (err) {
      toast.error("Không thể tải dữ liệu bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchParams.get("page")) {
      setSearchParams({ page: "1" });
    } else {
      fetchArticles();
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams((prev) => {
      return new URLSearchParams({
        ...Object.fromEntries(prev),
        page: String(page),
      });
    });
  };

  // Hàm loại bỏ thẻ <p> ở đầu content (nếu có)
  function stripHtmlTags(html: string = ""): string {
    if (typeof window !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    }
    // fallback cho SSR
    return html.replace(/<[^>]+>/g, "");
  }

  if (isLoading) {
    return <Spinner layout="employee" />;
  }

  return (
    <EmployeeLayout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Tin tức</CardTitle>
          <CardDescription>
            Cập nhật thông tin mới nhất về công ty và các sự kiện
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {data.map((article) => (
              <Link
                to={`/employee/news/${article.slug}`}
                key={article.id}
                className="block"
              >
                <Card className=" transition-all !my-1 duration-300 hover:shadow-sm">
                  <div className="flex gap-4 items-center">
                    <div className="w-[120px] h-[120px] flex-shrink-0">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <div className="ml-2 flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-black line-clamp-2 !mb-1">
                        {article.title}
                      </CardTitle>

                      <div className="flex items-center gap-1 text-gray-500 mb-1">
                        <Clock className="text-sm" />
                        <span className="text-sm">
                          {article.createdAt
                            ? format(
                                parseISO(article.createdAt),
                                "dd/MM/yyyy HH:mm:ss"
                              )
                            : "N/A"}
                        </span>
                      </div>

                      {article.content && (
                        <div
                          className="text-gray-700 text-sm line-clamp-2 "
                          dangerouslySetInnerHTML={{
                            __html: stripHtmlTags(article.content),
                          }}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <PaginationComponent
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </EmployeeLayout>
  );
}
