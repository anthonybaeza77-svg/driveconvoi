import { useEffect, useState } from 'react';
import { supabase, BlogPost } from '../lib/supabase';
import { Calendar, ArrowRight } from 'lucide-react';

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-slate-600">Aucun article disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow group"
        >
          {post.image_url && (
            <div className="h-48 overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center text-sm text-slate-500 mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              {post.published_at && formatDate(post.published_at)}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
            <button className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Lire la suite
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
