
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

function revalidateProductPages(id?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");

  if (id) {
    revalidatePath(`/products/${id}`);
    revalidatePath(`/admin/products/${id}`);
  }
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

  revalidateProductPages();

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

  revalidateProductPages(id);

  redirect("/admin/products");
}

/**
 * Archive a product instead of permanently deleting it.
 * Its order history, database record and storage image are preserved.
 */
export async function archiveProduct(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    throw new Error("Invalid product ID.");
  }

  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id)
    .eq("is_active", true)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Product archiving failed:", error);
    throw new Error("Failed to archive product.");
  }

  if (!data) {
    throw new Error("Product not found or already archived.");
  }

  revalidateProductPages(id);

  redirect("/admin/products");
}

/**
 * Restore a previously archived product.
 */
export async function restoreProduct(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    throw new Error("Invalid product ID.");
  }

  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: true })
    .eq("id", id)
    .eq("is_active", false)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Product restoration failed:", error);
    throw new Error("Failed to restore product.");
  }

  if (!data) {
    throw new Error("Product not found or already active.");
  }

  revalidateProductPages(id);

  redirect("/admin/products");
}

/**
 * Temporary compatibility alias.
 * The existing admin page still imports deleteProduct.
 * It now archives instead of permanently deleting.
 */
export async function deleteProduct(formData: FormData) {
  return archiveProduct(formData);
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

  revalidateProductPages();
}

export async function permanentlyDeleteArchivedProduct(
  formData: FormData
) {
  const id = formData.get("id");

  if (
    typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new Error("Invalid product ID.");
  }

  const supabase = await requireAdmin();

  // The database function checks archive status and order references.
  const { data: imageUrl, error } = await supabase.rpc(
    "admin_delete_archived_product",
    { p_product_id: id }
  );

  if (error) {
    console.error("Permanent product deletion failed:", error);
    throw new Error(
      error.message.includes("referenced by an order")
        ? "This product is linked to an order and cannot be deleted."
        : "Failed to permanently delete product."
    );
  }

  // Remove the corresponding image from Supabase Storage.
  if (typeof imageUrl === "string" && imageUrl.trim()) {
    try {
      const parsedUrl = new URL(imageUrl);

      const bucketPrefix =
        "/storage/v1/object/public/product-images/";

      if (parsedUrl.pathname.startsWith(bucketPrefix)) {
        const encodedPath = parsedUrl.pathname.slice(
          bucketPrefix.length
        );

        const storagePath = decodeURIComponent(encodedPath);

        if (storagePath) {
          const { error: storageError } = await supabase.storage
            .from("product-images")
            .remove([storagePath]);

          if (storageError) {
            console.error(
              "Product was deleted, but its storage image could not be removed:",
              storageError
            );
          }
        }
      } else {
        console.warn(
          "Product was deleted, but its image URL was not a recognized public product-images URL:",
          imageUrl
        );
      }
    } catch (storageError) {
      console.error(
        "Product was deleted, but image cleanup failed:",
        storageError
      );
    }
  }

  revalidateProductPages(id);
  revalidatePath("/admin/products");

  redirect("/admin/products");
}

