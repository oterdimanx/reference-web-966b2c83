
import { supabase } from '@/integrations/supabase/client';

export const insertSampleCategories = async () => {
  const categories = [
    {
      name: 'Technology',
      description: 'Websites related to technology, software, and digital services'
    },
    {
      name: 'E-commerce',
      description: 'Online stores and retail websites'
    },
    {
      name: 'Education',
      description: 'Educational institutions and learning platforms'
    },
    {
      name: 'Healthcare',
      description: 'Healthcare providers and medical services'
    },
    {
      name: 'Business Services',
      description: 'Professional and business service providers'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' })
      .select();

    if (error) {
      console.error('Error inserting sample categories:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in insertSampleCategories:', error);
    return null;
  }
};

export const insertSampleDirectoryWebsites = async () => {
  // First get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .limit(5);

  if (!categories || categories.length === 0) {
    console.log('No categories found, creating sample categories first');
    await insertSampleCategories();
    
    // Retry getting categories
    const { data: newCategories } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (!newCategories) return null;
  }

  const sampleWebsites = [
    {
      domain: 'example-tech.com',
      title: 'TechCorp Solutions',
      description: 'Leading provider of innovative technology solutions for businesses worldwide.',
      category_id: categories?.[0]?.id,
      avg_position: 15,
      keyword_count: 25,
      position_change: 3,
      top_keyword: 'technology solutions',
      top_keyword_position: 8,
      contact_name: 'John Smith',
      contact_email: 'contact@example-tech.com',
      phone_number: '123456789',
      phone_prefix: '+1',
      is_active: true
    },
    {
      domain: 'online-store.com',
      title: 'Premium Online Store',
      description: 'Your one-stop shop for premium products and exceptional customer service.',
      category_id: categories?.[1]?.id,
      avg_position: 8,
      keyword_count: 45,
      position_change: -2,
      top_keyword: 'online shopping',
      top_keyword_position: 5,
      contact_name: 'Sarah Johnson',
      contact_email: 'info@online-store.com',
      phone_number: '987654321',
      phone_prefix: '+1',
      is_active: true
    },
    {
      domain: 'learning-platform.edu',
      title: 'EduLearn Platform',
      description: 'Advanced online learning platform with courses for all skill levels.',
      category_id: categories?.[2]?.id,
      avg_position: 12,
      keyword_count: 35,
      position_change: 5,
      top_keyword: 'online courses',
      top_keyword_position: 7,
      contact_name: 'Dr. Michael Brown',
      contact_email: 'support@learning-platform.edu',
      phone_number: '555123456',
      phone_prefix: '+1',
      is_active: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('directory_websites')
      .upsert(sampleWebsites, { onConflict: 'domain' })
      .select();

    if (error) {
      console.error('Error inserting sample directory websites:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in insertSampleDirectoryWebsites:', error);
    return null;
  }
};
