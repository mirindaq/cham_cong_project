import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { articleApi } from "@/services/article.service";
import { AdminLayout } from "@/components/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ArticleResponse } from "@/types/article.type";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadApi } from "@/services/upload.service";
import Editor from "@/components/Editor";
import { Label } from "@/components/ui/label";
import PaginationComponent from "@/components/PaginationComponent";
import { parseISO, format } from "date-fns";
import type Quill from "quill";

export default function AdminNews() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState<ArticleResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState({
    page: "1",
    title: "",
    createdDate: "",
    status: "all",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<ArticleResponse | null>(
    null
  );
  const [titleInput, setTitleInput] = useState("");
  const [isActive, setIsActive] = useState(false);
  const quillRef = useRef<Quill | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [content, setContent] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const paramsObj: any = {
        page: currentPage || 1,
      };

      if (filter.title) paramsObj.title = filter.title;
      if (filter.createdDate) paramsObj.createdDate = filter.createdDate;
      if (filter.status === "active") paramsObj.isActive = true;
      if (filter.status === "inactive") paramsObj.isActive = false;

      console.log(paramsObj);

      const res = await articleApi.getAllArticles(paramsObj);
      setNews(res.data);
      setTotalPage(res.totalPage);
      setTotalItems(res.totalItem);
    } catch (err) {
      toast.error("Không thể tải dữ liệu bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const title = searchParams.get("title") || "";
    const createdDate = searchParams.get("createdDate") || "";
    const status = searchParams.get("status") || "all";
    setFilter({
      page: searchParams.get("page") || "1",
      title,
      createdDate,
      status,
    });
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedNews) {
      setTitleInput(selectedNews.title);
      setIsActive(selectedNews.isActive);
      setContent(selectedNews.content || "");
    }
  }, [selectedNews]);

  const handleFilter = () => {
    const newParams = new URLSearchParams();
    if (filter.title) newParams.set("title", filter.title);
    if (filter.createdDate) newParams.set("createdDate", filter.createdDate);
    if (filter.status !== "all") newParams.set("status", filter.status);

    setCurrentPage(1);
    newParams.set("page", "1");

    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const handleAddOrUpdateArticle = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const editorHtml = quillRef.current?.root.innerHTML || "";

    if (editorHtml === "<p><br></p>") {
      toast.error("Nội dung không được rỗng");
      return;
    }

    if (!selectedFile && !selectedNews?.thumbnail) {
      toast.error("Vui lòng chọn ảnh đại diện");
      return;
    }

    if (!titleInput.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    setLoadingUpdate(true);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(editorHtml, "text/html");
      const imgTags = doc.querySelectorAll("img");

      for (const img of imgTags) {
        const src = img.getAttribute("src") || "";

        if (src.startsWith("data:image")) {
          const blob = await (await fetch(src)).blob();
          const file = new File([blob], `image-${Date.now()}.png`, {
            type: blob.type,
          });

          const formData = new FormData();
          formData.append("files", file);
          const res = await uploadApi.upload(formData);
          const uploadedUrl = res.data.data[0];
          img.setAttribute("src", uploadedUrl);
        }
      }

      const finalHtml = doc.body.innerHTML;
      let imageUrl = selectedNews?.thumbnail || "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResponse = await uploadApi.upload(formData);
        imageUrl = uploadResponse.data.data;
      }

      const payload = {
        title: titleInput,
        thumbnail: imageUrl,
        content: finalHtml,
        isActive: isActive,
      };

      if (selectedNews?.id && selectedNews.id !== 0) {
        await articleApi.updateArticle(selectedNews.slug, payload);
        toast.success("Cập nhật bài viết thành công");
      } else {
        await articleApi.createArticle(payload);
        toast.success("Thêm bài viết thành công");
      }

      setIsOpen(false);
      fetchData();
      setSelectedNews(null);
      setTitleInput("");
      setSelectedFile(null);
      setIsActive(false);
      setContent("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Có lỗi xảy ra khi xử lý bài viết");
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Quản lý tin tức</CardTitle>
              <CardDescription>Theo dõi và quản lý tin tức</CardDescription>
            </div>
            <Button
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm tin tức
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <div className="bg-muted/50 py-2 rounded-lg mb-6 px-2">
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1">Tiêu đề</Label>
                  <Input
                    placeholder="Tìm theo tiêu đề..."
                    className="w-full sm:w-[220px]"
                    value={filter.title}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1">Ngày</Label>
                  <Input
                    type="date"
                    className="w-full sm:w-[220px]"
                    value={filter.createdDate}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        createdDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1">Trạng thái</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) =>
                      setFilter((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Đang áp dụng</SelectItem>
                      <SelectItem value="inactive">Không áp dụng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full sm:w-auto self-end"
                  onClick={handleFilter}
                >
                  Lọc
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="border rounded-md">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b bg-muted/50">
                      <TableHead className="p-2 text-left font-medium">
                        STT
                      </TableHead>
                      <TableHead className="p-2 text-left font-medium">
                        Tiêu đề
                      </TableHead>
                      <TableHead className="p-2 text-left font-medium">
                        Ảnh đại diện
                      </TableHead>
                      <TableHead className="p-2 text-left font-medium">
                        Ngày tạo
                      </TableHead>
                      <TableHead className="p-2 text-left font-medium">
                        Trạng thái
                      </TableHead>
                      <TableHead className="p-2 text-left font-medium">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.length > 0 &&
                      news.map((record, index: number) => (
                        <TableRow key={record.id} className="border-b">
                          <TableCell className="p-2">
                            {(currentPage - 1) * 5 + index + 1}
                          </TableCell>
                          <TableCell className="p-2">{record.title}</TableCell>
                          <TableCell className="p-2">
                            <img
                              src={record.thumbnail}
                              alt="thumbnail"
                              className="w-20 h-14 object-cover"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            {record.createdAt
                              ? format(
                                  parseISO(record.createdAt),
                                  "dd/MM/yyyy HH:mm:ss"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell className="p-2">
                            <span
                              className={`rounded-full px-2 py-1 text-sm font-medium ${
                                record.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {record.isActive
                                ? "Đang áp dụng"
                                : "Chưa áp dụng"}
                            </span>
                          </TableCell>
                          <TableCell className="p-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedNews(record);
                                    setIsOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      await articleApi.updateArticleStatus(
                                        record.id,
                                        !record.isActive
                                      );
                                      toast.success("Cập nhật thành công");
                                      fetchData();
                                    } catch {
                                      toast.error("Cập nhật thất bại");
                                    }
                                  }}
                                >
                                  {record.isActive ? (
                                    <>
                                      <XCircleIcon className="mr-2 h-4 w-4 text-red-600" />
                                      Hủy áp dụng
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                      Áp dụng
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <PaginationComponent
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Tổng số: {totalItems} bản ghi
          </div>
        </CardFooter>
      </Card>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSelectedNews(null);
            setTitleInput("");
            setSelectedFile(null);
            setIsActive(false);
            setContent("");
          }
        }}
      >
        <DialogContent className="!max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedNews?.id && selectedNews.id !== 0
                ? "Cập nhật bài viết"
                : "Thêm bài viết mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết bài viết
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddOrUpdateArticle}>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tiêu đề</Label>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Nhập tiêu đề"
                required
              />
            </div>
            <div className="flex justify-center ">
              <div className="border rounded-lg p-4 bg-white shadow  w-full flex flex-col items-center">
                {selectedFile || selectedNews?.thumbnail ? (
                  <div
                    className="cursor-pointer"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <img
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : selectedNews?.thumbnail
                      }
                      alt="Ảnh thumbnail"
                      className="max-h-60 rounded object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <div className="text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm">Nhấp để chọn ảnh</p>
                    </div>
                  </div>
                )}
                <input
                  id="file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nội dung</Label>
              <Editor ref={quillRef} value={content} onTextChange={() => {}} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="active" className="text-right">
                Kích hoạt
              </Label>
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
            <div className="text-right">
              <Button type="submit" disabled={loadingUpdate}>
                {loadingUpdate && (
                  <svg
                    className="animate-spin h-4 w-4 mr-2 inline-block text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                )}
                {selectedNews?.id && selectedNews.id !== 0
                  ? "Cập nhật"
                  : "Thêm mới"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
