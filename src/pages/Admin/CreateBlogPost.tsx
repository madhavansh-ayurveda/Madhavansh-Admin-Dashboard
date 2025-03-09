import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor } from '@/components/Editor/RichTextEditor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/api/axios';

export default function CreateBlogPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/blogs', {
        title,
        content,
        // Add other fields as needed
      });
      navigate('/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </div>
  );
} 