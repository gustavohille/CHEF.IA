"use client";

import { useState } from "react";
import { ChefHat, Sparkles, Camera, UtensilsCrossed, Wine, Salad, Calendar, ShoppingCart, Users, Crown, Check, ArrowRight, Star, TrendingUp, Clock, Zap, Heart, DollarSign, Loader2, Upload, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Recipe {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
  difficulty: string;
  instructions: string[];
  tips: string[];
  image: string;
}

interface Drink {
  name: string;
  ingredients: string[];
  calories: number;
  type: string;
  instructions: string[];
  image: string;
}

interface CalorieAnalysis {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  foodItems: string[];
  image: string;
}

export default function ChefBotPage() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  
  // Generation states
  const [recipeInput, setRecipeInput] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [drinkInput, setDrinkInput] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [generatedDrink, setGeneratedDrink] = useState<Drink | null>(null);
  const [calorieAnalysis, setCalorieAnalysis] = useState<CalorieAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Popup states
  const [showRecipePopup, setShowRecipePopup] = useState(false);
  const [showDrinkPopup, setShowDrinkPopup] = useState(false);
  
  // Saved recipes
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [savedDrinks, setSavedDrinks] = useState<Drink[]>([]);
  
  // Quiz state
  const [quizData, setQuizData] = useState({
    level: "",
    restrictions: [] as string[],
    goal: "",
    preferences: [] as string[],
    drinks: [] as string[],
    maxTime: "",
    showCalories: true
  });

  const quizQuestions = [
    {
      question: "Qual é o seu nível na cozinha? 👨‍🍳",
      subtitle: "Seja sincero, ninguém está julgando!",
      options: [
        { value: "beginner", label: "Iniciante", emoji: "🥚", desc: "Mal sei fritar um ovo" },
        { value: "intermediate", label: "Intermediário", emoji: "🍳", desc: "Me viro bem" },
        { value: "advanced", label: "Avançado", emoji: "👨‍🍳", desc: "Sou quase um chef" }
      ],
      field: "level"
    },
    {
      question: "Alguma restrição alimentar? 🥗",
      subtitle: "Selecione todas que se aplicam",
      multiple: true,
      options: [
        { value: "vegan", label: "Vegano", emoji: "🌱" },
        { value: "vegetarian", label: "Vegetariano", emoji: "🥕" },
        { value: "lowcarb", label: "Low Carb", emoji: "🥩" },
        { value: "lactose", label: "Sem Lactose", emoji: "🚫🥛" },
        { value: "gluten", label: "Sem Glúten", emoji: "🌾" },
        { value: "halal", label: "Halal", emoji: "☪️" },
        { value: "kosher", label: "Kosher", emoji: "✡️" },
        { value: "none", label: "Nenhuma", emoji: "✅" }
      ],
      field: "restrictions"
    },
    {
      question: "Qual é o seu objetivo? 🎯",
      subtitle: "O que te motiva a cozinhar?",
      options: [
        { value: "lose", label: "Emagrecer", emoji: "📉", desc: "Quero perder uns quilinhos" },
        { value: "gain", label: "Ganhar Massa", emoji: "💪", desc: "Foco em hipertrofia" },
        { value: "cheap", label: "Economizar", emoji: "💰", desc: "Gastar menos com comida" },
        { value: "fast", label: "Rapidez", emoji: "⚡", desc: "Não tenho tempo a perder" },
        { value: "impress", label: "Impressionar", emoji: "✨", desc: "Quero surpreender alguém" },
        { value: "healthy", label: "Comer Saudável", emoji: "🥗", desc: "Saúde em primeiro lugar" }
      ],
      field: "goal"
    },
    {
      question: "O que você mais gosta? 🍽️",
      subtitle: "Selecione suas preferências",
      multiple: true,
      options: [
        { value: "pasta", label: "Massas", emoji: "🍝" },
        { value: "meat", label: "Carnes", emoji: "🥩" },
        { value: "sweets", label: "Doces", emoji: "🍰" },
        { value: "snacks", label: "Lanches", emoji: "🍔" },
        { value: "fit", label: "Fit", emoji: "🥗" },
        { value: "seafood", label: "Frutos do Mar", emoji: "🦐" },
        { value: "asian", label: "Asiática", emoji: "🍜" },
        { value: "drinks", label: "Bebidas", emoji: "🍹" }
      ],
      field: "preferences"
    },
    {
      question: "Que tipo de drink você curte? 🍹",
      subtitle: "Para aqueles momentos especiais",
      multiple: true,
      options: [
        { value: "strong", label: "Forte", emoji: "🥃" },
        { value: "smooth", label: "Suave", emoji: "🍸" },
        { value: "citric", label: "Cítrico", emoji: "🍋" },
        { value: "sweet", label: "Doce", emoji: "🍓" },
        { value: "noalcohol", label: "Sem Álcool", emoji: "🧃" }
      ],
      field: "drinks"
    },
    {
      question: "Quanto tempo você tem? ⏱️",
      subtitle: "Tempo máximo por receita",
      options: [
        { value: "15", label: "15 minutos", emoji: "⚡", desc: "Super rápido" },
        { value: "30", label: "30 minutos", emoji: "🏃", desc: "Rapidinho" },
        { value: "60", label: "1 hora", emoji: "⏰", desc: "Tenho tempo" },
        { value: "unlimited", label: "Sem limite", emoji: "♾️", desc: "Quanto mais elaborado, melhor" }
      ],
      field: "maxTime"
    }
  ];

  const handleQuizAnswer = (value: string, multiple = false) => {
    const currentQuestion = quizQuestions[quizStep];
    
    if (multiple) {
      const currentValues = quizData[currentQuestion.field as keyof typeof quizData] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setQuizData({ ...quizData, [currentQuestion.field]: newValues });
    } else {
      setQuizData({ ...quizData, [currentQuestion.field]: value });
      
      setTimeout(() => {
        if (quizStep < quizQuestions.length - 1) {
          setQuizStep(quizStep + 1);
        } else {
          setShowApp(true);
        }
      }, 300);
    }
  };

  const nextStep = () => {
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setShowApp(true);
    }
  };

  const progress = ((quizStep + 1) / quizQuestions.length) * 100;

  // Generate recipe function
  const generateRecipe = async () => {
    if (!recipeInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: recipeInput,
          preferences: quizData 
        })
      });
      
      const data = await response.json();
      setGeneratedRecipe(data.recipe);
      setShowRecipePopup(true);
      setSavedRecipes(prev => [data.recipe, ...prev]);
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert('Erro ao gerar receita. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate recipe from ingredients
  const generateFromIngredients = async () => {
    if (!ingredientsInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ingredients: ingredientsInput,
          preferences: quizData 
        })
      });
      
      const data = await response.json();
      setGeneratedRecipe(data.recipe);
      setShowRecipePopup(true);
      setSavedRecipes(prev => [data.recipe, ...prev]);
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert('Erro ao gerar receita. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate drink function
  const generateDrink = async () => {
    if (!drinkInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-drink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: drinkInput,
          preferences: quizData 
        })
      });
      
      const data = await response.json();
      setGeneratedDrink(data.drink);
      setShowDrinkPopup(true);
      setSavedDrinks(prev => [data.drink, ...prev]);
    } catch (error) {
      console.error('Error generating drink:', error);
      alert('Erro ao gerar drink. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Analyze calories from photo
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      
      setIsGenerating(true);
      try {
        const response = await fetch('/api/analyze-calories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        
        const data = await response.json();
        setCalorieAnalysis(data.analysis);
      } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Erro ao analisar imagem. Tente novamente.');
      } finally {
        setIsGenerating(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Scroll to pricing section - CORRIGIDO
  const scrollToPricing = () => {
    // Se estiver na landing page
    const pricingSection = document.getElementById('planos');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Se estiver no app, volta pra landing page
      setShowApp(false);
      setShowQuiz(false);
      setTimeout(() => {
        const section = document.getElementById('planos');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Recipe Popup Component
  const RecipePopup = ({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-2xl font-bold text-black">{recipe.name}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {recipe.image && (
            <img src={recipe.image} alt={recipe.name} className="w-full h-64 object-cover rounded-2xl" />
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gray-100 text-black border-gray-300">
              <Clock className="w-3 h-3 mr-1" />
              {recipe.time} min
            </Badge>
            <Badge className="bg-gray-100 text-black border-gray-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              {recipe.difficulty}
            </Badge>
            <Badge className="bg-gray-100 text-black border-gray-300">
              <Heart className="w-3 h-3 mr-1" />
              {recipe.calories} kcal
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{recipe.protein}g</div>
              <div className="text-xs text-gray-600">Proteínas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{recipe.carbs}g</div>
              <div className="text-xs text-gray-600">Carboidratos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{recipe.fat}g</div>
              <div className="text-xs text-gray-600">Gorduras</div>
            </div>
          </div>
          
          <div>
            <h5 className="font-bold mb-3 text-black text-lg">Ingredientes:</h5>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold mb-3 text-black text-lg">Modo de Preparo:</h5>
            <ol className="space-y-3">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tips.length > 0 && (
            <div>
              <h5 className="font-bold mb-3 text-black text-lg">Dicas:</h5>
              <ul className="space-y-2">
                {recipe.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                    <Sparkles className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Drink Popup Component
  const DrinkPopup = ({ drink, onClose }: { drink: Drink; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-2xl font-bold text-black">{drink.name}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {drink.image && (
            <img src={drink.image} alt={drink.name} className="w-full h-64 object-cover rounded-2xl" />
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gray-100 text-black border-gray-300">
              {drink.type}
            </Badge>
            <Badge className="bg-gray-100 text-black border-gray-300">
              <Heart className="w-3 h-3 mr-1" />
              {drink.calories} kcal
            </Badge>
          </div>
          
          <div>
            <h5 className="font-bold mb-3 text-black text-lg">Ingredientes:</h5>
            <ul className="space-y-2">
              {drink.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold mb-3 text-black text-lg">Modo de Preparo:</h5>
            <ol className="space-y-3">
              {drink.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  // Landing Page
  if (!showQuiz && !showApp) {
    return (
      <div className="min-h-screen bg-white text-black">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
          
          <div className="container mx-auto px-4 py-12 md:py-20 relative">
            <div className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8">
              <Badge className="bg-black text-white border-black px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Powered by IA
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-black">
                Chef Bot
              </h1>
              
              <p className="text-lg md:text-2xl lg:text-3xl text-gray-700 font-light px-4">
                Sua IA pessoal para <span className="text-black font-semibold">cozinhar melhor</span>,
                <br className="hidden md:block" />
                <span className="text-black font-semibold">comer saudável</span> e criar <span className="text-black font-semibold">drinks incríveis</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 md:pt-8">
                <Button 
                  size="lg" 
                  className="bg-black hover:bg-gray-800 text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-full shadow-2xl hover:scale-105 transition-all w-full sm:w-auto"
                  onClick={() => setShowQuiz(true)}
                >
                  <ChefHat className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  Começar Agora - É Grátis
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </div>
              
              <p className="text-xs md:text-sm text-gray-600">
                ✨ Sem cartão de crédito • 1 receita grátis por mês
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-gray-50 border-y border-gray-200 py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-black">50k+</div>
                <div className="text-xs md:text-sm text-gray-600">Receitas Geradas</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-2xl md:text-3xl font-bold text-black">15k+</div>
                <div className="text-xs md:text-sm text-gray-600">Usuários Ativos</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-2xl md:text-3xl font-bold text-black">4.9/5</div>
                <div className="text-xs md:text-sm text-gray-600">Avaliação</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
              Por que o Chef Bot é diferente?
            </h2>
            <p className="text-base md:text-xl text-gray-600 px-4">
              A única plataforma que combina receitas, drinks e nutrição com IA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />,
                title: "IA Inteligente",
                desc: "Gera receitas personalizadas baseadas no que você tem em casa",
                color: "bg-black"
              },
              {
                icon: <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />,
                title: "Contador de Calorias",
                desc: "Tire foto da comida e descubra quantas calorias tem instantaneamente",
                color: "bg-gray-800"
              },
              {
                icon: <Salad className="w-6 h-6 md:w-8 md:h-8 text-white" />,
                title: "Aba Fit Completa",
                desc: "Receitas saudáveis, cardápios e calculadora nutricional",
                color: "bg-gray-700"
              },
              {
                icon: <Wine className="w-6 h-6 md:w-8 md:h-8 text-white" />,
                title: "Drinks Profissionais",
                desc: "Crie drinks incríveis com o que você tem disponível",
                color: "bg-gray-900"
              },
              {
                icon: <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />,
                title: "Cardápio Semanal",
                desc: "7 almoços e 7 jantas com lista de compras automática",
                color: "bg-black"
              },
              {
                icon: <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />,
                title: "Modo Festa",
                desc: "Planeje festas completas com receitas e drinks para todos",
                color: "bg-gray-800"
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-white border-gray-200 p-5 md:p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-3 md:mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-black">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 border-y border-gray-200 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
                Como funciona?
              </h2>
              <p className="text-base md:text-xl text-gray-600">
                Simples, rápido e inteligente
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Conte o que você quer",
                  desc: "Digite o prato, informe ingredientes ou tire foto da comida",
                  icon: <UtensilsCrossed className="w-10 h-10 md:w-12 md:h-12 text-white" />
                },
                {
                  step: "2",
                  title: "IA gera tudo",
                  desc: "Receita completa, calorias, foto realista e dicas extras",
                  icon: <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                },
                {
                  step: "3",
                  title: "Cozinhe e aproveite",
                  desc: "Siga o passo a passo e impressione todo mundo",
                  icon: <ChefHat className="w-10 h-10 md:w-12 md:h-12 text-white" />
                }
              ].map((item, i) => (
                <div key={i} className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black flex items-center justify-center mx-auto">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-black text-black flex items-center justify-center font-bold text-base md:text-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-black">{item.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div id="planos" className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
              Escolha seu plano
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              Comece grátis, upgrade quando quiser
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Free */}
            <Card className="bg-white border-gray-200 p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-black">Grátis</h3>
                  <div className="text-3xl md:text-4xl font-bold text-black">R$ 0</div>
                  <p className="text-sm md:text-base text-gray-600">Para sempre</p>
                </div>
                
                <Button className="w-full bg-gray-100 hover:bg-gray-200 text-black" onClick={() => setShowQuiz(true)}>
                  Começar Grátis
                </Button>
                
                <div className="space-y-2 md:space-y-3">
                  {[
                    "1 receita por mês",
                    "Cálculo de calorias básico",
                    "Fotos geradas por IA",
                    "Suporte por email"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-black flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Premium */}
            <Card className="bg-black text-white border-black p-6 md:p-8 relative hover:scale-105 transition-all shadow-2xl">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black border-0">
                Mais Popular
              </Badge>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Premium</h3>
                  <div className="text-3xl md:text-4xl font-bold">R$ 29,90</div>
                  <p className="text-sm md:text-base text-gray-300">por mês</p>
                </div>
                
                <Button className="w-full bg-white hover:bg-gray-100 text-black">
                  Começar Premium
                </Button>
                
                <div className="space-y-2 md:space-y-3">
                  {[
                    "30 receitas por mês",
                    "Drinks ilimitados",
                    "Aba Fit completa",
                    "Cardápio semanal",
                    "Modo Festa",
                    "Lista de compras inteligente",
                    "Cálculo nutricional avançado",
                    "Fotos premium",
                    "Suporte prioritário"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Lifetime */}
            <Card className="bg-white border-gray-200 p-6 md:p-8 hover:shadow-xl transition-all relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white border-0">
                <Crown className="w-3 h-3 mr-1 inline" />
                Melhor Valor
              </Badge>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-black">Vitalício</h3>
                  <div className="text-3xl md:text-4xl font-bold text-black">R$ 49,90</div>
                  <p className="text-sm md:text-base text-gray-600">Pagamento único</p>
                </div>
                
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Garantir Acesso Vitalício
                </Button>
                
                <div className="space-y-2 md:space-y-3">
                  {[
                    "Receitas ilimitadas para sempre",
                    "Drinks ilimitados",
                    "Aba Fit completa",
                    "Cardápio semanal",
                    "Modo Festa",
                    "Lista de compras inteligente",
                    "Todas as atualizações futuras",
                    "Economia de R$ 308,90/ano",
                    "Suporte VIP"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-black flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 border-y border-gray-200 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
                O que nossos usuários dizem
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Maria Silva",
                  role: "Mãe de 2 filhos",
                  text: "Economizei mais de R$ 400 por mês usando as receitas do Chef Bot. E meus filhos adoram!",
                  rating: 5
                },
                {
                  name: "Carlos Mendes",
                  role: "Personal Trainer",
                  text: "A aba fit é perfeita! Monto cardápios para meus alunos em minutos. Revolucionou meu trabalho.",
                  rating: 5
                },
                {
                  name: "Ana Costa",
                  role: "Estudante",
                  text: "Nunca soube cozinhar. Agora faço pratos incríveis e ainda economizo no delivery!",
                  rating: 5
                }
              ].map((testimonial, i) => (
                <Card key={i} className="bg-white border-gray-200 p-5 md:p-6">
                  <div className="flex gap-1 mb-3 md:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-black text-black" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 italic">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <div className="font-bold text-black text-sm md:text-base">{testimonial.name}</div>
                    <div className="text-xs md:text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="bg-black text-white rounded-2xl md:rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Pronto para transformar sua cozinha?
            </h2>
            <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão cozinhando melhor, economizando e vivendo mais saudável
            </p>
            <Button 
              size="lg" 
              className="bg-white hover:bg-gray-100 text-black px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-full shadow-2xl hover:scale-105 transition-all w-full sm:w-auto"
              onClick={() => setShowQuiz(true)}
            >
              <ChefHat className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              Começar Agora - É Grátis
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 py-6 md:py-8">
          <div className="container mx-auto px-4 text-center text-gray-600 text-xs md:text-sm">
            <p>© 2024 Chef Bot. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Flow
  if (showQuiz && !showApp) {
    const currentQuestion = quizQuestions[quizStep];
    
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-black text-white border-black text-xs md:text-sm">
                Pergunta {quizStep + 1} de {quizQuestions.length}
              </Badge>
              <span className="text-xs md:text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="bg-white border-gray-200 p-6 md:p-8 shadow-xl">
            <div className="space-y-6 md:space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">{currentQuestion.question}</h2>
                <p className="text-sm md:text-base text-gray-600">{currentQuestion.subtitle}</p>
              </div>

              <div className="grid gap-3 md:gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.multiple
                    ? (quizData[currentQuestion.field as keyof typeof quizData] as string[]).includes(option.value)
                    : quizData[currentQuestion.field as keyof typeof quizData] === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleQuizAnswer(option.value, currentQuestion.multiple)}
                      className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all text-left hover:scale-105 ${
                        isSelected
                          ? "bg-black text-white border-black"
                          : "bg-white border-gray-200 hover:border-black"
                      }`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-3xl md:text-4xl">{option.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-base md:text-lg ${isSelected ? "text-white" : "text-black"}`}>{option.label}</div>
                          {option.desc && <div className={`text-xs md:text-sm ${isSelected ? "text-gray-300" : "text-gray-600"}`}>{option.desc}</div>}
                        </div>
                        {isSelected && <Check className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentQuestion.multiple && (
                <div className="flex gap-3 md:gap-4">
                  {quizStep > 0 && (
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 text-black hover:bg-gray-100"
                      onClick={() => setQuizStep(quizStep - 1)}
                    >
                      Voltar
                    </Button>
                  )}
                  <Button
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                    onClick={nextStep}
                    disabled={(quizData[currentQuestion.field as keyof typeof quizData] as string[]).length === 0}
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Popups */}
      {showRecipePopup && generatedRecipe && (
        <RecipePopup recipe={generatedRecipe} onClose={() => setShowRecipePopup(false)} />
      )}
      {showDrinkPopup && generatedDrink && (
        <DrinkPopup drink={generatedDrink} onClose={() => setShowDrinkPopup(false)} />
      )}

      {/* Header */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-black" />
              <span className="text-xl md:text-2xl font-bold text-black">Chef Bot</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Badge className="bg-gray-100 text-black border-gray-300 text-xs md:text-sm">
                <Sparkles className="w-3 h-3 mr-1 inline" />
                Plano Grátis
              </Badge>
              <Button size="sm" className="bg-black hover:bg-gray-800 text-white text-xs md:text-sm" onClick={scrollToPricing}>
                <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-8">
          <TabsList className="bg-gray-100 border border-gray-200 p-1 grid grid-cols-3 md:grid-cols-7 gap-1 md:gap-2 w-full h-auto">
            <TabsTrigger value="generate" className="data-[state=active]:bg-black data-[state=active]:text-white text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 px-2 py-2 md:py-1.5 h-auto">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-[10px] md:text-xs">Gerar</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-black data-[state=active]:text-white text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 px-2 py-2 md:py-1.5 h-auto">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-[10px] md:text-xs">Salvas</span>
            </TabsTrigger>
            <TabsTrigger value="drinks" className="data-[state=active]:bg-black data-[state=active]:text-white text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 px-2 py-2 md:py-1.5 h-auto">
              <Wine className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-[10px] md:text-xs">Drinks</span>
            </TabsTrigger>
            <TabsTrigger value="fit" className="data-[state=active]:bg-black data-[state=active]:text-white text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 px-2 py-2 md:py-1.5 h-auto">
              <Salad className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-[10px] md:text-xs">Fit</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-black data-[state=active]:text-white text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 px-2 py-2 md:py-1.5 h-auto">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-[10px] md:text-xs">Semanal</span>
            </TabsTrigger>
            <TabsTrigger value="party" className="data-[state=active]:bg-black data-[state=active]:text-white text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 px-2 py-2 md:py-1.5 h-auto">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-[10px] md:text-xs">Festa</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="data-[state=active]:bg-black data-[state=active]:text-white text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-1 px-2 py-2 md:py-1.5 h-auto">
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-[10px] md:text-xs">Compras</span>
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4 md:space-y-6">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Generate by Request */}
              <Card className="bg-white border-gray-200 p-4 md:p-6 shadow-lg">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-black">O que você quer cozinhar?</h3>
                      <p className="text-xs md:text-sm text-gray-600">Descreva o prato ou bebida</p>
                    </div>
                  </div>
                  
                  <Textarea 
                    placeholder="Ex: Quero fazer um bolo de chocolate fit com menos de 300 calorias..."
                    className="bg-white border-gray-300 min-h-24 md:min-h-32 text-sm md:text-base"
                    value={recipeInput}
                    onChange={(e) => setRecipeInput(e.target.value)}
                  />
                  
                  <Button 
                    className="w-full bg-black hover:bg-gray-800 text-white text-sm md:text-base"
                    onClick={generateRecipe}
                    disabled={isGenerating || !recipeInput.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Receita
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Generate by Ingredients */}
              <Card className="bg-white border-gray-200 p-4 md:p-6 shadow-lg">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-black">O que você tem em casa?</h3>
                      <p className="text-xs md:text-sm text-gray-600">Liste os ingredientes disponíveis</p>
                    </div>
                  </div>
                  
                  <Textarea 
                    placeholder="Ex: Tenho frango, arroz, brócolis, alho, cebola..."
                    className="bg-white border-gray-300 min-h-24 md:min-h-32 text-sm md:text-base"
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                  />
                  
                  <Button 
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm md:text-base"
                    onClick={generateFromIngredients}
                    disabled={isGenerating || !ingredientsInput.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Ver Receitas Possíveis
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Calorie Counter */}
              <Card className="bg-white border-gray-200 p-4 md:p-6 md:col-span-2 shadow-lg">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-black">Contador de Calorias por Foto</h3>
                      <p className="text-xs md:text-sm text-gray-600">Escolha uma foto da comida e descubra as calorias</p>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl p-6 md:p-12 text-center hover:border-black transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isGenerating}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      {selectedImage ? (
                        <img src={selectedImage} alt="Selected" className="max-h-48 md:max-h-64 mx-auto rounded-lg mb-4" />
                      ) : (
                        <>
                          <Upload className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" />
                          <p className="text-sm md:text-base text-gray-600 mb-2">Clique para escolher foto do dispositivo</p>
                          <p className="text-xs text-gray-500">A IA vai analisar e calcular as calorias automaticamente</p>
                        </>
                      )}
                    </label>
                    {isGenerating && (
                      <div className="mt-4">
                        <Loader2 className="w-6 h-6 md:w-8 md:h-8 mx-auto animate-spin text-black" />
                        <p className="text-xs md:text-sm text-gray-600 mt-2">Analisando imagem...</p>
                      </div>
                    )}
                  </div>

                  {calorieAnalysis && (
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                      <div className="space-y-3 md:space-y-4">
                        <h4 className="text-lg md:text-xl font-bold text-black">Análise Nutricional</h4>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div className="bg-gray-50 p-3 md:p-4 rounded-xl text-center">
                            <div className="text-2xl md:text-3xl font-bold text-black">{calorieAnalysis.totalCalories}</div>
                            <div className="text-xs text-gray-600">Calorias</div>
                          </div>
                          <div className="bg-gray-50 p-3 md:p-4 rounded-xl text-center">
                            <div className="text-2xl md:text-3xl font-bold text-black">{calorieAnalysis.protein}g</div>
                            <div className="text-xs text-gray-600">Proteínas</div>
                          </div>
                          <div className="bg-gray-50 p-3 md:p-4 rounded-xl text-center">
                            <div className="text-2xl md:text-3xl font-bold text-black">{calorieAnalysis.carbs}g</div>
                            <div className="text-xs text-gray-600">Carboidratos</div>
                          </div>
                          <div className="bg-gray-50 p-3 md:p-4 rounded-xl text-center">
                            <div className="text-2xl md:text-3xl font-bold text-black">{calorieAnalysis.fat}g</div>
                            <div className="text-xs text-gray-600">Gorduras</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <h4 className="text-lg md:text-xl font-bold text-black">Alimentos Detectados</h4>
                        <ul className="space-y-2">
                          {calorieAnalysis.foodItems.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                              <Check className="w-4 h-4 text-black flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Saved Recipes Tab */}
          <TabsContent value="saved" className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black">Receitas Salvas</h2>
              <p className="text-sm md:text-base text-gray-600">Todas as suas receitas geradas</p>
            </div>

            {savedRecipes.length === 0 ? (
              <Card className="bg-white border-gray-200 p-8 md:p-12 text-center">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg md:text-xl font-bold mb-2 text-black">Nenhuma receita salva ainda</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">Gere sua primeira receita para vê-la aqui!</p>
                <Button className="bg-black hover:bg-gray-800 text-white" onClick={() => setActiveTab("generate")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Receita
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {savedRecipes.map((recipe, index) => (
                  <Card 
                    key={index} 
                    className="bg-white border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => {
                      setGeneratedRecipe(recipe);
                      setShowRecipePopup(true);
                    }}
                  >
                    {recipe.image && (
                      <img src={recipe.image} alt={recipe.name} className="w-full h-40 md:h-48 object-cover" />
                    )}
                    <div className="p-4 md:p-6 space-y-3">
                      <h4 className="text-lg md:text-xl font-bold text-black">{recipe.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-gray-100 text-black border-gray-300 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {recipe.time} min
                        </Badge>
                        <Badge className="bg-gray-100 text-black border-gray-300 text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          {recipe.calories} kcal
                        </Badge>
                      </div>
                      <Button className="w-full bg-black hover:bg-gray-800 text-white text-sm">
                        Ver Receita Completa
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Drinks Tab */}
          <TabsContent value="drinks" className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black">Drinks Profissionais</h2>
              <p className="text-sm md:text-base text-gray-600">Crie drinks incríveis com o que você tem</p>
            </div>

            <Card className="bg-white border-gray-200 p-4 md:p-6 shadow-lg">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                    <Wine className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-xl font-bold text-black">Gerar Drink Personalizado</h3>
                    <p className="text-xs md:text-sm text-gray-600">Descreva o tipo de drink que você quer</p>
                  </div>
                </div>
                
                <Textarea 
                  placeholder="Ex: Quero um drink cítrico e refrescante com vodka..."
                  className="bg-white border-gray-300 min-h-20 md:min-h-24 text-sm md:text-base"
                  value={drinkInput}
                  onChange={(e) => setDrinkInput(e.target.value)}
                />
                
                <div className="space-y-2">
                  <p className="text-xs md:text-sm font-medium text-gray-700">Sugestões rápidas:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { emoji: "🥃", label: "Forte", color: "bg-red-100 hover:bg-red-500 hover:text-white" },
                      { emoji: "🍸", label: "Suave", color: "bg-blue-100 hover:bg-blue-500 hover:text-white" },
                      { emoji: "🍋", label: "Cítrico", color: "bg-yellow-100 hover:bg-yellow-500 hover:text-white" },
                      { emoji: "🍓", label: "Doce", color: "bg-pink-100 hover:bg-pink-500 hover:text-white" },
                      { emoji: "🧃", label: "Sem Álcool", color: "bg-green-100 hover:bg-green-500 hover:text-white" },
                      { emoji: "📸", label: "Instagramável", color: "bg-purple-100 hover:bg-purple-500 hover:text-white" }
                    ].map((type) => (
                      <Badge 
                        key={type.label} 
                        className={`${type.color} cursor-pointer transition-all border-gray-300 text-xs md:text-sm px-3 py-1.5`}
                        onClick={() => setDrinkInput(prev => prev + ` ${type.label.toLowerCase()}`)}
                      >
                        <span className="mr-1.5">{type.emoji}</span>
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white text-sm md:text-base"
                  onClick={generateDrink}
                  disabled={isGenerating || !drinkInput.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Criar Drink
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Saved Drinks */}
            {savedDrinks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-black">Drinks Salvos</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {savedDrinks.map((drink, index) => (
                    <Card 
                      key={index} 
                      className="bg-white border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => {
                        setGeneratedDrink(drink);
                        setShowDrinkPopup(true);
                      }}
                    >
                      {drink.image && (
                        <img src={drink.image} alt={drink.name} className="w-full h-40 md:h-48 object-cover" />
                      )}
                      <div className="p-4 md:p-6 space-y-3">
                        <h4 className="text-lg md:text-xl font-bold text-black">{drink.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-gray-100 text-black border-gray-300 text-xs">
                            {drink.type}
                          </Badge>
                          <Badge className="bg-gray-100 text-black border-gray-300 text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            {drink.calories} kcal
                          </Badge>
                        </div>
                        <Button className="w-full bg-black hover:bg-gray-800 text-white text-sm">
                          Ver Drink Completo
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Fit Tab */}
          <TabsContent value="fit" className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black">Receitas Fit & Saudáveis</h2>
              <p className="text-sm md:text-base text-gray-600">Emagreça, ganhe massa ou simplesmente coma melhor</p>
            </div>

            <Card className="bg-white border-gray-200 p-4 md:p-6 shadow-lg">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-black">Filtros Especiais</h3>
              <div className="space-y-4">
                {[
                  { title: "🥩 Dietas", items: ["Baixo Carboidrato", "Alta Proteína", "Zero Lactose", "Zero Açúcar"], color: "bg-red-100" },
                  { title: "💪 Treino", items: ["Pré-treino", "Pós-treino"], color: "bg-blue-100" },
                  { title: "🌱 Estilo", items: ["Vegetariana", "Vegana", "Detox"], color: "bg-green-100" },
                  { title: "🔥 Calorias", items: ["Até 250 kcal", "Até 400 kcal"], color: "bg-orange-100" },
                  { title: "🎯 Objetivos", items: ["Perder Peso", "Ganhar Massa"], color: "bg-purple-100" }
                ].map((section) => (
                  <div key={section.title} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((filter) => (
                        <Badge 
                          key={filter} 
                          className={`${section.color} hover:bg-black hover:text-white cursor-pointer transition-all border-gray-300 text-xs md:text-sm px-3 py-1.5`}
                        >
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-black text-white border-black p-4 md:p-6 shadow-lg">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-xl font-bold">Calculadora Fit</h3>
                    <p className="text-xs md:text-sm text-gray-300">Descubra suas necessidades calóricas</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <Input placeholder="Peso (kg)" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm md:text-base" />
                  <Input placeholder="Altura (cm)" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm md:text-base" />
                  <Input placeholder="Idade" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm md:text-base" />
                  <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm md:text-base">
                    <option className="bg-black">Masculino</option>
                    <option className="bg-black">Feminino</option>
                  </select>
                </div>
                
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm md:text-base">
                  <option className="bg-black">Emagrecer</option>
                  <option className="bg-black">Manter Peso</option>
                  <option className="bg-black">Ganhar Massa</option>
                </select>
                
                <Button className="w-full bg-white hover:bg-gray-100 text-black text-sm md:text-base">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Calcular e Gerar Cardápio
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black">Cardápio Semanal</h2>
              <p className="text-sm md:text-base text-gray-600">7 almoços e 7 jantas planejados para você</p>
            </div>

            <Card className="bg-white border-gray-200 p-4 md:p-6 shadow-lg">
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-xl font-bold text-black">Gerar Cardápio Personalizado</h3>
                
                <div className="grid md:grid-cols-3 gap-3 md:gap-4">
                  <select className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-black text-sm md:text-base">
                    <option>Econômico</option>
                    <option>Fit</option>
                    <option>Rápido</option>
                    <option>Gourmet</option>
                  </select>
                  
                  <Input placeholder="Calorias por dia" className="bg-white border-gray-300 text-sm md:text-base" />
                  <Input placeholder="Orçamento (R$)" className="bg-white border-gray-300 text-sm md:text-base" />
                </div>
                
                <Button className="w-full bg-black hover:bg-gray-800 text-white text-sm md:text-base">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Cardápio Semanal
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Party Tab */}
          <TabsContent value="party" className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black">Modo Festa</h2>
              <p className="text-sm md:text-base text-gray-600">Planeje festas completas com receitas e drinks</p>
            </div>

            <Card className="bg-white border-gray-200 p-4 md:p-6 shadow-lg">
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-xl font-bold text-black">Configurar Festa</h3>
                
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <Input placeholder="Tema da festa" className="bg-white border-gray-300 text-sm md:text-base" />
                  <Input placeholder="Número de pessoas" type="number" className="bg-white border-gray-300 text-sm md:text-base" />
                  <Input placeholder="Orçamento (R$)" className="bg-white border-gray-300 text-sm md:text-base" />
                  <select className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-black text-sm md:text-base">
                    <option>Aniversário</option>
                    <option>Churrasco</option>
                    <option>Jantar</option>
                    <option>Coquetel</option>
                  </select>
                </div>
                
                <Button className="w-full bg-black hover:bg-gray-800 text-white text-sm md:text-base">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Cardápio de Festa
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Shopping Tab */}
          <TabsContent value="shopping" className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black">Lista de Compras Inteligente</h2>
              <p className="text-sm md:text-base text-gray-600">Baseada nas suas receitas escolhidas</p>
            </div>

            <Card className="bg-white border-gray-200 p-4 md:p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-black">Sua Lista</h3>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-gray-100 flex-1 md:flex-none text-xs md:text-sm">
                    <DollarSign className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Versão Econômica
                  </Button>
                  <Button size="sm" className="bg-black hover:bg-gray-800 text-white flex-1 md:flex-none text-xs md:text-sm">
                    Exportar Lista
                  </Button>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                {[
                  { category: "🥩 Proteínas", items: ["500g Peito de frango", "300g Carne moída", "200g Salmão"] },
                  { category: "🥦 Vegetais", items: ["2 Brócolis", "3 Cenouras", "1 Alface", "2 Tomates"] },
                  { category: "🍚 Carboidratos", items: ["1kg Arroz integral", "500g Macarrão", "6 Batatas"] },
                  { category: "🥛 Laticínios", items: ["1L Leite desnatado", "200g Queijo minas", "500g Iogurte natural"] }
                ].map((section, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-bold text-xs md:text-sm text-gray-700">{section.category}</h4>
                    {section.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                        <input type="checkbox" className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 flex-shrink-0" />
                        <span className="flex-1 text-black text-sm md:text-base">{item}</span>
                        <Badge className="bg-gray-100 text-black border-gray-300 text-xs">
                          R$ {(Math.random() * 20 + 5).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-black text-white rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm md:text-base">Total Estimado:</span>
                  <span className="text-xl md:text-2xl font-bold">R$ 187,50</span>
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  💡 Dica: Você pode economizar R$ 32,00 com as substituições sugeridas
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}