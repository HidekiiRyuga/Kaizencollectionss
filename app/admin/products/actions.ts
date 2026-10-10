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

export async function updateProduct(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const price = formData.get("price");
  const category = formData.get("category");
  const description = formData.get("description");
  const image = formData.get("image");
  const stock = formData.get("stock");

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof price !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string" ||
    typeof stock !== "string"
  ) {
    throw new Error("Invalid product data.");
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

  
  if (
    !name.trim() ||
    name.trim().length > 150 ||
    !category.trim() ||
    category.trim().length > 100 ||
    description.length > 5000 ||
    image.length > 2048 ||
    !Number.isSafeInteger(parsedPrice) ||
    parsedPrice < 0 ||
    !Number.isSafeInteger(parsedStock) ||
    parsedStock < 0
  ) {
    throw new Error("Please provide valid product information.");
  }


  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .update({
      name: name.trim(),
      price: parsedPrice,
      category: category.trim(),
      description: description.trim(),
      image: image.trim() || null,
      stock: parsedStock,
})
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  if (!data) {
    throw new Error("No product was updated.");
  }

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

  // Get the product first so we can remove its image from Storage.
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    throw new Error("Product not found.");
  }

  // Delete the database record.
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Product deletion failed:", deleteError);
    throw new Error("Failed to delete product.");
  }

  // Remove the image from Storage if it belongs to our bucket.
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

  revalidatePath("/shop");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}
export async function createProduct(formData: FormData) {
  const name = formData.get("name");
  const price = formData.get("price");
  const category = formData.get("category");
  const description = formData.get("description");
  const image = formData.get("image");
  const stock = formData.get("stock");

  if (
    typeof name !== "string" ||
    typeof price !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string"
  ) {
    throw new Error("Invalid product data.");
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

    if (
      !name.trim() ||
      name.trim().length > 150 ||
      !category.trim() ||
      category.trim().length > 100 ||
      description.length > 5000 ||
      image.length > 2048 ||
      !Number.isSafeInteger(parsedPrice) ||
      parsedPrice < 0 ||
      !Number.isSafeInteger(parsedStock) ||
      parsedStock < 0
    ) {
      throw new Error("Please provide valid product information.");
    }


  const supabase = await requireAdmin();

  const { error } = await supabase.from("products").insert({
    name: name.trim(),
    price: parsedPrice,
    category: category.trim(),
    description: description.trim(),
    image: image.trim() || null,
    stock: parsedStock,
  });

  if (error) {
    console.error("Product creation failed:", error);
    throw new Error("Failed to create product.");
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}