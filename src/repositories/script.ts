import { EntityRepository, Repository } from 'typeorm';
import { Script } from '../entity/Script';
import { User } from '../entity/User';

export interface ScriptParams {
  id?: number;
  title: string;
  innerHtml: string;
  author: User;
}

@EntityRepository(Script)
export class ScriptRepository extends Repository<Script> {
  findBulk() {
    return this.find({
      select: ['id', 'title', 'created', 'updated'],
      relations: ['author'],
    });
  }
  findById(id: number) {
    return this.findOne(id, { relations: ['author'] });
  }
  findByIdOrFail(id: number) {
    return this.findOneOrFail(id, { relations: ['author'] });
  }

  async updateOrFail(params: ScriptParams) {
    const script = await this.findOneOrFail(params.id);
    script.title = params.title;
    script.innerHtml = params.innerHtml;
    script.author = params.author;
    return this.manager.save(script);
  }

  createAndSave(params: ScriptParams) {
    const script = new Script();
    script.title = params.title;
    script.innerHtml = params.innerHtml;
    script.author = params.author;
    return this.manager.save(script);
  }

  deleteById(id: number) {
    return this.delete(id);
  }

  deleteBulk(ids: number[] | string[]) {
    return this.delete(ids);
  }
}