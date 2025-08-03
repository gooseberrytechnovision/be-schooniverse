export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  quantity: number;
  isIndividualProduct: boolean;
  isActive?: boolean;
  availableSizes?: string[];
} 