import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentMethod } from '../payments/entities/payment.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { BulkUpdateTransactionStatusDto } from './dto/bulk-update-transaction-status.dto';
import { BulkUpdateOrderStatusDto } from './dto/bulk-update-order-status.dto';
class PlaceOrderDto {
  parentId: number;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  isAddressEdited: boolean;
  deliveryAddress: string;
}

@ApiTags('orders')
@Controller('orders')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('cart')
  //@Roles('parent')
  @ApiOperation({ summary: 'Place order from cart' })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
    type: Order,
  })
  async placeOrderFromCart(
    @Body() placeOrderDto: PlaceOrderDto,
  ): Promise<Order> {
    if (!placeOrderDto.paymentMethod) {
      throw new BadRequestException('Payment method is required');
    }

    return await this.ordersService.placeOrderFromCart(
      placeOrderDto.parentId,
      placeOrderDto.shippingMethod,
      placeOrderDto.paymentMethod,
      placeOrderDto.isAddressEdited,
      placeOrderDto.deliveryAddress,
    );
  }

  @Get()
  //@Roles('admin')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  @ApiResponse({ status: 404, description: 'No orders found' })
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('parent/:parentId')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin', 'parent')
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders by parent ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders for the parent',
  })
  @ApiResponse({ status: 404, description: 'No orders found' })
  findByParentId(@Param('parentId') parentId: string) {
    return this.ordersService.findByParentId(parentId);
  }

  @Patch(':id/status')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin')
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Patch(':id/transaction-status')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin')
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiResponse({
    status: 200,
    description: 'Transaction status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateTransactionStatus(
    @Param('id') id: string,
    @Body() updateTransactionStatusDto: UpdateTransactionStatusDto,
  ) {
    return this.ordersService.updateTransactionStatus(id, updateTransactionStatusDto);
  }

  @Post('bulk-transaction-status')
  @ApiOperation({ summary: 'Bulk update transaction statuses' })
  @ApiResponse({
    status: 200,
    description: 'Transaction statuses updated successfully',
  })
  @ApiResponse({ status: 404, description: 'One or more orders not found' })
  bulkUpdateTransactionStatus(
    @Body() bulkUpdateDto: BulkUpdateTransactionStatusDto,
  ) {
    return this.ordersService.bulkUpdateTransactionStatus(bulkUpdateDto);
  }
    
  @Post('bulk-delivery-status')
  @ApiOperation({ summary: 'Bulk update order statuses' })
  @ApiResponse({
    status: 200,
    description: 'Order statuses updated successfully',
  })
  @ApiResponse({ status: 404, description: 'One or more orders not found' })
  bulkUpdateStatus(
    @Body() bulkUpdateDto: BulkUpdateOrderStatusDto,
  ) {
    return this.ordersService.bulkUpdateStatus(bulkUpdateDto);
  }
}
