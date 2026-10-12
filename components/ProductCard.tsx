import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  stock,
}: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#E7DDDD]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <div className="mt-4">
        <h3 className="text-base font-medium text-[#302324] sm:text-lg">
          {name}
        </h3>

        <p className="mt-2 text-base font-semibold text-[#302324]">
          ₹{price.toLocaleString("en-IN")}
        </p>

        <p
          className={`mt-2 text-sm font-medium ${
            stock > 0
              ? "text-[#7A6B6D]"
              : "text-red-600"
          }`}
        >
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}