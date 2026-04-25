import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMarketplaceItemDto } from './dto/create-marketplace-item.dto';
import { ListMarketplaceItemsDto } from './dto/list-marketplace-items.dto';
import { UpdateMarketplaceItemDto } from './dto/update-marketplace-item.dto';
import {
  MarketplaceItem,
  MarketplaceItemDocument,
} from './schemas/marketplace-item.schema';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(MarketplaceItem.name)
    private readonly marketplaceItemModel: Model<MarketplaceItemDocument>,
  ) {}

  async create(dto: CreateMarketplaceItemDto) {
    const created = await this.marketplaceItemModel.create({
      name: dto.name.trim(),
      price: dto.price,
      description: dto.description?.trim() ?? '',
      images: dto.images ?? [],
      category: dto.category ?? 'other',
      inStock: dto.inStock ?? true,
      productUrl: dto.productUrl.trim(),
    });

    return this.toResponse(created.toObject());
  }

  async findAll(query: ListMarketplaceItemsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (typeof query.inStock === 'boolean') {
      filter.inStock = query.inStock;
    }

    if (query.search?.trim()) {
      const escapedSearch = query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const [items, total] = await Promise.all([
      this.marketplaceItemModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.marketplaceItemModel.countDocuments(filter).exec(),
    ]);

    return {
      data: items.map((item) => this.toResponse(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.findByIdOrThrow(id);
    return this.toResponse(item.toObject());
  }

  async update(id: string, dto: UpdateMarketplaceItemDto) {
    this.validateId(id);

    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }
    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description.trim();
    }
    if (dto.images !== undefined) {
      updateData.images = dto.images;
    }
    if (dto.category !== undefined) {
      updateData.category = dto.category;
    }
    if (dto.inStock !== undefined) {
      updateData.inStock = dto.inStock;
    }
    if (dto.productUrl !== undefined) {
      updateData.productUrl = dto.productUrl.trim();
    }

    const updated = await this.marketplaceItemModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Marketplace item not found.');
    }

    return this.toResponse(updated);
  }

  async remove(id: string) {
    this.validateId(id);

    const deleted = await this.marketplaceItemModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Marketplace item not found.');
    }

    return { deleted: true, id };
  }

  private async findByIdOrThrow(id: string) {
    this.validateId(id);

    const item = await this.marketplaceItemModel.findById(id).exec();

    if (!item) {
      throw new NotFoundException('Marketplace item not found.');
    }

    return item;
  }

  private validateId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid marketplace item id.');
    }
  }

  private toResponse(item: unknown) {
    if (!item || typeof item !== 'object') {
      return {
        id: '',
        name: '',
        price: 0,
        description: '',
        images: [],
        category: 'other',
        inStock: true,
        productUrl: '',
        createdAt: undefined,
        updatedAt: undefined,
      };
    }

    const record = item as Record<string, unknown>;

    return {
      id: this.toSafeId(record._id),
      name: typeof record.name === 'string' ? record.name : '',
      price: typeof record.price === 'number' ? record.price : 0,
      description:
        typeof record.description === 'string' ? record.description : '',
      images: Array.isArray(record.images)
        ? record.images.filter((image): image is string => typeof image === 'string')
        : [],
      category: typeof record.category === 'string' ? record.category : 'other',
      inStock: typeof record.inStock === 'boolean' ? record.inStock : true,
      productUrl: typeof record.productUrl === 'string' ? record.productUrl : '',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toSafeId(value: unknown) {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && 'toString' in value) {
      const toStringFn = value.toString;
      if (typeof toStringFn === 'function') {
        return toStringFn.call(value);
      }
    }

    return '';
  }
}
