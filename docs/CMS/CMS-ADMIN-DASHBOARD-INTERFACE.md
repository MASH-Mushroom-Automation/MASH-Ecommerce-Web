# 🎛️ Admin Dashboard CMS Interface Guide

This guide provides comprehensive UI components and patterns for managing all CMS content in your Admin Dashboard.

## 📱 Dashboard Layout Structure

```
Admin Dashboard Pages:
├── cms/
│   ├── dashboard/           # CMS Overview Dashboard
│   ├── hero/               # Hero Section Management
│   ├── features/           # Features Management
│   ├── about/              # About Page Management
│   ├── faq/                # FAQ Management
│   ├── contact/            # Contact Management
│   ├── policies/           # Policy Management
│   ├── blog/               # Blog Management
│   ├── site/               # Site Settings
│   └── media/              # Media Management
├── auth/                   # Authentication
└── layout.tsx             # Admin Layout
```

## 🧩 Core UI Components

### **1. CMS Dashboard Overview**

```typescript
// src/pages/cms/dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CMSStats } from '@/components/cms/CMSStats';

export default function CMSDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-gray-600">Manage all dynamic content across your platform</p>
        </div>
        <Button>Create New Content</Button>
      </div>

      {/* Stats Overview */}
      <CMSStats />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hero Sections</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* More stat cards... */}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Activity items */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### **2. Hero Section Management**

```typescript
// src/pages/cms/hero/index.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroForm } from '@/components/cms/HeroForm';
import { HeroList } from '@/components/cms/HeroList';
import { useHeroes } from '@/hooks/useCMS';

