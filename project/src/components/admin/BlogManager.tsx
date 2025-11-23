import { useState, useEffect } from 'react';
import { supabase, BlogPost } from '../../lib/supabase';
import { Plus, Edit, Trash2, Loader2, X, Save, Eye, EyeOff } from 'lucide-react';

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    published: false,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image_url: '',
      published: false,
    });
  };

  const handleEdit = (post: BlogPost) => {
    setIsCreating(false);
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url || '',
      published: post.published,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image_url: '',
      published: false,
    });
  };

  const handleSave = async () => {
    try {
      const postData = {
        ...formData,
        updated_at: new Date().toISOString(),
        published_at: formData.published ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
      }

      await loadPosts();
      handleCancel();
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (isCreating || editingPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
          </h3>
          <button
            onClick={handleCancel}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Titre de l'article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="mon-article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Extrait
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Résumé de l'article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contenu
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={12}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Contenu de l'article (Markdown supporté)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL de l'image
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://exemple.com/image.jpg"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="w-5 h-5 text-slate-900 border-slate-300 rounded focus:ring-2 focus:ring-slate-500"
            />
            <label htmlFor="published" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              {formData.published ? (
                <>
                  <Eye className="w-4 h-4" />
                  Article publié
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Article en brouillon
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">
          {posts.length} article{posts.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel article
        </button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-slate-900">{post.title}</h4>
                {post.published ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Publié
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded">
                    Brouillon
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">{post.excerpt}</p>
              <p className="text-xs text-slate-400 mt-2">
                Créé le {new Date(post.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(post)}
                className="p-2 text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">Aucun article pour le moment</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-slate-900 hover:text-slate-800 font-medium"
            >
              Créer votre premier article
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
