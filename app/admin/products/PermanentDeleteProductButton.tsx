
"use client";

import { useState } from "react";
import { permanentlyDeleteArchivedProduct } from "./actions";

export default function PermanentDeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [confirmation, setConfirmation] = useState("");

  const canDelete = confirmation === "DELETE";

  return (
    <div className="w-full sm:w-auto">
      <details className="group">
        <summary className="cursor-pointer list-none rounded-full border border-red-200 px-4 py-2 text-center text-sm font-semibold text-red-700 transition-colors hover:bg-red-50">
          Permanently Delete
        </summary>

        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:w-72">
          <p className="text-sm font-bold text-red-900">
            Delete {productName} permanently?
          </p>

          <p className="mt-2 text-xs leading-5 text-red-800">
            This removes the product record and attempts to remove its
            stored image. This action cannot be undone.
          </p>

          <form
            action={permanentlyDeleteArchivedProduct}
            className="mt-4"
          >
            <input
              type="hidden"
              name="id"
              value={productId}
            />

            <label
              htmlFor={`delete-${productId}`}
              className="text-xs font-semibold text-red-900"
            >
              Type DELETE to confirm
            </label>

            <input
              id={`delete-${productId}`}
              type="text"
              value={confirmation}
              onChange={(event) =>
                setConfirmation(event.target.value)
              }
              autoComplete="off"
              className="mt-2 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-[#302324] outline-none focus:border-red-500"
              placeholder="DELETE"
              required
            />

            <button
              type="submit"
              disabled={!canDelete}
              className="mt-3 w-full rounded-full bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm Permanent Deletion
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
