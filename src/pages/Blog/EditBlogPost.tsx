"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { RichTextEditor } from "@/components/Editor/RichTextEditor"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { blogApi } from "@/api/blogApi"
import { toast } from "react-hot-toast"
import { ArrowLeft, ImageIcon, X, Save, Loader2, AlertCircle, Tag, FileText, Eye, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  _id: string
  name: string
}

export default function EditBlogPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState("edit")
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  useEffect(() => {
    // Set dirty state when form changes
    if (initialLoading) return
    setIsDirty(true)
  }, [title, content, categoryId, featuredImage, initialLoading])

  const fetchData = async () => {
    try {
      setInitialLoading(true)
      setError(null)

      const [postResponse, categoriesResponse] = await Promise.all([blogApi.getPostById(id!), blogApi.getCategories()])

      // Set post data
      setTitle(postResponse.data.title)
      setContent(postResponse.data.content)
      setCategoryId(postResponse.data.category._id)

      // Set featured image
      if (postResponse.data.featuredImage) {
        setExistingImageUrl(postResponse.data.featuredImage)
        setImagePreview(postResponse.data.featuredImage)
      }

      // Set categories
      if (categoriesResponse.data && categoriesResponse.data.length > 0) {
        setCategories(categoriesResponse.data)
      } else {
        setCategories([
          { _id: "1", name: "Technology" },
          { _id: "2", name: "Health & Wellness" },
          { _id: "3", name: "Business" },
          { _id: "4", name: "Personal Development" },
          { _id: "5", name: "Travel" },
          { _id: "6", name: "Food & Cooking" },
          { _id: "7", name: "Entertainment" },
          { _id: "8", name: "Science" },
        ])
      }

      setIsDirty(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load blog post data. Please try again.")
      toast.error("Failed to fetch data")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFeaturedImage(null)
    setImagePreview(null)
    setExistingImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!title.trim()) {
      setError("Please enter a title for your blog post")
      return
    }

    if (!categoryId) {
      setError("Please select a category")
      return
    }

    if (!imagePreview && !existingImageUrl) {
      setError("Please select a featured image")
      return
    }

    if (!content.trim()) {
      setError("Please add some content to your blog post")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Upload new image if selected
      let imageUrl = existingImageUrl

      if (featuredImage) {
        try {
          const uploadResponse = await blogApi.uploadImage(featuredImage)
          imageUrl = uploadResponse.url
        } catch (error) {
          console.error("Error uploading image:", error)
          setError("Failed to upload image. Please try again.")
          setLoading(false)
          return
        }
      }

      // Update blog post
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("category", categoryId)

      if (imageUrl) {
        formData.append("featuredImage", imageUrl)
      }

      await blogApi.updatePost(id!, formData)
      toast.success("Blog post updated successfully")
      setIsDirty(false)
      navigate("/blogs")
    } catch (error) {
      console.error("Error updating post:", error)
      setError("Failed to update blog post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      await blogApi.deletePost(id!)
      toast.success("Blog post deleted successfully")
      navigate("/blogs")
    } catch (error) {
      console.error("Error deleting post:", error)
      setError("Failed to delete blog post. Please try again.")
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setIsLeaving(true)
    } else {
      navigate("/blogs")
    }
  }

  const confirmLeave = () => {
    setIsLeaving(false)
    navigate("/blogs")
  }

  const getCategoryName = (id: string) => {
    const category = categories.find((cat) => cat._id === id)
    return category ? category.name : ""
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full mb-6" />
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/blogs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Post
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="edit" className="gap-2">
                <FileText className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Post Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an engaging title for your blog post"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Card className="border-dashed">
                  <CardContent className="p-0">
                    <RichTextEditor content={content} onChange={setContent} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="pt-4">
              {title || content ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{title || "Untitled Post"}</CardTitle>
                    {categoryId && <Badge variant="outline">{getCategoryName(categoryId)}</Badge>}
                  </CardHeader>
                  <CardContent>
                    {imagePreview && (
                      <div className="mb-6 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt={title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Nothing to preview yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Add a title and content to see a preview of your blog post
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
              <CardDescription>Configure your blog post details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <SelectValue placeholder="Select category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured-image">Featured Image</Label>
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Featured"
                          className="w-full h-auto rounded-md object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Upload featured image</p>
                        <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="featured-image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Post
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog open={isLeaving} onOpenChange={setIsLeaving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Discard Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
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
  )
}

