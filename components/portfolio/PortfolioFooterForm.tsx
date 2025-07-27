import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Link, ExternalLink } from 'lucide-react';
import { Portfolio } from '@/types/portfolio';

interface PortfolioFooterFormProps {
  portfolio: Portfolio;
  onUpdate: (updates: Partial<Portfolio>) => void;
  theme: any;
}

interface FooterLink {
  title: string;
  url: string;
}

const PortfolioFooterForm: React.FC<PortfolioFooterFormProps> = ({
  portfolio,
  onUpdate,
  theme
}) => {
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>(
    portfolio.footer_links_json ? JSON.parse(portfolio.footer_links_json) : []
  );

  // Auto-populate social links from portfolio data and enable default features
  useEffect(() => {
    if (footerLinks.length === 0) {
      const autoLinks: FooterLink[] = [];
      
      // Add social links from portfolio if they exist
      if (portfolio.linkedin_url) {
        autoLinks.push({ title: 'LinkedIn', url: portfolio.linkedin_url });
      }
      if (portfolio.github_url) {
        autoLinks.push({ title: 'GitHub', url: portfolio.github_url });
      }
      if (portfolio.twitter_url) {
        autoLinks.push({ title: 'Twitter', url: portfolio.twitter_url });
      }
      if (portfolio.instagram_url) {
        autoLinks.push({ title: 'Instagram', url: portfolio.instagram_url });
      }
      if (portfolio.youtube_url) {
        autoLinks.push({ title: 'YouTube', url: portfolio.youtube_url });
      }
      
      // Add common portfolio links if they don't exist
      if (!autoLinks.find(link => link.title === 'Portfolio')) {
        autoLinks.push({ title: 'Portfolio', url: '#' });
      }
      if (!autoLinks.find(link => link.title === 'Resume')) {
        autoLinks.push({ title: 'Resume', url: '#resume' });
      }
      if (!autoLinks.find(link => link.title === 'Contact')) {
        autoLinks.push({ title: 'Contact', url: '#contact' });
      }

      if (autoLinks.length > 0) {
        setFooterLinks(autoLinks);
        onUpdate({ 
          footer_links_json: JSON.stringify(autoLinks),
          // Enable useful footer features by default
          footer_show_links: true,
          footer_show_social_links: true,
          footer_show_about_summary: true
        });
      }
    }
  }, [portfolio, footerLinks.length, onUpdate]);

  const handleFooterLinksChange = (links: FooterLink[]) => {
    setFooterLinks(links);
    onUpdate({ footer_links_json: JSON.stringify(links) });
  };

  const addFooterLink = () => {
    const newLinks = [...footerLinks, { title: '', url: '' }];
    handleFooterLinksChange(newLinks);
  };

  const removeFooterLink = (index: number) => {
    const newLinks = footerLinks.filter((_, i) => i !== index);
    handleFooterLinksChange(newLinks);
  };

  const updateFooterLink = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...footerLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleFooterLinksChange(newLinks);
  };

  const addQuickLink = (title: string, url: string) => {
    const newLinks = [...footerLinks, { title, url }];
    handleFooterLinksChange(newLinks);
  };

  const commonLinks = [
    { title: 'Portfolio', url: '#' },
    { title: 'Resume', url: '#resume' },
    { title: 'About', url: '#about' },
    { title: 'Projects', url: '#key_projects' },
    { title: 'Contact', url: '#contact' },
    { title: 'Blog', url: '#blog' },
    { title: 'Services', url: '#services' },
    { title: 'Testimonials', url: '#testimonials' }
  ];

  return (
    <div className="space-y-6">
      {/* About Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className={`text-sm font-medium ${theme.colors.text}`}>
            Show About Summary
          </Label>
          <Switch
            isChecked={portfolio.footer_show_about_summary || false}
            onChange={(e) => onUpdate({ footer_show_about_summary: e.target.checked })}
          />
        </div>
        {portfolio.footer_show_about_summary && (
          <div className="space-y-2">
            <Label className={`text-sm font-medium ${theme.colors.text}`}>
              About Summary
            </Label>
            <Textarea
              value={portfolio.footer_about_summary || ''}
              onChange={(e) => onUpdate({ footer_about_summary: e.target.value })}
              placeholder="Enter a brief summary about yourself or your work..."
              className={`min-h-[100px] ${theme.colors.textBox} ${theme.colors.textBoxBorder}`}
            />
            {!portfolio.footer_about_summary && (
              <p className={`text-xs ${theme.colors.text} opacity-70`}>
                💡 Tip: You can use a shortened version of your main about text here
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className={`text-sm font-medium ${theme.colors.text}`}>
            Show Quick Links
          </Label>
          <Switch
            isChecked={portfolio.footer_show_links || false}
            onChange={(e) => onUpdate({ footer_show_links: e.target.checked })}
          />
        </div>
        {portfolio.footer_show_links && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className={`text-sm font-medium ${theme.colors.text}`}>
                Quick Links
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Auto-populate with common portfolio links
                    const newLinks = [...footerLinks];
                    commonLinks.forEach(link => {
                      if (!newLinks.find(existing => existing.title === link.title)) {
                        newLinks.push(link);
                      }
                    });
                    handleFooterLinksChange(newLinks);
                  }}
                  className="text-xs"
                >
                  <Link className="h-3 w-3 mr-1" />
                  Add Common Links
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {footerLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link.title}
                    onChange={(e) => updateFooterLink(index, 'title', e.target.value)}
                    placeholder="Link title"
                    className={`flex-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder}`}
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                    placeholder="https://example.com or #section"
                    className={`flex-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFooterLink(index)}
                    className="px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFooterLink}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Link
              </Button>
            </div>

            {/* Quick Add Buttons */}
            <div className="p-4 bg-gray-100/10 rounded-lg border border-gray-500/20">
              <p className={`text-xs ${theme.colors.text} opacity-70 mb-3`}>
                Quick Add Common Links:
              </p>
              <div className="flex flex-wrap gap-2">
                {commonLinks.map((link) => (
                  <Button
                    key={link.title}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuickLink(link.title, link.url)}
                    disabled={footerLinks.some(existing => existing.title === link.title)}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {link.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className={`text-sm font-medium ${theme.colors.text}`}>
            Show Social Links
          </Label>
          <Switch
            isChecked={portfolio.footer_show_social_links || false}
            onChange={(e) => onUpdate({ footer_show_social_links: e.target.checked })}
          />
        </div>
        {portfolio.footer_show_social_links && (
          <div className="p-4 rounded-lg bg-gray-100/10 border border-gray-500/20">
            <p className={`text-sm ${theme.colors.text} opacity-80 mb-2`}>
              Social links will be automatically displayed from your Contact section settings.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {portfolio.linkedin_url && (
                <div className={`${theme.colors.text} opacity-70`}>✓ LinkedIn</div>
              )}
              {portfolio.github_url && (
                <div className={`${theme.colors.text} opacity-70`}>✓ GitHub</div>
              )}
              {portfolio.twitter_url && (
                <div className={`${theme.colors.text} opacity-70`}>✓ Twitter</div>
              )}
              {portfolio.instagram_url && (
                <div className={`${theme.colors.text} opacity-70`}>✓ Instagram</div>
              )}
              {portfolio.youtube_url && (
                <div className={`${theme.colors.text} opacity-70`}>✓ YouTube</div>
              )}
              {!portfolio.linkedin_url && !portfolio.github_url && !portfolio.twitter_url && !portfolio.instagram_url && !portfolio.youtube_url && (
                <div className={`${theme.colors.text} opacity-50`}>No social links configured</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioFooterForm; 