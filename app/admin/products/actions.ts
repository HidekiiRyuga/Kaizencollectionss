"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updateProduct(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const price = formData.get("price");
  const category = formData.get("category");
  const description = formData.get("description");
  const image = formData.get("image");

  console.log("UPDATE PRODUCT FORM DATA:", {
    id,
    name,
    price,
    category,
    description,
    image,
  });

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof price !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string"
  ) {
    throw new Error("Invalid product data.");
  }

  const parsedPrice = Number(price);

  if (
    !id ||
    !name.trim() ||
    !category.trim() ||
    !Number.isFinite(parsedPrice)
  ) {
    throw new Error("Please provide valid product information.");
  }

  const supabase = await createClient();

  // Check that the server actually sees the logged-in admin.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("CURRENT USER:", user?.email);

  if (userError || !user) {
    throw new Error("You are not authenticated.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name: name.trim(),
      price: parsedPrice,
      category: category.trim(),
      description: description.trim(),
      image: image.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  console.log("UPDATED PRODUCT:", data);
  console.log("UPDATE ERROR:", error);

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

  const supabase = await createClient();

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

  if (
    !name.trim() ||
    !category.trim() ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice < 0
  ) {
    throw new Error("Please provide valid product information.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("products").insert({
    name: name.trim(),
    price: parsedPrice,
    category: category.trim(),
    description: description.trim(),
    image: image.trim() || null,
  });

  if (error) {
    console.error("Product creation failed:", error);
    throw new Error("Failed to create product.");
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}