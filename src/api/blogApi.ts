// import { useSelector } from "react-redux";
import { AdminApi, uploadApi } from "./axios";
import Cookies from "js-cookie";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: {
    _id: string;
    name: string;
  };
  author: {
    _id: string;
    name: string;
  };
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export const blogApi = {
  getAllPosts: async (page = 1, limit = 10) => {
    const response = await AdminApi.get(`/blogs?page=${page}&limit=${limit}`);
    return response.data;
  },

  uploadImage: async (image: File) => {
    const token = localStorage.getItem('adminToken') || Cookies.get('token');
    const formData = new FormData();
    formData.append('featuredImage', image);
    console.log(token);
    

    const response = await uploadApi.post("/blogs/upload", formData, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getPostById: async (id: string) => {
    const response = await AdminApi.get(`/blogs/id/${id}`);
    return response.data;
  },

  createPost: async (postData: {
    title: string;
    content: string;
    categoryId: string;
    author: string;
    featuredImage?: string;
  }) => {
    const response = await AdminApi.post('/blogs', postData);
    return response.data;
  },

  updatePost: async (id: string, postData: FormData) => {
    const response = await AdminApi.put(`/blogs/${id}`, postData);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await AdminApi.delete(`/blogs/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await AdminApi.get('/categories');
    return response.data;
  }
}; 