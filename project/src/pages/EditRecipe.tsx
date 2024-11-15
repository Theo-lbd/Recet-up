import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, ChefHat, Save, Plus, Minus, Lock, UtensilsCrossed } from 'lucide-react';
import { useRecipes } from '../contexts/RecipeContext';
import { ImageUpload } from '../components/ui/ImageUpload';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

const CATEGORIES = [
  { value: 'soup', label: 'Soupe' },
  { value: 'starter', label: 'Entrée' },
  { value: 'main', label: 'Plat' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'other', label: 'Autre' }
] as const;

const UNITS = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'c.à.c', label: 'c.à.c' },
  { value: 'c.à.s', label: 'c.à.s' },
  { value: 'tasse', label: 'tasse' },
  { value: 'pièce', label: 'pièce' }
] as const;

export const EditRecipe: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, updateRecipe } = useRecipes();
  const recipe = recipes.find(r => r.id === id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse ingredients from string format to structured format
  const parseIngredients = (ingredients: string[]): Ingredient[] => {
    return ingredients.map((ing, index) => {
      // Match pattern: amount + unit + name
      // Examples: "100g tomates", "2 pièce carottes", "1.5kg pommes"
      const match = ing.match(/^(\d+(?:\.\d+)?)\s*([a-zà-ú.]+)\s+(.+)$/i);
      
      if (match) {
        return {
          id: index.toString(),
          amount: match[1],
          unit: match[2].toLowerCase(),
          name: match[3],
        };
      }
      
      return {
        id: index.toString(),
        amount: '',
        unit: 'pièce',
        name: ing,
      };
    });
  };

  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [prepTime, setPrepTime] = useState(recipe?.prepTime || 15);
  const [cookTime, setCookTime] = useState(recipe?.cookTime || 30);
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [category, setCategory] = useState(recipe?.category || 'main');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe ? parseIngredients(recipe.ingredients) : [{ id: '1', name: '', amount: '', unit: 'pièce' }]
  );
  const [steps, setSteps] = useState<string[]>(recipe?.steps || ['']);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!recipe) {
      navigate('/my-recipes');
    }
  }, [recipe, navigate]);

  if (!recipe) return null;

  const handleImageSelect = (file: File) => {
    setImageFile(file);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: '', amount: '', unit: 'pièce' }
    ]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    setSteps(steps.map((step, i) => i === index ? value : step));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formattedIngredients = ingredients
        .filter(ing => ing.name.trim())
        .map(ing => `${ing.amount}${ing.unit} ${ing.name}`);

      const recipeData = {
        title,
        description,
        prepTime,
        cookTime,
        servings,
        category,
        ingredients: formattedIngredients,
        steps: steps.filter(step => step.trim()),
      };

      await updateRecipe(recipe.id, recipeData);
      navigate(`/recipe/${recipe.id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 pt-16">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier la recette
          </h1>
          <div className="w-6" />
        </div>

        <div className="space-y-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            defaultImage={recipe.imageUrl}
          />

          <input
            type="text"
            placeholder="Nom de la recette"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold border-none focus:ring-0 placeholder-gray-400 dark:bg-gray-800 dark:text-white"
            required
          />
          
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-20 resize-none border rounded-lg p-2 focus:ring-accent focus:border-accent dark:bg-gray-800 dark:text-white"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock size={20} className="text-gray-500" />
              <div>
                <label className="block text-sm text-gray-500">Préparation (min)</label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                  className="w-full border rounded p-1 dark:bg-gray-800 dark:text-white"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ChefHat size={20} className="text-gray-500" />
              <div>
                <label className="block text-sm text-gray-500">Cuisson (min)</label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(Number(e.target.value))}
                  className="w-full border rounded p-1 dark:bg-gray-800 dark:text-white"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={20} className="text-gray-500" />
              <div>
                <label className="block text-sm text-gray-500">Portions</label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full border rounded p-1 dark:bg-gray-800 dark:text-white"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UtensilsCrossed size={16} className="text-gray-400" />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-800 dark:text-white"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Ingrédients</h3>
            <button
              type="button"
              onClick={addIngredient}
              className="text-accent hover:text-accent-dark"
            >
              <Plus size={20} />
            </button>
          </div>
          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Nom de l'ingrédient"
                value={ingredient.name}
                onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                className="flex-1 border rounded p-2 dark:bg-gray-800 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Quantité"
                value={ingredient.amount}
                onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                className="w-20 border rounded p-2 dark:bg-gray-800 dark:text-white"
                required
              />
              <select
                value={ingredient.unit}
                onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                className="w-24 border rounded p-2 dark:bg-gray-800 dark:text-white"
              >
                {UNITS.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIngredient(ingredient.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Steps Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Instructions</h3>
            <button
              type="button"
              onClick={addStep}
              className="text-accent hover:text-accent-dark"
            >
              <Plus size={20} />
            </button>
          </div>
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="mt-2 text-gray-500">{index + 1}.</span>
              <textarea
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder="Décrivez cette étape..."
                className="flex-1 border rounded p-2 min-h-[80px] resize-none dark:bg-gray-800 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus size={20} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`fixed bottom-24 right-4 p-4 rounded-full shadow-lg transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-accent hover:bg-accent-dark'
          } text-white`}
        >
          <Save size={24} />
        </button>
      </form>
    </div>
  );
};