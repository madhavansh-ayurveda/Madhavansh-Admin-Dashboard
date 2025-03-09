"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { blogApi, BlogPost } from "@/api/blogApi";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  Calendar,
  Tag,
  Eye,
  AlertCircle,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const filterAndSortPosts = useCallback(() => {
    let filtered = [...posts];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (post) => post.category._id === categoryFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortBy === "newest") {
        return dateB - dateA;
      } else if (sortBy === "oldest") {
        return dateA - dateB;
      } else if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    setFilteredPosts(filtered);
  }, [posts, searchQuery, categoryFilter, sortBy]);

  useEffect(() => {
    filterAndSortPosts();
  }, [filterAndSortPosts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogApi.getAllPosts();
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load blog posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await blogApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const confirmDeletePost = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await blogApi.deletePost(postToDelete._id);
      setPosts(posts.filter((post) => post._id !== postToDelete._id));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post. Please try again.");
    }
  };

  const getExcerpt = (content: string, maxLength = 120) => {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]+>/g, "");
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
  };

  const renderSkeletons = () => {
    if (viewMode === "grid") {
      return Array(6)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video w-full bg-muted animate-pulse" />
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </CardFooter>
          </Card>
        ));
    } else {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-4 border rounded-lg"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ));
    }
  };

  return (
    <div className=" mx-auto py-2 animate-in fade-in duration-500 dark:bg-dark-surface dark:text-dark-on-surface dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="tracking-tight text-xl font-semibold flex items-center gap-2">Blog Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit and manage your blog posts
          </p>
        </div>

        <Link to="/blogs/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Create New Post</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-card rounded-lg border shadow-sm mb-8">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            {/* Search Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>

              <Tabs
                value={viewMode}
                onValueChange={setViewMode}
                className="hidden sm:block"
              >
                <TabsList>
                  <TabsTrigger value="grid" className="px-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" x2="21" y1="6" y2="6" />
                      <line x1="3" x2="21" y1="12" y2="12" />
                      <line x1="3" x2="21" y1="18" y2="18" />
                    </svg>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {renderSkeletons()}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No blog posts found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first blog post"}
              </p>
              {!searchQuery && categoryFilter === "all" && (
                <Link to="/blogs/create">
                  <Button>Create New Post</Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPosts.map((post) => (
                    <Card
                      key={post._id}
                      className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md"
                    >
                      <div className="aspect-video w-full bg-muted relative overflow-hidden">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {post.category.name}
                            </Badge>
                            <CardTitle className="text-xl">
                              {post.title}
                            </CardTitle>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/blogs/edit/${post._id}`}
                                  className="cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/blog/${post._id}`}
                                  className="cursor-pointer"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => confirmDeletePost(post)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex-grow">
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {getExcerpt(post.content)}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </div>
                        <Link to={`/blogs/edit/${post._id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <div
                      key={post._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block h-14 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage || "/placeholder.svg"}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{post.title}</h3>
                            <Badge
                              variant="outline"
                              className="hidden sm:inline-flex"
                            >
                              {post.category.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(post.createdAt), "MMM d, yyyy")}
                            </span>
                            <Badge variant="outline" className="sm:hidden">
                              {post.category.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-shrink-0 ml-auto sm:ml-0">
                        <Link to={`/blogs/edit/${post._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3"
                          >
                            <Edit className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 text-destructive hover:bg-destructive/10"
                          onClick={() => confirmDeletePost(post)}
                        >
                          <Trash2 className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the blog post "{postToDelete?.title}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
