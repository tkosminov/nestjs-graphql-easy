import { DeepPartial, FindManyOptions, FindOneOptions, RemoveOptions, Repository, SaveOptions } from 'typeorm';

import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

type id = string | number;

export class ServiceHelper<T> {
  constructor(private readonly repository: Repository<T>) {}

  public async findAll(options: FindManyOptions<T> = {}) {
    return await this.repository.find(options);
  }

  public async findOne(options: FindOneOptions<T> = {}) {
    return await this.repository.findOne(options);
  }

  public async newModel(model: DeepPartial<T>) {
    return this.repository.create(model);
  }

  public async create(model: DeepPartial<T>, options: SaveOptions = {}) {
    const result = this.repository.create(model);

    return await this.save(result, options);
  }

  public async update(id: id, partial: QueryDeepPartialEntity<T>) {
    await this.repository.update(id, partial);
  }

  public async save(model: T, options: SaveOptions = {}) {
    return await this.repository.save(model as DeepPartial<T>, options);
  }

  public async delete(id: id) {
    return await this.repository.delete(id);
  }

  public async remove(models: T[], options: RemoveOptions = {}) {
    return await this.repository.remove(models, options);
  }

  public async release() {
    return await this.repository.queryRunner.release();
  }
}
