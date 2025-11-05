import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OpenFoodFactsProduct {
  product?: {
    product_name?: string;
    brands?: string;
    serving_size?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'proteins_100g'?: number;
      'carbohydrates_100g'?: number;
      'fat_100g'?: number;
      'energy-kcal_serving'?: number;
      'proteins_serving'?: number;
      'carbohydrates_serving'?: number;
      'fat_serving'?: number;
    };
    image_url?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (!response.ok) {
      throw new Error('Product not found');
    }

    const data: OpenFoodFactsProduct = await response.json();

    if (!data.product || !data.product.product_name) {
      throw new Error('Product not found');
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    const calories = nutriments['energy-kcal_serving'] ||
                    nutriments['energy-kcal_100g'] || 0;
    const protein = nutriments['proteins_serving'] ||
                   nutriments['proteins_100g'] || 0;
    const carbs = nutriments['carbohydrates_serving'] ||
                 nutriments['carbohydrates_100g'] || 0;
    const fat = nutriments['fat_serving'] ||
               nutriments['fat_100g'] || 0;

    const productInfo = {
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      servingSize: product.serving_size || '100g',
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      imageUrl: product.image_url || '',
    };

    return new Response(
      JSON.stringify(productInfo),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Product not found' }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});