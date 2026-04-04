import { CartItem, UploadedReference } from "@/types/store";

function cleanReferenceFile(file: UploadedReference): UploadedReference {
  return {
    id: file.id,
    name: file.name,
    size: file.size,
    type: file.type,
    url: file.url,
    path: file.path,
  };
}

export function itemHasCustomizationDetails(item: CartItem) {
  return Boolean(item.customizationNotes?.trim() || item.referenceFiles?.length);
}

export function getItemsMissingCustomization(items: CartItem[]) {
  return items.filter((item) => !itemHasCustomizationDetails(item));
}

export function serializeOrderItems(items: CartItem[]) {
  return items.map((item) => ({
    ...item,
    customizationNotes: item.customizationNotes?.trim() || undefined,
    referenceFiles: item.referenceFiles?.map(cleanReferenceFile) ?? [],
  }));
}
