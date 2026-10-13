
"use client";

import { useState } from "react";

interface StudentPricingFieldsProps {
  regularPrice?: number;
  studentPrice?: number | null;
  studentAvailable?: boolean;
}

export default function StudentPricingFields({
  regularPrice = 0,
  studentPrice = null,
  studentAvailable = true,
}: StudentPricingFieldsProps) {
  const [price, setPrice] = useState(String(regularPrice));
  const [studentPriceValue, setStudentPriceValue] = useState(
    studentPrice == null ? "" : String(studentPrice)
  );
  const [available, setAvailable] = useState(studentAvailable);

  const regular = Number(price);
  const student = Number(studentPriceValue);

  const validPrices =
    price.trim() !== "" &&
    studentPriceValue.trim() !== "" &&
    Number.isSafeInteger(regular) &&
    Number.isSafeInteger(student) &&
    regular > 0 &&
    student > 0 &&
    student < regular;

  const discount = validPrices
    ? Math.round(((regular - student) / regular) * 100)
    : null;

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#E7DDDD] bg-white px-4 py-3 text-[#302324] outline-none focus:border-[#E1ACB0]";

  return (
    <section className="space-y-5 rounded-2xl border border-[#E7DDDD] p-5">
      <div>
        <h2 className="text-lg font-semibold text-[#302324]">
          Pricing
        </h2>
        <p className="mt-1 text-sm text-[#7A6B6D]">
          Set the regular selling price and the special student price.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="text-sm font-medium text-[#302324]"
          >
            Regular Price (₹)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="1"
            step="1"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="499"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="student_price"
            className="text-sm font-medium text-[#302324]"
          >
            Student Price (₹)
          </label>
          <input
            id="student_price"
            name="student_price"
            type="number"
            min="1"
            step="1"
            max={Number.isSafeInteger(regular) && regular > 1 ? regular - 1 : undefined}
            required
            value={studentPriceValue}
            onChange={(event) => setStudentPriceValue(event.target.value)}
            placeholder="399"
            className={inputClass}
          />
        </div>
      </div>

      
    {validPrices ? (
    <div className="rounded-xl bg-[#FFF1F2] p-4">
        <p className="text-sm font-medium text-[#7A6B6D]">
        Student price preview
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold text-[#302324]">
            ₹{student.toLocaleString("en-IN")}
        </span>
        <span className="text-base text-[#7A6B6D] line-through">
            ₹{regular.toLocaleString("en-IN")}
        </span>
        <span className="rounded-full bg-[#FF4D8D] px-3 py-1 text-xs font-semibold text-white">
            {discount}% OFF
        </span>
        </div>
    </div>
    ) : (
    <p className="rounded-xl bg-[#FFF1F2] p-3 text-sm text-[#7A6B6D]">
        Enter a student price greater than ₹0 and lower than the regular
        price to preview the discount.
    </p>
    )}


      <div className="flex items-start gap-3 border-t border-[#E7DDDD] pt-4">
        <input
          id="student_available"
          name="student_available"
          type="checkbox"
          value="true"
          checked={available}
          onChange={(event) => setAvailable(event.target.checked)}
          className="mt-1 h-4 w-4 accent-[#302324]"
        />

        <div>
          <label
            htmlFor="student_available"
            className="font-medium text-[#302324]"
          >
            Available for student pricing
          </label>
          <p className="mt-1 text-sm text-[#7A6B6D]">
            Turn this off when a product should only be sold at its regular
            price.
          </p>
        </div>
      </div>

      <input
        type="hidden"
        name="student_available"
        value={available ? "true" : "false"}
      />
    </section>
  );
}
