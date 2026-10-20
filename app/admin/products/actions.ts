
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    throw new Error("You are not authorized to manage products.");
  }

  return supabase;
}

function validateProductData(data: {
  name: string;
  price: string;
  mrp: string;
  category: string;
  description: string;
  image: string;
  stock: string;
}) {
  const parsedPrice = Number(data.price);
  const parsedMrp = Number(data.mrp);
  const parsedStock = Number(data.stock);

  if (
    !data.name.trim() ||
    data.name.trim().length > 150 ||
    !data.category.trim() ||
    data.category.trim().length > 100 ||
    data.description.length > 5000 ||
    data.image.length > 2048 ||
    !Number.isSafeInteger(parsedPrice) ||
    parsedPrice < 0 ||
    !Number.isSafeInteger(parsedMrp) ||
    parsedMrp < parsedPrice ||
    parsedMrp < 0 ||
    !Number.isSafeInteger(parsedStock) ||
    parsedStock < 0
  ) {
    throw new Error(
      "Please provide valid product information. MRP must be at least the selling price."
    );
  }

  return {
    name: data.name.trim(),
    price: parsedPrice,
    mrp: parsedMrp,
    category: data.category.trim(),
    description: data.description.trim(),
    image: data.image.trim() || null,
    stock: parsedStock,
  };
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name");
  const price = formData.get("price");
  const mrp = formData.get("mrp");
  const category = formData.get("category");
  const description = formData.get("description");
  const image = formData.get("image");
  const stock = formData.get("stock");

  if (
    typeof name !== "string" ||
    typeof price !== "string" ||
    typeof mrp !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string" ||
    typeof stock !== "string"
  ) {
    throw new Error("Invalid product data.");
  }

  const productData = validateProductData({
    name,
    price,
    mrp,
    category,
    description,
    image,
    stock,
  });

  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .insert(productData);

  if (error) {
    console.error("Product creation failed:", error);
    throw new Error("Failed to create product.");
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const price = formData.get("price");
  const mrp = formData.get("mrp");
  const category = formData.get("category");
  const description = formData.get("description");
  const image = formData.get("image");
  const stock = formData.get("stock");

  if (
    typeof id !== "string" ||
    !id ||
    typeof name !== "string" ||
    typeof price !== "string" ||
    typeof mrp !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string" ||
    typeof stock !== "string"
  ) {
    throw new Error("Invalid product data.");
  }

  const productData = validateProductData({
    name,
    price,
    mrp,
    category,
    description,
    image,
    stock,
  });

  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Product update failed:", error);
    throw new Error(`Failed to update product: ${error.message}`);
  }

  if (!data) {
    throw new Error("No product was updated.");
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);

  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    throw new Error("Invalid product ID.");
  }

  const supabase = await requireAdmin();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    throw new Error("Product not found.");
  }

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Product deletion failed:", deleteError);
    throw new Error("Failed to delete product.");
  }

  if (product.image) {
    try {
      const url = new URL(product.image);
      const marker = "/storage/v1/object/public/product-images/";
      const index = url.pathname.indexOf(marker);

      if (index !== -1) {
        const filePath = decodeURIComponent(
          url.pathname.slice(index + marker.length)
        );

        if (filePath) {
          await supabase.storage
            .from("product-images")
            .remove([filePath]);
        }
      }
    } catch (error) {
      console.error("Failed to remove product image:", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}

export async function toggleFeatured(formData: FormData) {
  const id = formData.get("id");
  const featuredValue = formData.get("featured");

  if (
    typeof id !== "string" ||
    !id ||
    (featuredValue !== "true" && featuredValue !== "false")
  ) {
    throw new Error("Invalid featured product data.");
  }

  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({ featured: featuredValue === "true" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update featured status: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}
