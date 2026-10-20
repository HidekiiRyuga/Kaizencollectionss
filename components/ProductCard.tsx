
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  stock: number;
}

export default function ProductCard({
  id,
  name,
  price,
  mrp,
  image,
  stock,
}: ProductCardProps) {
  const hasDiscount = mrp > price;

  const discountPercentage = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#E7DDDD]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-[#302324] px-3 py-1.5 text-xs font-semibold text-white">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-base font-medium text-[#302324] sm:text-lg">
          {name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-semibold text-[#302324]">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="text-sm text-[#7A6B6D] line-through">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {hasDiscount && (
          <p className="mt-1 text-xs font-medium text-[#7A6B6D]">
            You save ₹{(mrp - price).toLocaleString("en-IN")}
          </p>
        )}

        <p
          className={`mt-2 text-sm font-medium ${
            stock > 0 ? "text-[#7A6B6D]" : "text-red-600"
          }`}
        >
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}
