import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Equal, ILike, DataSource } from 'typeorm';
import { Bundle, StudentType, Gender } from './entities/bundle.entity';
import { Product } from './entities/product.entity';
import { BundleProduct } from './entities/bundle-product.entity';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { Student } from '../students/entities/student.entity';
import { ClassCategory } from '../class-categories/entities/class-category.entity';
import { StudentType as StudentTypeEnum } from './enums/student-type.enum';
import { BundleResponseDto } from './dto/bundle-response.dto';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order, OrderStatus, TransactionStatus } from '../orders/entities/order.entity';

@Injectable()
export class BundlesService {
  private readonly validStudentTypes = [
    'New',
    'Existing',
    'Boarding',
    'Hostel',
  ];
  private readonly genderMapping = {
    FEMALE: 'Girl',
    MALE: 'Boy',
  };

  // Class mapping for display
  private readonly classMapping = {
    PP2: 'PP2',
    I: '1st',
    II: '2nd',
    III: '3rd',
    IV: '4th',
    V: '5th',
    VI: '6th',
    VII: '7th',
    VIII: '8th',
    IX: '9th',
    X: '10th',
    XI: '11th',
    XII: '12th',
  };

  constructor(
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(BundleProduct)
    private readonly bundleProductRepository: Repository<BundleProduct>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ClassCategory)
    private readonly classCategoryRepository: Repository<ClassCategory>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Bundle[]> {
    return await this.bundleRepository.find({
      relations: ['bundleProducts', 'bundleProducts.product'],
    });
  }

