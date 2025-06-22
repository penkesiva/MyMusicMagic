'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowLeft, Save, Eye, Upload, Trash2, Settings, Palette, Globe, User } from 'lucide-react';
import { Portfolio } from '@/types/portfolio';

const PortfolioSettingsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const toast = useToast();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const supabase = createClient();

  // Chakra UI color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchPortfolio = async () => {
    if (!id) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load portfolio settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/dashboard');
    } else if (data) {
      setPortfolio(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  const handleSave = async () => {
    if (!portfolio) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('user_portfolios')
      .update(portfolio)
      .eq('id', portfolio.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    setSaving(false);
  };

  const uploadHeroImage = async (file: File) => {
    if (!portfolio) return;
    
    setUploadingHero(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${portfolio.id}/hero-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('site-bg-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('site-bg-images')
        .getPublicUrl(fileName);

      setPortfolio(prev => ({ ...prev!, hero_image_url: publicUrl }));
      
      toast({
        title: 'Success',
        description: 'Hero image uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload hero image',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setUploadingHero(false);
  };

  const uploadProfilePhoto = async (file: File) => {
    if (!portfolio) return;
    
    setUploadingProfile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${portfolio.id}/profile-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(fileName);

      setPortfolio(prev => ({ ...prev!, profile_photo_url: publicUrl }));
      
      toast({
        title: 'Success',
        description: 'Profile photo uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload profile photo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setUploadingProfile(false);
  };

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Text fontSize="lg" color="gray.500">Loading portfolio settings...</Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!portfolio) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Portfolio not found!</AlertTitle>
            <AlertDescription>Unable to load portfolio settings.</AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <IconButton
                aria-label="Back to dashboard"
                icon={<ArrowLeft />}
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              />
              <Box>
                <Heading size="lg" color="purple.500">
                  Portfolio Settings
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  {portfolio.name} • /{portfolio.slug}
                </Text>
              </Box>
            </HStack>
            
            <HStack spacing={4}>
              <Button
                leftIcon={<Eye />}
                variant="outline"
                onClick={() => window.open(`/portfolio/${portfolio.slug}`, '_blank')}
              >
                Preview
              </Button>
              <Button
                leftIcon={<Save />}
                colorScheme="purple"
                onClick={handleSave}
                isLoading={saving}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </HStack>
          </HStack>

          {/* Settings Tabs */}
          <Tabs variant="enclosed" colorScheme="purple">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Settings size={16} />
                  <Text>General</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Palette size={16} />
                  <Text>Appearance</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Globe size={16} />
                  <Text>Social Links</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <User size={16} />
                  <Text>About</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* General Settings */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md" color="purple.500">Basic Information</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Portfolio Name</FormLabel>
                          <Input
                            value={portfolio.name || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, name: e.target.value }))}
                            placeholder="My Awesome Portfolio"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Subtitle</FormLabel>
                          <Input
                            value={portfolio.subtitle || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, subtitle: e.target.value }))}
                            placeholder="Professional Music Producer & Composer"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Website URL</FormLabel>
                          <Input
                            value={portfolio.website_url || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, website_url: e.target.value }))}
                            placeholder="https://yourwebsite.com"
                          />
                        </FormControl>

                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel>Published</FormLabel>
                            <Switch
                              isChecked={portfolio.is_published}
                              onChange={(e) => setPortfolio(prev => ({ ...prev!, is_published: e.target.checked }))}
                              colorScheme="green"
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Default Portfolio</FormLabel>
                            <Switch
                              isChecked={portfolio.is_default}
                              onChange={(e) => setPortfolio(prev => ({ ...prev!, is_default: e.target.checked }))}
                              colorScheme="purple"
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Appearance Settings */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md" color="purple.500">Theme & Images</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={6} align="stretch">
                        <FormControl>
                          <FormLabel>Theme</FormLabel>
                          <Select
                            value={portfolio.theme_name || 'default'}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, theme_name: e.target.value }))}
                          >
                            <option value="default">Default Dark</option>
                            <option value="light">Light</option>
                            <option value="purple">Purple</option>
                            <option value="pink">Pink</option>
                          </Select>
                        </FormControl>

                        <Divider />

                        <Box>
                          <FormLabel>Hero Image</FormLabel>
                          <VStack spacing={3} align="stretch">
                            {portfolio.hero_image_url && (
                              <Box
                                bgImage={`url(${portfolio.hero_image_url})`}
                                bgSize="cover"
                                bgPosition="center"
                                h="200px"
                                borderRadius="md"
                                border="2px dashed"
                                borderColor="gray.300"
                              />
                            )}
                            <HStack>
                              <Button
                                leftIcon={<Upload />}
                                variant="outline"
                                onClick={() => document.getElementById('hero-upload')?.click()}
                                isLoading={uploadingHero}
                              >
                                Upload Hero Image
                              </Button>
                              {portfolio.hero_image_url && (
                                <IconButton
                                  aria-label="Remove hero image"
                                  icon={<Trash2 />}
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => setPortfolio(prev => ({ ...prev!, hero_image_url: null }))}
                                />
                              )}
                            </HStack>
                            <input
                              id="hero-upload"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadHeroImage(file);
                              }}
                            />
                          </VStack>
                        </Box>

                        <Divider />

                        <Box>
                          <FormLabel>Profile Photo</FormLabel>
                          <VStack spacing={3} align="stretch">
                            {portfolio.profile_photo_url && (
                              <Box
                                bgImage={`url(${portfolio.profile_photo_url})`}
                                bgSize="cover"
                                bgPosition="center"
                                w="100px"
                                h="100px"
                                borderRadius="full"
                                border="2px dashed"
                                borderColor="gray.300"
                                alignSelf="center"
                              />
                            )}
                            <HStack justify="center">
                              <Button
                                leftIcon={<Upload />}
                                variant="outline"
                                onClick={() => document.getElementById('profile-upload')?.click()}
                                isLoading={uploadingProfile}
                              >
                                Upload Profile Photo
                              </Button>
                              {portfolio.profile_photo_url && (
                                <IconButton
                                  aria-label="Remove profile photo"
                                  icon={<Trash2 />}
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => setPortfolio(prev => ({ ...prev!, profile_photo_url: null }))}
                                />
                              )}
                            </HStack>
                            <input
                              id="profile-upload"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadProfilePhoto(file);
                              }}
                            />
                          </VStack>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Social Links */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md" color="purple.500">Social Media Links</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Instagram</FormLabel>
                          <Input
                            value={portfolio.instagram_url || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, instagram_url: e.target.value }))}
                            placeholder="https://instagram.com/yourusername"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Twitter</FormLabel>
                          <Input
                            value={portfolio.twitter_url || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, twitter_url: e.target.value }))}
                            placeholder="https://twitter.com/yourusername"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>YouTube</FormLabel>
                          <Input
                            value={portfolio.youtube_url || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, youtube_url: e.target.value }))}
                            placeholder="https://youtube.com/@yourchannel"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>LinkedIn</FormLabel>
                          <Input
                            value={portfolio.linkedin_url || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, linkedin_url: e.target.value }))}
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* About Section */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md" color="purple.500">About Section</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>About Title</FormLabel>
                          <Input
                            value={portfolio.about_title || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, about_title: e.target.value }))}
                            placeholder="About Me"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>About Text</FormLabel>
                          <Textarea
                            value={portfolio.about_text || ''}
                            onChange={(e) => setPortfolio(prev => ({ ...prev!, about_text: e.target.value }))}
                            placeholder="Tell your story..."
                            rows={6}
                          />
                          <FormHelperText>
                            Share your musical journey, experience, and what makes you unique.
                          </FormHelperText>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
};

export default PortfolioSettingsPage; 