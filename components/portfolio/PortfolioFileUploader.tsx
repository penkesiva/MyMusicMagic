"use client";

import { createClient } from "@/lib/supabase/client";
import { Portfolio } from "@/types/portfolio";

export class PortfolioFileUploader {
  private supabase = createClient();

  async uploadHeroImage(file: File, portfolioId: string): Promise<string> {
    console.log('Starting hero image upload...', { file: file.name, size: file.size });
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${portfolioId}/hero-${Date.now()}.${fileExt}`;
    
    console.log('Uploading to path:', fileName);
    
    // Try site-bg-images first, fallback to gallery-images
    let bucketName = 'site-bg-images';
    
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.log('site-bg-images failed, trying gallery-images...', error);
      
      // Fallback to gallery-images bucket
      bucketName = 'gallery-images';
      const fallbackResult = await this.supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (fallbackResult.error) {
        console.error('Both buckets failed:', fallbackResult.error);
        throw fallbackResult.error;
      }
      
      console.log('Upload successful to gallery-images, getting public URL...');
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    }
    
    console.log('Upload successful to site-bg-images, getting public URL...');
    
    const { data: { publicUrl } } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    console.log('Public URL generated:', publicUrl);
    return publicUrl;
  }

  async uploadProfilePhoto(file: File, portfolioId: string): Promise<string> {
    console.log('Starting profile photo upload...', { file: file.name, size: file.size });
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${portfolioId}/profile-${Date.now()}.${fileExt}`;
    
    console.log('Uploading to path:', fileName);
    
    // Try site-bg-images first, fallback to gallery-images
    let bucketName = 'site-bg-images';
    
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.log('site-bg-images failed, trying gallery-images...', error);
      
      // Fallback to gallery-images bucket
      bucketName = 'gallery-images';
      const fallbackResult = await this.supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (fallbackResult.error) {
        console.error('Both buckets failed:', fallbackResult.error);
        throw fallbackResult.error;
      }
      
      console.log('Upload successful to gallery-images, getting public URL...');
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    }
    
    console.log('Upload successful to site-bg-images, getting public URL...');
    
    const { data: { publicUrl } } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    console.log('Public URL generated:', publicUrl);
    return publicUrl;
  }

  async uploadResume(file: File, portfolioId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${portfolioId}/resume-${Date.now()}.${fileExt}`;
    
    const { data, error } = await this.supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true 
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = this.supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }
} 