"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  RefreshCw, 
  Grid, 
  List, 
  Star,
  ExternalLink,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

type PressMention = Database['public']['Tables']['press_mentions']['Row'];

interface PressMentionsFormProps {
  portfolioId: string;
  theme: any;
}

export default function PressMentionsForm({ portfolioId, theme }: PressMentionsFormProps) {
  const [pressMentions, setPressMentions] = useState<PressMention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [layout, setLayout] = useState<'featured' | 'list' | 'grid'>('featured');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Form state for new/edit item
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image_url: '',
    date: '',
    source: '',
    featured: false
  });

  // Load press mentions
  useEffect(() => {
    loadPressMentions();
  }, [portfolioId]);

  const loadPressMentions = async () => {
    try {
      const { data, error } = await supabase
        .from('press_mentions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPressMentions(data || []);
    } catch (error) {
      console.error('Error loading press mentions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      image_url: '',
      date: '',
      source: '',
      featured: false
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      alert('Title and URL are required');
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('press_mentions')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('press_mentions')
          .insert({
            ...formData,
            portfolio_id: portfolioId,
            order_index: pressMentions.length
          });

        if (error) throw error;
      }

      resetForm();
      loadPressMentions();
    } catch (error) {
      console.error('Error saving press mention:', error);
      alert('Error saving press mention');
    }
  };

  const handleEdit = (item: PressMention) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      url: item.url,
      image_url: item.image_url || '',
      date: item.date || '',
      source: item.source || '',
      featured: item.featured
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this press mention?')) return;

    try {
      const { error } = await supabase
        .from('press_mentions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPressMentions();
    } catch (error) {
      console.error('Error deleting press mention:', error);
      alert('Error deleting press mention');
    }
  };

  const uploadImage = async (file: File, itemId: string) => {
    try {
      setUploadingImage(itemId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${itemId}-${Date.now()}.${fileExt}`;
      const filePath = `press-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-bg')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-bg')
        .getPublicUrl(filePath);

      // Update the press mention with the new image URL
      const { error: updateError } = await supabase
        .from('press_mentions')
        .update({ image_url: publicUrl })
        .eq('id', itemId);

      if (updateError) throw updateError;

      loadPressMentions();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingImage(null);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('press_mentions')
        .update({ featured })
        .eq('id', id);

      if (error) throw error;
      loadPressMentions();
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const sortedMentions = [...pressMentions].sort((a, b) => {
    if (layout === 'featured') {
      // Featured first, then by order
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
    }
    return a.order_index - b.order_index;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading press mentions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Layout Controls */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme.colors.heading}`}>
          Press & Media Mentions
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setLayout('featured')}
            variant={layout === 'featured' ? 'default' : 'outline'}
            size="sm"
            className={`${layout === 'featured' ? 'bg-purple-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
          >
            <Star className="w-4 h-4 mr-1" />
            Featured First
          </Button>
          <Button
            onClick={() => setLayout('list')}
            variant={layout === 'list' ? 'default' : 'outline'}
            size="sm"
            className={`${layout === 'list' ? 'bg-purple-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
          >
            <List className="w-4 h-4 mr-1" />
            List View
          </Button>
          <Button
            onClick={() => setLayout('grid')}
            variant={layout === 'grid' ? 'default' : 'outline'}
            size="sm"
            className={`${layout === 'grid' ? 'bg-purple-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
          >
            <Grid className="w-4 h-4 mr-1" />
            Grid View
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <h4 className={`text-md font-medium mb-4 ${theme.colors.heading}`}>
          {editingId ? 'Edit Press Mention' : 'Add New Press Mention'}
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={`text-sm font-medium ${theme.colors.text}`}>
                Title *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Rolling Stone Feature"
                className={`mt-1 ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                isRequired
              />
            </div>
            
            <div>
              <Label className={`text-sm font-medium ${theme.colors.text}`}>
                Source (Publication)
              </Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Rolling Stone"
                className={`mt-1 ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
              />
            </div>
          </div>

          <div>
            <Label className={`text-sm font-medium ${theme.colors.text}`}>
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the press mention..."
              className={`mt-1 ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={`text-sm font-medium ${theme.colors.text}`}>
                URL *
              </Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/article"
                className={`mt-1 ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                isRequired
              />
            </div>
            
            <div>
              <Label className={`text-sm font-medium ${theme.colors.text}`}>
                Date
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`mt-1 ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
              />
            </div>
          </div>

          <div>
            <Label className={`text-sm font-medium ${theme.colors.text}`}>
              Image URL (Optional)
            </Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              className={`mt-1 ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured-switch"
              isChecked={formData.featured}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <Label htmlFor="featured-switch" className={`text-sm ${theme.colors.text}`}>
              Featured mention (will be highlighted)
            </Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {editingId ? 'Update' : 'Add'} Press Mention
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Press Mentions List */}
      <div className="space-y-4">
        {sortedMentions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No press mentions yet. Add your first one above!
          </div>
        ) : (
          sortedMentions.map((item) => (
            <div
              key={item.id}
              className={`bg-white/5 rounded-lg border border-white/10 p-4 ${item.featured ? 'ring-2 ring-yellow-500/50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {item.featured && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
                    <h5 className={`font-medium ${theme.colors.heading}`}>
                      {item.title}
                    </h5>
                  </div>
                  
                  {item.description && (
                    <p className={`text-sm ${theme.colors.text} opacity-80 mb-2`}>
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {item.source && <span>{item.source}</span>}
                    {item.date && <span>{new Date(item.date).toLocaleDateString()}</span>}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Article
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {/* Image Upload */}
                  <input
                    type="file"
                    id={`image-upload-${item.id}`}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, item.id);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <Button
                    onClick={() => document.getElementById(`image-upload-${item.id}`)?.click()}
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage === item.id}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {uploadingImage === item.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Featured Toggle */}
                  <Button
                    onClick={() => toggleFeatured(item.id, !item.featured)}
                    variant="outline"
                    size="sm"
                    className={`${item.featured ? 'bg-yellow-600/20 border-yellow-500/30 text-yellow-300' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                  >
                    <Star className={`h-4 w-4 ${item.featured ? 'fill-current' : ''}`} />
                  </Button>
                  
                  {/* Edit */}
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {/* Delete */}
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="outline"
                    size="sm"
                    className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Image Preview */}
              {item.image_url && (
                <div className="mt-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-12 w-auto object-contain rounded"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 