  async findOne(id: number): Promise<Bundle> {
    const bundle = await this.bundleRepository.findOne({
      where: { id },
      relations: ['bundleProducts', 'bundleProducts.product'],
    });

    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${id} not found`);
    }

    return bundle;
  }

  async create(createBundleDto: CreateBundleDto): Promise<Bundle> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if products exist
      const productIds = [...new Set(createBundleDto.products.map(product => product.productId))];
      const products = await this.productRepository.find({
        where: { id: In(productIds) },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products not found');
      }

      // Create bundle
      const bundle = this.bundleRepository.create({
        name: createBundleDto.name,
        gender: createBundleDto.gender,
        studentType: createBundleDto.studentType,
        applicableClasses: createBundleDto.applicableClasses,
        totalPrice: createBundleDto.totalPrice,
        image: createBundleDto.imageUrl,
      });

      const savedBundle = await queryRunner.manager.save(Bundle, bundle);

      // Create bundle products
      const bundleProducts = createBundleDto.products.map(productDto => {
        const bundleProduct = new BundleProduct();
        bundleProduct.bundleId = savedBundle.id;
        bundleProduct.productId = productDto.productId;
        bundleProduct.quantity = productDto.quantity;
        bundleProduct.optional = productDto.optional || false;
        return bundleProduct;
      });

      await queryRunner.manager.save(BundleProduct, bundleProducts);
      await queryRunner.commitTransaction();

      // Return bundle with relationships
      return this.findOne(savedBundle.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create bundle', { cause: error });
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateBundleDto: UpdateBundleDto): Promise<Bundle> {
    const bundle = await this.findOne(id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update bundle details
      if (updateBundleDto.name) bundle.name = updateBundleDto.name;
      if (updateBundleDto.gender) bundle.gender = updateBundleDto.gender;
      if (updateBundleDto.studentType) bundle.studentType = updateBundleDto.studentType;
      if (updateBundleDto.applicableClasses) bundle.applicableClasses = updateBundleDto.applicableClasses;
      if (updateBundleDto.totalPrice) bundle.totalPrice = updateBundleDto.totalPrice;
      if (updateBundleDto.imageUrl) bundle.image = updateBundleDto.imageUrl;

      await queryRunner.manager.save(Bundle, bundle);

      // Update bundle products if included
      if (updateBundleDto.products && updateBundleDto.products.length > 0) {
        // Delete existing bundle products
        await queryRunner.manager.delete(BundleProduct, { bundleId: id });

        // Check if products exist
        const productIds = [...new Set(updateBundleDto.products.map(product => product.productId))];
        const products = await this.productRepository.find({
          where: { id: In(productIds) },
        });

        if (products.length !== productIds.length) {
          throw new BadRequestException('One or more products not found');
        }

        // Create new bundle products
        const bundleProducts = updateBundleDto.products.map(productDto => {
          const bundleProduct = new BundleProduct();
          bundleProduct.bundleId = id;
          bundleProduct.productId = productDto.productId;
          bundleProduct.quantity = productDto.quantity;
          bundleProduct.optional = productDto.optional || false;
          return bundleProduct;
        });

        await queryRunner.manager.save(BundleProduct, bundleProducts);
      }

      await queryRunner.commitTransaction();
      
      // Return updated bundle with relationships
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update bundle', { cause: error });
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const bundle = await this.findOne(id);
    await this.bundleRepository.remove(bundle);
  }

  // Check if a bundle is already purchased by a student
  private async isBundleAlreadyPurchased(bundleId: number, studentId: number): Promise<boolean> {
    // Find order items for this bundle and student
    const orderItems = await this.orderItemRepository.find({
      where: {
        bundleId,
        studentId,
      },
      relations: ['order'],
    });

    // Check if any of these orders have PAID status
    for (const item of orderItems) {
      if (item.order && item.order.transactionStatus === TransactionStatus.PAID) {
        return true;
      }
    }

    return false;
  }

  // Modify the transform method to include the purchase check
  private async transformToResponseDtoWithPurchaseCheck(data: any[], studentId: number): Promise<BundleResponseDto> {
    if (!data || data.length === 0) {
      throw new NotFoundException('No bundle data found');
    }
    
    const bundleId = parseInt(data[0].bundle_id);
    const isAlreadyPurchased = await this.isBundleAlreadyPurchased(bundleId, studentId);

    return {
      bundle_id: bundleId,
      bundle_name: data[0].bundle_name,
      gender: data[0].gender,
      applicable_classes: data[0].applicable_classes,
      class_name: data[0].class_name,
      image: data[0].image,
      bundle_total: parseFloat(data[0].bundle_total),
      isAlreadyPurchased,
      products: data.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        unit_price: parseFloat(item.unit_price),
        quantity: parseInt(item.quantity),
        optional: item.optional,
        size: item.product_size,
        size_chart: item.size_chart,
      })),
    };
  }

  // Update the searchBundles method to use the new transform method
  async searchBundles(usid: string, type: string): Promise<BundleResponseDto> {
    let studentType: string = type;
    if (!this.validStudentTypes.includes(studentType)) {
      throw new BadRequestException(
        `Student type must be one of: ${this.validStudentTypes.join(', ')}`,
      );
    }

    // Find student by USID
    const student = await this.studentRepository.findOne({
      where: { usid },
    });

    if (!student) {
      throw new NotFoundException(`Student with USID ${usid} not found`);
    }

    // Get gender mapping
    const mappedGender = this.genderMapping[student.gender.toUpperCase()];
    if (!mappedGender) {
      throw new BadRequestException(
        `Invalid student gender: ${student.gender}`,
      );
    }

    // Get student's class (take first class if multiple are present)
    const studentClass = student.class.split(',')[0].trim();
    const displayClassName = this.classMapping[studentClass] || studentClass;

    // Create regex pattern for exact class matching
    const classPattern = `(^|,\\s*)${studentClass}($|,)`;

    // Use query builder for search with CASE statement
    const bundles = await this.bundleRepository
      .createQueryBuilder('b')
      .select([
        'b.id as bundle_id',
        'b.name as bundle_name',
        'b.image as image',
        'b.gender as gender',
        'b.applicableClasses as applicable_classes',
        `CASE 
          WHEN b.applicableClasses ~* :classPattern THEN '${displayClassName}'
          ELSE 'Unknown'
        END as class_name`,
        'p.id as product_id',
        'p.name as product_name',
        'p.unitPrice as unit_price',
        'p.size_chart as size_chart',
        'bp.quantity as quantity',
        'bp.optional as optional',
        'b.totalPrice as bundle_total',
      ])
      .innerJoin('b.bundleProducts', 'bp')
      .innerJoin('bp.product', 'p')
      .where('b.gender = :gender', { gender: mappedGender })
      .andWhere('b.studentType = :studentType', { studentType })
      .andWhere('b.applicableClasses ~* :classPattern', { classPattern })
      .getRawMany();

    if (!bundles.length) {
      throw new NotFoundException(
        `No bundles found for student with USID ${usid} and class ${displayClassName}`,
      );
    }
    // Extract all product IDs from the bundles
    const productIds = [...new Set(bundles.map(item => item.product_id))];

    // Fetch sizes for this student and all product IDs
    const sizes = await this.dataSource.getRepository('sizes')
      .createQueryBuilder('s')
      .select(['s.product_id', 's.size'])
      .where('s.student_id = :studentId', { studentId: student.id })
      .andWhere('s.product_id IN (:...productIds)', { productIds })
      .getRawMany();

    // Create a map of productId -> size for easy lookup
    const sizeMap = {};
    sizes.forEach(size => {
      sizeMap[size.product_id] = size.s_size;
    });
    
    // Add sizes to bundle data
    const bundlesWithSizes = bundles.map(item => ({
      ...item,
      product_size: sizeMap[item.product_id] || null
    }));

    return this.transformToResponseDtoWithPurchaseCheck(bundlesWithSizes, student.id);
  }

  async getBundlesByStudentDetails(usid: string): Promise<BundleResponseDto> {
    // Find student by USID
    const student = await this.studentRepository.findOne({
      where: { usid },
    });

    if (!student) {
      throw new NotFoundException(`Student with USID ${usid} not found`);
    }

    const mappedGender = this.genderMapping[student.gender.toUpperCase()];
    if (!mappedGender) {
      throw new BadRequestException(
        `Invalid student gender: ${student.gender}`,
      );
    }

    // Find matching bundles based on student's class and gender
    const bundles = await this.bundleRepository
      .createQueryBuilder('b')
      .select([
        'b.id as bundle_id',
        'b.name as bundle_name',
        'b.image as image',
        'b.gender as gender',
        'b.applicableClasses as applicable_classes',
        'b.applicableClasses as class_name',
        'p.id as product_id',
        'p.name as product_name',
        'p.unitPrice as unit_price',
        'bp.quantity as quantity',
        'bp.optional as optional',
        'b.totalPrice as bundle_total',
      ])
      .innerJoin('b.bundleProducts', 'bp')
      .innerJoin('bp.product', 'p')
      .where('b.gender = :gender', { gender: mappedGender })
      .andWhere('b.applicableClasses = :class', { class: student.class })
      .getRawMany();

    if (!bundles.length) {
      throw new NotFoundException(
        `No bundles found for student with USID ${usid}`,
      );
    }

    // Extract all product IDs from the bundles
    const productIds = [...new Set(bundles.map(item => item.product_id))];
    
    // Fetch sizes for this student and all product IDs
    const sizes = await this.dataSource.getRepository('sizes')
      .createQueryBuilder('s')
      .select(['s.product_id', 's.size'])
      .where('s.student_id = :studentId', { studentId: student.id })
      .andWhere('s.product_id IN (:...productIds)', { productIds })
      .getRawMany();
      
    // Create a map of productId -> size for easy lookup
    const sizeMap = {};
    sizes.forEach(size => {
      sizeMap[size.product_id] = size.s_size;
    });
    
    // Add sizes to bundle data
    const bundlesWithSizes = bundles.map(item => ({
      ...item,
      product_size: sizeMap[item.product_id] || null
    }));

    // Use updated transform method with student ID
    return this.transformToResponseDtoWithPurchaseCheck(bundlesWithSizes, student.id);
  }
}