export default function HeroManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null);
  const { heroes, loading, createHero, updateHero, deleteHero } = useHeroes();

  const handleCreate = () => {
    setEditingHero(null);
    setShowForm(true);
  };

  const handleEdit = (hero: HeroSection) => {
    setEditingHero(hero);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hero section?')) {
      await deleteHero(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hero Sections</h1>
          <p className="text-gray-600">Manage homepage hero banners and call-to-actions</p>
        </div>
        <Button onClick={handleCreate}>Create Hero</Button>
      </div>

      {/* Hero Form Modal */}
      {showForm && (
        <HeroForm
          hero={editingHero}
          onSave={async (data) => {
            if (editingHero) {
              await updateHero(editingHero.id, data);
            } else {
              await createHero(data);
            }
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Hero List */}
      <Card>
        <CardHeader>
          <CardTitle>All Hero Sections ({heroes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <HeroList
              heroes={heroes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### **3. Hero Form Component**

```typescript
// src/components/cms/HeroForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';

const heroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  backgroundImages: z.array(z.string()).min(1, 'At least one background image is required'),
  primaryButton: z.object({
    text: z.string().min(1, 'Button text is required'),
    url: z.string().min(1, 'Button URL is required'),
    variant: z.enum(['primary', 'secondary', 'outline', 'ghost'])
  }),
  secondaryButton: z.object({
    text: z.string().min(1, 'Button text is required'),
    url: z.string().min(1, 'Button URL is required'),
    variant: z.enum(['primary', 'secondary', 'outline', 'ghost'])
  }),
  isActive: z.boolean(),
  displayOrder: z.number()
});

type HeroFormData = z.infer<typeof heroSchema>;

interface HeroFormProps {
  hero?: HeroSection | null;
  onSave: (data: HeroFormData) => Promise<void>;
  onCancel: () => void;
}

export function HeroForm({ hero, onSave, onCancel }: HeroFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema),
    defaultValues: hero || {
      title: '',
      subtitle: '',
      backgroundImages: [],
      primaryButton: { text: '', url: '', variant: 'primary' },
      secondaryButton: { text: '', url: '', variant: 'outline' },
      isActive: true,
      displayOrder: 0
    }
  });

  const backgroundImages = watch('backgroundImages');

  const onSubmit = async (data: HeroFormData) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error('Failed to save hero:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{hero ? 'Edit Hero Section' : 'Create Hero Section'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter hero title"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle *</Label>
                <Textarea
                  id="subtitle"
                  {...register('subtitle')}
                  placeholder="Enter hero subtitle"
                  rows={3}
                />
                {errors.subtitle && (
                  <p className="text-sm text-red-600 mt-1">{errors.subtitle.message}</p>
                )}
              </div>
            </div>

            {/* Background Images */}
            <div>
              <Label>Background Images *</Label>
              <ImageUpload
                images={backgroundImages}
                onChange={(images) => setValue('backgroundImages', images)}
                maxImages={5}
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
              />
              {errors.backgroundImages && (
                <p className="text-sm text-red-600 mt-1">{errors.backgroundImages.message}</p>
              )}
            </div>

            {/* Primary Button */}
            <Card className="p-4">
              <CardTitle className="text-lg mb-4">Primary Button</CardTitle>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="primaryText">Button Text *</Label>
                  <Input
                    id="primaryText"
                    {...register('primaryButton.text')}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="primaryUrl">Button URL *</Label>
                  <Input
                    id="primaryUrl"
                    {...register('primaryButton.url')}
                    placeholder="/catalog"
                  />
                </div>
                <div>
                  <Label>Button Style</Label>
                  <select
                    {...register('primaryButton.variant')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Secondary Button */}
            <Card className="p-4">
              <CardTitle className="text-lg mb-4">Secondary Button</CardTitle>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="secondaryText">Button Text *</Label>
                  <Input
                    id="secondaryText"
                    {...register('secondaryButton.text')}
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryUrl">Button URL *</Label>
                  <Input
                    id="secondaryUrl"
                    {...register('secondaryButton.url')}
                    placeholder="/about"
                  />
                </div>
                <div>
                  <Label>Button Style</Label>
                  <select
                    {...register('secondaryButton.variant')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-gray-600">Show this hero section on the homepage</p>
              </div>
              <Switch
                id="isActive"
                {...register('isActive')}
              />
            </div>

            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                {...register('displayOrder', { valueAsNumber: true })}
                placeholder="0"
              />
              <p className="text-sm text-gray-600 mt-1">Lower numbers appear first</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : hero ? 'Update Hero' : 'Create Hero'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### **4. Hero List Component**

```typescript
// src/components/cms/HeroList.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface HeroListProps {
  heroes: HeroSection[];
  onEdit: (hero: HeroSection) => void;
  onDelete: (id: string) => void;
}

export function HeroList({ heroes, onEdit, onDelete }: HeroListProps) {
  if (heroes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hero sections found.</p>
        <Button className="mt-4" onClick={() => onEdit(null as any)}>
          Create your first hero section
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {heroes.map((hero) => (
        <Card key={hero.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Preview */}
              <div className="relative w-48 h-32 bg-gray-100">
                {hero.backgroundImages[0] ? (
                  <Image
                    src={hero.backgroundImages[0]}
                    alt={hero.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{hero.title}</h3>
                    <p className="text-gray-600 text-sm">{hero.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={hero.isActive ? 'default' : 'secondary'}>
                      {hero.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-500">#{hero.displayOrder}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(hero)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(hero.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 📋 Advanced Management Interfaces

### **1. FAQ Management**

```typescript
// src/pages/cms/faq/index.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FAQForm } from '@/components/cms/FAQForm';
import { FAQList } from '@/components/cms/FAQList';
import { FAQCategoryForm } from '@/components/cms/FAQCategoryForm';
import { FAQCategoryList } from '@/components/cms/FAQCategoryList';
import { useFAQs, useFAQCategories } from '@/hooks/useCMS';

export default function FAQManagement() {
  const [activeTab, setActiveTab] = useState('categories');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { categories, loading: categoriesLoading } = useFAQCategories();
  const { faqs, loading: faqsLoading } = useFAQs();

  const handleCreateCategory = () => {
    setEditingItem(null);
    setShowForm(true);
    setActiveTab('categories');
  };

  const handleCreateFAQ = () => {
    setEditingItem(null);
    setShowForm(true);
    setActiveTab('faqs');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-gray-600">Manage FAQ categories and questions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateCategory}>Create Category</Button>
          <Button onClick={handleCreateFAQ}>Create FAQ</Button>
        </div>
      </div>

      {/* FAQ Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <FAQCategoryList
                categories={categories}
                onEdit={(category) => {
                  setEditingItem(category);
                  setShowForm(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <FAQList
                faqs={faqs}
                categories={categories}
                onEdit={(faq) => {
                  setEditingItem(faq);
                  setShowForm(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <FAQForm
          item={editingItem}
          categories={categories}
          onSave={async (data) => {
            // Handle save logic
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
```

### **2. Contact Information Management**

```typescript
// src/pages/cms/contact/index.tsx
import { ContactInfoForm } from '@/components/cms/ContactInfoForm';
import { ContactInfoList } from '@/components/cms/ContactInfoList';
import { BusinessHoursForm } from '@/components/cms/BusinessHoursForm';
import { BusinessHoursList } from '@/components/cms/BusinessHoursList';
import { SocialLinksForm } from '@/components/cms/SocialLinksForm';
import { SocialLinksList } from '@/components/cms/SocialLinksList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContactManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <p className="text-gray-600">Manage contact information, business hours, and social links</p>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Contact Info</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ContactInfoInterface />
        </TabsContent>

        <TabsContent value="hours">
          <BusinessHoursInterface />
        </TabsContent>

        <TabsContent value="social">
          <SocialLinksInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 🎨 Reusable Components

### **1. Data Table Component**

```typescript
// src/components/cms/DataTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  loading?: boolean;
}

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

export function DataTable<T extends { id: string; isActive?: boolean }>({
  data,
  columns,
  onEdit,
  onDelete,
  onToggleStatus,
  loading
}: DataTableProps<T>) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>{column.label}</TableHead>
            ))}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key] || '')
                  }
                </TableCell>
              ))}
              <TableCell>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onToggleStatus && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleStatus(item.id)}
                    >
                      {item.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### **2. Rich Text Editor**

```typescript
// src/components/cms/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-2 flex gap-1 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-100' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-100' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-100' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-100' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-100' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="p-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[200px] focus:outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
```

### **3. Image Upload Component**

```typescript
// src/components/cms/ImageUpload.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} not supported`);
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File size must be less than ${maxSize}MB`);
        }

        // Upload file
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/cms/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error('Upload failed');
        }

        return result.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some files');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop images or click to browse
        </p>
        <p className="text-xs text-gray-500">
          Supports: JPG, PNG, WebP (max {maxSize}MB each)
        </p>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </Button>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={image}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-sm text-gray-500">
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  );
}
```

## 📊 Dashboard Analytics

### **CMS Stats Component**

```typescript
// src/components/cms/CMSStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCMSStats } from '@/hooks/useCMS';

export function CMSStats() {
  const { stats, loading } = useCMSStats();

  if (loading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          <Badge variant="secondary">{stats.totalContent}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalContent}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeContent} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hero Sections</CardTitle>
          <Badge variant="secondary">{stats.heroSections}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.heroSections}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeHeroes} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FAQ Items</CardTitle>
          <Badge variant="secondary">{stats.faqItems}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.faqItems}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.faqCategories} categories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
          <Badge variant="secondary">{stats.blogPosts}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.blogPosts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.publishedPosts} published
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🔧 Custom Hooks for CMS

```typescript
// src/hooks/useCMS.ts
import { useState, useEffect } from 'react';

// Hero sections hook
export function useHeroes() {
  const [heroes, setHeroes] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cms/hero');
      const data = await response.json();
      setHeroes(data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch heroes');
    } finally {
      setLoading(false);
    }
  };

  const createHero = async (data: CreateHeroForm) => {
    const response = await fetch('/api/cms/hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create hero');
    await fetchHeroes(); // Refresh list
  };

  const updateHero = async (id: string, data: Partial<HeroForm>) => {
    const response = await fetch(`/api/cms/hero/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update hero');
    await fetchHeroes(); // Refresh list
  };

  const deleteHero = async (id: string) => {
    const response = await fetch(`/api/cms/hero/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete hero');
    await fetchHeroes(); // Refresh list
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  return {
    heroes,
    loading,
    error,
    createHero,
    updateHero,
    deleteHero,
    refetch: fetchHeroes
  };
}

// Similar hooks for other CMS content...
```

## 🎯 Implementation Checklist

### **Phase 1: Core Components**
- [ ] CMS Dashboard with stats overview
- [ ] Hero Section management interface
- [ ] Feature Section management
- [ ] Team member management
- [ ] Basic CRUD operations

### **Phase 2: Content Management**
- [ ] FAQ management with categories
- [ ] About page section editors
- [ ] Contact information management
- [ ] Business hours configuration
- [ ] Social links management

### **Phase 3: Advanced Features**
- [ ] Blog post editor with rich text
- [ ] Policy page editors
- [ ] Site settings management
- [ ] SEO settings interface
- [ ] Media library management

### **Phase 4: User Experience**
- [ ] Search and filter functionality
- [ ] Bulk operations (publish/unpublish)
- [ ] Content preview modes
- [ ] Version history
- [ ] Content templates

Hope you read everythin' ^^ -mika