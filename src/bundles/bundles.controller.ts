import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { Bundle } from './entities/bundle.entity';
import { BundleResponseDto } from './dto/bundle-response.dto';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('bundles')
@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bundle with products' })
  @ApiResponse({ status: 201, description: 'Bundle created successfully', type: Bundle })
  async create(@Body() createBundleDto: CreateBundleDto): Promise<Bundle> {
    return await this.bundlesService.create(createBundleDto);
  }

  @Get()
  async findAll(): Promise<Bundle[]> {
    return await this.bundlesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bundle by ID' })
  @ApiResponse({ status: 200, description: 'Bundle found', type: Bundle })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Bundle> {
    return await this.bundlesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bundle' })
  @ApiResponse({ status: 200, description: 'Bundle updated successfully', type: Bundle })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBundleDto: UpdateBundleDto,
  ): Promise<Bundle> {
    return await this.bundlesService.update(id, updateBundleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bundle' })
  @ApiResponse({ status: 200, description: 'Bundle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.bundlesService.remove(id);
  }

  @Get('search/:usid')
  async searchBundles(
    @Param('usid') usid: string,
    @Query('type') type: string = 'New',
  ): Promise<BundleResponseDto> {
    return await this.bundlesService.searchBundles(usid, type);
  }

  @Get('student/:usid')
  async getBundlesByStudentDetails(
    @Param('usid') usid: string,
  ): Promise<BundleResponseDto> {
    return await this.bundlesService.getBundlesByStudentDetails(usid);
  }
}
