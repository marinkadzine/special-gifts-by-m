"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, UploadedReference } from "@/types/store";
import {
  calculateLineItemTotal,
  calculateVinylPrice,
  formatCurrency,
  getConfiguredBasePrice,
  getOptionValuePrice,
  getRequiredPricedOptionGroups,
  VINYL_PRICE_PER_SQUARE_CM,
} from "@/lib/pricing";
import { uploadReferenceFiles } from "@/lib/supabase";
import { useCart } from "@/components/cart-provider";

export function ProductCustomizer({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customizationNotes, setCustomizationNotes] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<UploadedReference[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [printSize, setPrintSize] = useState(product.printSizes?.[0]?.label ?? "");
  const [vinylWidth, setVinylWidth] = useState(10);
  const [vinylHeight, setVinylHeight] = useState(10);

  const selectedPrint = product.printSizes?.find((option) => option.label === printSize);
  const configuredBasePrice = getConfiguredBasePrice(product, selectedOptions);
  const missingPricedOptionGroup = getRequiredPricedOptionGroups(product).find((groupLabel) => !selectedOptions[groupLabel]);
  const vinylPrice = product.supportsCustomVinyl ? calculateVinylPrice(vinylWidth, vinylHeight) : 0;
  const lineTotal = calculateLineItemTotal(configuredBasePrice, selectedPrint?.price ?? 0, vinylPrice);

  function toggleOption(label: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [label]: value }));
    setUploadStatus("");
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setUploadingFiles(true);
    setUploadStatus(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}...`);

    try {
      const uploaded = await uploadReferenceFiles(files, product.slug);
      setReferenceFiles((current) => [...current, ...uploaded]);
      setUploadStatus(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} attached to this item.`);
      event.target.value = "";
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Could not upload the selected files.");
    } finally {
      setUploadingFiles(false);
    }
  }

  function removeReferenceFile(id: string) {
    setReferenceFiles((current) => current.filter((file) => file.id !== id));
  }

  function handleAddToCart() {
    if (missingPricedOptionGroup) {
      setUploadStatus(`Please choose a ${missingPricedOptionGroup.toLowerCase()} before adding this item.`);
      return;
    }

    if (product.storeSection === "personalized" && !referenceFiles.length) {
      setUploadStatus("Please upload at least one logo, photo, or design reference before adding this item.");
      return;
    }

    const selectedSize = selectedOptions.Size;
    const selectedColor = selectedOptions.Colour;
    const selectedVariant = Object.entries(selectedOptions)
      .filter(([label]) => label !== "Size" && label !== "Colour")
      .map(([label, value]) => `${label}: ${value}`)
      .join(" | ");

    const cartId = `${product.id}-${JSON.stringify(selectedOptions)}-${printSize}-${vinylWidth}-${vinylHeight}-${customizationNotes}-${referenceFiles.map((file) => file.path || file.name).join(",")}`;
    addItem({
      cartId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      storeSection: product.storeSection,
      basePrice: configuredBasePrice,
      totalPrice: lineTotal,
      quantity,
      size: selectedSize,
      color: selectedColor,
      variant: selectedVariant || undefined,
      printSize: selectedPrint?.label,
      customVinyl: product.supportsCustomVinyl
        ? { widthCm: vinylWidth, heightCm: vinylHeight, price: vinylPrice }
        : undefined,
      customizationNotes: customizationNotes.trim(),
      referenceFiles,
    });

    router.push("/checkout");
  }

  return (
    <div className="glass rounded-[2rem] p-6 md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
            {product.storeSection === "personalized" ? "Customize your order" : "Choose your item"}
          </p>
          <h2 className="mt-2 font-display text-4xl text-[var(--berry)]">
            {product.storeSection === "personalized" ? "Build this item" : "Prepare this gift"}
          </h2>
        </div>
        <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-extrabold text-[var(--rose-deep)]">
          {formatCurrency(lineTotal)}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {product.variantOptions?.map((group) => (
          <div key={group.label}>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const active = selectedOptions[group.label] === value;
                const optionPrice = getOptionValuePrice(product, group.label, value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleOption(group.label, value)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "bg-[var(--rose)] text-white"
                        : "border border-[var(--line)] bg-white/80 text-[var(--berry)]"
                    }`}
                  >
                    <span className="block">{value}</span>
                    {typeof optionPrice === "number" ? (
                      <span className={`block text-xs ${active ? "text-white/80" : "text-[var(--mauve)]"}`}>
                        {formatCurrency(optionPrice)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {group.label === "Size" && product.slug === "photo-stone-slab" ? (
              <p className="mt-3 text-sm text-[var(--mauve)]">
                Each stone slab size has its own price. Choose the size above to update the live total.
              </p>
            ) : null}
          </div>
        ))}

        {product.printSizes?.length ? (
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
              Print size
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {product.printSizes.map((option) => {
                const active = printSize === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setPrintSize(option.label)}
                    className={`rounded-[1.2rem] border px-4 py-3 text-left ${
                      active
                        ? "border-[var(--rose)] bg-[var(--blush)]"
                        : "border-[var(--line)] bg-white/80"
                    }`}
                  >
                    <span className="block font-bold text-[var(--berry)]">{option.label}</span>
                    <span className="text-sm text-[var(--mauve)]">
                      {option.price ? `+ ${formatCurrency(option.price)}` : "Included"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {product.supportsCustomVinyl ? (
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
              Vinyl dimensions
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-[var(--berry)]">
                Width (cm)
                <input
                  type="number"
                  min={5}
                  value={vinylWidth}
                  onChange={(event) => setVinylWidth(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <label className="text-sm text-[var(--berry)]">
                Height (cm)
                <input
                  type="number"
                  min={5}
                  value={vinylHeight}
                  onChange={(event) => setVinylHeight(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-[var(--mauve)]">
              Live estimate: {formatCurrency(vinylPrice)} based on {formatCurrency(VINYL_PRICE_PER_SQUARE_CM)} per
              square cm, with a minimum size of 5 cm x 5 cm.
            </p>
          </div>
        ) : null}

        <label className="block text-sm text-[var(--berry)]">
          Custom print instructions
          <textarea
            value={customizationNotes}
            onChange={(event) => setCustomizationNotes(event.target.value)}
            className="mt-2 min-h-32 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            placeholder="Example: Put the name 'Leila' in gold script on the left chest and add the photo on the back."
          />
          <span className="mt-2 block text-xs leading-6 text-[var(--mauve)]">
            Optional: tell Special Gifts by M exactly what should be printed, where it should go, and any colour or style preferences.
          </span>
        </label>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">
            Upload logos, photos, or design references
          </p>
          <p className="mt-2 text-sm font-bold text-[var(--rose-deep)]">
            {product.storeSection === "personalized"
              ? "Required for personalized items."
              : "Optional for ready-made items."}
          </p>
          <label className="mt-3 block text-sm text-[var(--berry)]">
            Choose one or more files
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.svg,.eps"
              onChange={handleFileUpload}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <p className="mt-2 text-xs leading-6 text-[var(--mauve)]">
            Upload as many files as you need so the team knows exactly what to print.
          </p>
          {referenceFiles.length ? (
            <div className="mt-4 space-y-2">
              {referenceFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-2 rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-[var(--berry)]">{file.name}</p>
                    <p className="text-xs text-[var(--mauve)]">
                      {Math.max(1, Math.round(file.size / 1024))} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {file.url ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-[var(--rose-deep)]"
                      >
                        View
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeReferenceFile(file.id)}
                      className="text-sm font-bold text-[var(--rose-deep)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {uploadStatus ? <p className="mt-3 text-sm text-[var(--mauve)]">{uploadStatus}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[var(--berry)]">
            Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-4 text-sm leading-7 text-[var(--berry)]">
            Gift wrapping is now handled at checkout so you can decide exactly which cart items should be wrapped,
            add wrapping instructions, and choose PUDO or Pick Up for wrapped and unwrapped items separately.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={uploadingFiles}
        className="button-primary mt-8 w-full text-center disabled:cursor-not-allowed disabled:opacity-70"
      >
        {uploadingFiles ? "Uploading files..." : "Add to cart and continue"}
      </button>
    </div>
  );
}
