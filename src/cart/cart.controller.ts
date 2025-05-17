import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUsid } from '../decorators/get-usid.decorator';

class AddBundleDto {
  bundleId: number;
  quantity?: number;
  parentId?: number;
  studentId?: number;
}

@ApiTags('cart')
@Controller('cart')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('bundles')
  //@Roles('parent')
  @ApiOperation({ summary: 'Add bundle to cart' })
  @ApiResponse({
    status: 201,
    description: 'Bundle added to cart successfully',
    type: Cart,
  })
  async addBundleToCart(@Body() addBundleDto: AddBundleDto): Promise<Cart> {
    if (!addBundleDto.bundleId) {
      throw new BadRequestException('Bundle ID is required');
    }

    return await this.cartService.addBundleToCart(
      addBundleDto.parentId,
      addBundleDto.bundleId,
      addBundleDto.quantity,
      addBundleDto.studentId,
    );
  }

  @Get(':parentId')
  //@Roles('parent')
  @ApiOperation({ summary: 'Get cart by parent ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the cart for the specified parent',
    type: Cart,
  })
  async getCart(@Param('parentId') parentId: number): Promise<Cart> {
    return await this.cartService.getCart(parentId);
  }

  @Delete(':parentId/bundles/:bundleId')
  //@Roles('parent')
  @ApiOperation({ summary: 'Remove bundle from cart' })
  @ApiResponse({
    status: 200,
    description: 'Bundle removed from cart successfully',
    type: Cart,
  })
  async removeFromCart(
    @Param('parentId') parentId: number,
    @Param('bundleId') bundleId: number,
  ): Promise<Cart> {
    return await this.cartService.removeFromCart(parentId, bundleId);
  }
}
