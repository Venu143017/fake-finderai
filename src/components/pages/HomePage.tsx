import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMember } from '@/integrations';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  Menu,
  X,
  Eye,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

interface AnalysisResult {
  credibilityScore: number;
  status: 'authentic' | 'suspicious' | 'fake';
  details: {
    sourceReliability: number;
    contentConsistency: number;
    factualAccuracy: number;
    biasDetection: number;
  };
  summary: string;
  recommendations: string[];
}

interface Translation {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translation = {
  en: {
    title: 'FakeFinder.ai',
    tagline: 'Uncover the Truth',
    subtitle: 'Advanced AI-powered fake news detection across multiple languages',
    cta: 'Start Analysis',
    nav_home: 'Home',
    nav_about: 'About',
    nav_features: 'Features',
    nav_contact: 'Contact',
    login: 'Login',
    signup: 'Sign Up',
    guest_mode: 'Continue as Guest',
    submit_text: 'Submit Text',
    submit_image: 'Submit Image',
    submit_document: 'Submit Document',
    submit_video: 'Submit Video (Coming Soon)',
    analyze_button: 'Analyze Content',
    credibility_score: 'Credibility Score',
    analysis_report: 'Analysis Report',
    source_reliability: 'Source Reliability',
    content_consistency: 'Content Consistency',
    factual_accuracy: 'Factual Accuracy',
    bias_detection: 'Bias Detection',
    recommendations: 'Recommendations',
    footer_text: '© 2024 FakeFinder.ai. All rights reserved.',
    authentic: 'Authentic',
    suspicious: 'Suspicious',
    fake: 'Fake News',
    placeholder_text: 'Enter text content to analyze...',
    placeholder_url: 'Enter image URL or upload file...',
    placeholder_doc: 'Upload document (PDF, DOC, TXT)...',
    placeholder_video: 'Video analysis coming soon...',
    email_placeholder: 'Enter your email',
    password_placeholder: 'Enter your password',
    name_placeholder: 'Enter your full name'
  },
  es: {
    title: 'FakeFinder.ai',
    tagline: 'Descubre la Verdad',
    subtitle: 'Detección avanzada de noticias falsas con IA en múltiples idiomas',
    cta: 'Iniciar Análisis',
    nav_home: 'Inicio',
    nav_about: 'Acerca de',
    nav_features: 'Características',
    nav_contact: 'Contacto',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    guest_mode: 'Continuar como Invitado',
    submit_text: 'Enviar Texto',
    submit_image: 'Enviar Imagen',
    submit_document: 'Enviar Documento',
    submit_video: 'Enviar Video (Próximamente)',
    analyze_button: 'Analizar Contenido',
    credibility_score: 'Puntuación de Credibilidad',
    analysis_report: 'Reporte de Análisis',
    source_reliability: 'Confiabilidad de la Fuente',
    content_consistency: 'Consistencia del Contenido',
    factual_accuracy: 'Precisión Factual',
    bias_detection: 'Detección de Sesgo',
    recommendations: 'Recomendaciones',
    footer_text: '© 2024 FakeFinder.ai. Todos los derechos reservados.',
    authentic: 'Auténtico',
    suspicious: 'Sospechoso',
    fake: 'Noticia Falsa',
    placeholder_text: 'Ingrese el texto a analizar...',
    placeholder_url: 'Ingrese URL de imagen o suba archivo...',
    placeholder_doc: 'Suba documento (PDF, DOC, TXT)...',
    placeholder_video: 'Análisis de video próximamente...',
    email_placeholder: 'Ingrese su email',
    password_placeholder: 'Ingrese su contraseña',
    name_placeholder: 'Ingrese su nombre completo'
  },
  fr: {
    title: 'FakeFinder.ai',
    tagline: 'Découvrez la Vérité',
    subtitle: 'Détection avancée de fausses nouvelles par IA en plusieurs langues',
    cta: 'Commencer l\'Analyse',
    nav_home: 'Accueil',
    nav_about: 'À propos',
    nav_features: 'Fonctionnalités',
    nav_contact: 'Contact',
    login: 'Se connecter',
    signup: 'S\'inscrire',
    guest_mode: 'Continuer en tant qu\'invité',
    submit_text: 'Soumettre du Texte',
    submit_image: 'Soumettre une Image',
    submit_document: 'Soumettre un Document',
    submit_video: 'Soumettre une Vidéo (Bientôt)',
    analyze_button: 'Analyser le Contenu',
    credibility_score: 'Score de Crédibilité',
    analysis_report: 'Rapport d\'Analyse',
    source_reliability: 'Fiabilité de la Source',
    content_consistency: 'Cohérence du Contenu',
    factual_accuracy: 'Précision Factuelle',
    bias_detection: 'Détection de Biais',
    recommendations: 'Recommandations',
    footer_text: '© 2024 FakeFinder.ai. Tous droits réservés.',
    authentic: 'Authentique',
    suspicious: 'Suspect',
    fake: 'Fausse Nouvelle',
    placeholder_text: 'Entrez le texte à analyser...',
    placeholder_url: 'Entrez l\'URL de l\'image ou téléchargez un fichier...',
    placeholder_doc: 'Téléchargez un document (PDF, DOC, TXT)...',
    placeholder_video: 'Analyse vidéo bientôt disponible...',
    email_placeholder: 'Entrez votre email',
    password_placeholder: 'Entrez votre mot de passe',
    name_placeholder: 'Entrez votre nom complet'
  }
};

// Animated Data Stream Component
const AnimatedDataStream: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const lines: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
    }> = [];

    // Create initial lines
    for (let i = 0; i < 50; i++) {
      lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lines.forEach((line, index) => {
        ctx.strokeStyle = `rgba(15, 59, 95, ${line.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.length, line.y);
        ctx.stroke();

        line.x += line.speed;
        if (line.x > canvas.width + line.length) {
          line.x = -line.length;
          line.y = Math.random() * canvas.height;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
};

export default function HomePage() {
  const { member, isAuthenticated, actions } = useMember();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    imageUrl: '',
    document: null as File | null,
    email: '',
    password: '',
    name: ''
  });

  const t = translations[currentLanguage];

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis result
    const mockResult: AnalysisResult = {
      credibilityScore: Math.floor(Math.random() * 100),
      status: Math.random() > 0.6 ? 'authentic' : Math.random() > 0.3 ? 'suspicious' : 'fake',
      details: {
        sourceReliability: Math.floor(Math.random() * 100),
        contentConsistency: Math.floor(Math.random() * 100),
        factualAccuracy: Math.floor(Math.random() * 100),
        biasDetection: Math.floor(Math.random() * 100)
      },
      summary: 'Based on our comprehensive analysis, this content shows several indicators that require attention.',
      recommendations: [
        'Cross-reference with multiple reliable sources',
        'Check the publication date and context',
        'Verify author credentials and expertise',
        'Look for supporting evidence and citations'
      ]
    };

    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authentic': return 'text-green-400';
      case 'suspicious': return 'text-yellow-400';
      case 'fake': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authentic': return <CheckCircle className="w-5 h-5" />;
      case 'suspicious': return <AlertTriangle className="w-5 h-5" />;
      case 'fake': return <Shield className="w-5 h-5" />;
      default: return <Eye className="w-5 h-5" />;
    }
  };

  const handleAuth = async (mode: 'login' | 'signup' | 'guest') => {
    if (mode === 'guest') {
      setIsGuestMode(true);
      setIsAuthModalOpen(false);
      return;
    }

    if (mode === 'login') {
      await actions.login();
    } else {
      // For signup, we'll redirect to login since Wix handles registration
      await actions.login();
    }
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[120rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="w-8 h-8 text-accent" />
              <span className="text-xl font-heading font-bold">{t.title}</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="hover:text-accent transition-colors">{t.nav_home}</a>
              <a href="#about" className="hover:text-accent transition-colors">{t.nav_about}</a>
              <a href="#features" className="hover:text-accent transition-colors">{t.nav_features}</a>
              <a href="#contact" className="hover:text-accent transition-colors">{t.nav_contact}</a>
            </div>

            {/* Language Selector & Auth */}
            <div className="flex items-center space-x-4">
              <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                <SelectTrigger className="w-20 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="es">ES</SelectItem>
                  <SelectItem value="fr">FR</SelectItem>
                </SelectContent>
              </Select>

              {!isAuthenticated && !isGuestMode ? (
                <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                      {t.login}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background/95 backdrop-blur-md border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        {authMode === 'login' ? t.login : t.signup}
                      </DialogTitle>
                    </DialogHeader>
                    <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'signup')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">{t.login}</TabsTrigger>
                        <TabsTrigger value="signup">{t.signup}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login" className="space-y-4">
                        <div>
                          <Label htmlFor="email">{t.email_placeholder}</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t.email_placeholder}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">{t.password_placeholder}</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder={t.password_placeholder}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <Button 
                          onClick={() => handleAuth('login')} 
                          className="w-full bg-accent hover:bg-accent/80"
                        >
                          {t.login}
                        </Button>
                      </TabsContent>
                      <TabsContent value="signup" className="space-y-4">
                        <div>
                          <Label htmlFor="name">{t.name_placeholder}</Label>
                          <Input
                            id="name"
                            placeholder={t.name_placeholder}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="signup-email">{t.email_placeholder}</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder={t.email_placeholder}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="signup-password">{t.password_placeholder}</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder={t.password_placeholder}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <Button 
                          onClick={() => handleAuth('signup')} 
                          className="w-full bg-accent hover:bg-accent/80"
                        >
                          {t.signup}
                        </Button>
                      </TabsContent>
                    </Tabs>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleAuth('guest')}
                      className="w-full text-gray-400 hover:text-white"
                    >
                      {t.guest_mode}
                    </Button>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex items-center space-x-2">
                  {isAuthenticated && member?.profile?.nickname && (
                    <span className="text-sm">Welcome, {member.profile.nickname}</span>
                  )}
                  {isGuestMode && <Badge variant="outline">Guest</Badge>}
                  {(isAuthenticated || isGuestMode) && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (isAuthenticated) {
                          actions.logout();
                        } else {
                          setIsGuestMode(false);
                        }
                      }}
                      className="text-sm"
                    >
                      Logout
                    </Button>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/10"
              >
                <div className="flex flex-col space-y-2">
                  <a href="#home" className="py-2 hover:text-accent transition-colors">{t.nav_home}</a>
                  <a href="#about" className="py-2 hover:text-accent transition-colors">{t.nav_about}</a>
                  <a href="#features" className="py-2 hover:text-accent transition-colors">{t.nav_features}</a>
                  <a href="#contact" className="py-2 hover:text-accent transition-colors">{t.nav_contact}</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen overflow-hidden flex items-center justify-center">
        <AnimatedDataStream />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60" />
        
        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-7xl md:text-8xl font-heading font-black text-white mb-6 leading-none">
            {t.tagline}
          </h1>
          <p className="text-xl md:text-2xl text-secondary/80 mb-8 font-paragraph">
            {t.subtitle}
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/80 text-white px-8 py-4 text-lg font-semibold"
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t.cta}
          </Button>
        </motion.div>
      </section>

      {/* Main Dashboard */}
      <section id="dashboard" className="py-20 px-6">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-heading font-bold mb-4">Analysis Dashboard</h2>
            <p className="text-lg text-secondary/70 font-paragraph">
              Submit your content for comprehensive fake news analysis
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Submission Interface */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-md p-8">
                <h3 className="text-2xl font-heading font-semibold mb-6">Submit Content</h3>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="document" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Doc
                    </TabsTrigger>
                    <TabsTrigger value="video" disabled className="flex items-center gap-2 opacity-50">
                      <Video className="w-4 h-4" />
                      Video
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder={t.placeholder_text}
                      value={formData.text}
                      onChange={(e) => setFormData({...formData, text: e.target.value})}
                      className="min-h-[200px] bg-white/5 border-white/10 resize-none"
                    />
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <Input
                      placeholder={t.placeholder_url}
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="bg-white/5 border-white/10"
                    />
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">Drag & drop an image or click to browse</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="document" className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">{t.placeholder_doc}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center opacity-50">
                      <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">{t.placeholder_video}</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || (!formData.text && !formData.imageUrl && !formData.document)}
                  className="w-full mt-6 bg-accent hover:bg-accent/80"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    t.analyze_button
                  )}
                </Button>
              </Card>
            </motion.div>

            {/* Analysis Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {analysisResult ? (
                <Card className="bg-white/5 border-white/10 backdrop-blur-md p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-heading font-semibold">{t.analysis_report}</h3>
                    <div className={`flex items-center gap-2 ${getStatusColor(analysisResult.status)}`}>
                      {getStatusIcon(analysisResult.status)}
                      <span className="font-semibold capitalize">
                        {t[analysisResult.status]}
                      </span>
                    </div>
                  </div>

                  {/* Credibility Score */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{t.credibility_score}</span>
                      <span className="text-2xl font-bold">{analysisResult.credibilityScore}%</span>
                    </div>
                    <Progress value={analysisResult.credibilityScore} className="h-3" />
                  </div>

                  {/* Detailed Metrics */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{t.source_reliability}</span>
                        <span className="text-sm">{analysisResult.details.sourceReliability}%</span>
                      </div>
                      <Progress value={analysisResult.details.sourceReliability} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{t.content_consistency}</span>
                        <span className="text-sm">{analysisResult.details.contentConsistency}%</span>
                      </div>
                      <Progress value={analysisResult.details.contentConsistency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{t.factual_accuracy}</span>
                        <span className="text-sm">{analysisResult.details.factualAccuracy}%</span>
                      </div>
                      <Progress value={analysisResult.details.factualAccuracy} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{t.bias_detection}</span>
                        <span className="text-sm">{analysisResult.details.biasDetection}%</span>
                      </div>
                      <Progress value={analysisResult.details.biasDetection} className="h-2" />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-secondary/70">{analysisResult.summary}</p>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold mb-2">{t.recommendations}</h4>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-secondary/70 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 backdrop-blur-md p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
                    <p>Submit your content to get started with AI-powered fact-checking</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-8 text-sm">
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-accent" />
                      <p className="font-semibold">Fast</p>
                      <p className="text-gray-400">Results in seconds</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-accent" />
                      <p className="font-semibold">Accurate</p>
                      <p className="text-gray-400">AI-powered analysis</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-accent" />
                      <p className="font-semibold">Trusted</p>
                      <p className="text-gray-400">By millions worldwide</p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/5">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold mb-4">Advanced Features</h2>
            <p className="text-lg text-secondary/70 font-paragraph max-w-2xl mx-auto">
              Cutting-edge AI technology to help you identify misinformation across multiple formats and languages
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Multi-Language Support',
                description: 'Analyze content in English, Spanish, French, and more languages with native AI understanding.'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Real-time Analysis',
                description: 'Get instant credibility scores and detailed reports powered by advanced machine learning.'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Source Verification',
                description: 'Cross-reference claims with trusted databases and fact-checking organizations.'
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: 'Bias Detection',
                description: 'Identify potential bias and emotional manipulation in news articles and social media posts.'
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Document Analysis',
                description: 'Upload PDFs, Word documents, and other file formats for comprehensive fact-checking.'
              },
              {
                icon: <ImageIcon className="w-8 h-8" />,
                title: 'Image Verification',
                description: 'Detect manipulated images, deepfakes, and verify the authenticity of visual content.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 h-full">
                  <div className="text-accent mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
                  <p className="text-secondary/70 font-paragraph">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6 border-t border-white/10">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-accent" />
                <span className="text-lg font-heading font-bold">{t.title}</span>
              </div>
              <p className="text-secondary/70 font-paragraph">
                Advanced AI-powered fake news detection for a more informed world.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-secondary/70">
                <li><a href="#features" className="hover:text-accent transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">API</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-secondary/70">
                <li><a href="#about" className="hover:text-accent transition-colors">About</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-accent transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-secondary/70">
                <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-secondary/70">
            <p className="font-paragraph">{t.footer_text}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}