import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Tag } from './tag.entity';
import { ITagsRO } from './tag.interface';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: EntityRepository<Tag>,
  ) {}

  async findAll(): Promise<ITagsRO> {
    const tags = await this.tagRepository.findAll();
    return { tags: tags.map((tag) => tag.tag) };
  }

  async exists(tag: string): Promise<boolean> {
    const count = await this.tagRepository.count({ tag });
    return count > 0;
  }
  
  async create(tag: string): Promise<void> {
    const tagEntity = this.tagRepository.create({ tag });
    await this.tagRepository.persistAndFlush(tagEntity);
  }
}
