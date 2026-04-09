import { Delete, Get, Post, Put, RestController } from '@nmg8/di';
import { UserService } from './user.service';
import UserRequest from './user.request';

@RestController('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async list() {
    const result = await this.userService.listAll();
    return { data: result.data, error: result.error };
  }

  @Get('/:id')
  async getOne(req: UserRequest.IdParam) {
    const result = await this.userService.findById(req.params.id);
    return { data: result.data, error: result.error };
  }
  
  @Get('/project/:id/:project')
  async getProject(req: UserRequest.ProjectParam) {
    const result = await this.userService.findProjectUserByName(req.params.id, req.params.project);
    return { data: result.data, error: result.error };
  }

  @Post('/')
  async create(req: UserRequest.Create) {
    const result = await this.userService.create(req.body);
    return { data: result.data, error: result.error };
  }

  @Put('/:id')
  async update(req: UserRequest.Update) {
    const values = { ...(req.body as Partial<UserRequest.Create['body']>), id: req.params.id } as UserRequest.Create['body'];
    const result = await this.userService.upsert(values);
    return { data: result.data, error: result.error };
  }

  @Delete('/:id')
  async remove(req: UserRequest.IdParam) {
    const result = await this.userService.delete(req.params.id);
    return { data: result.data, error: result.error };
  }
}

export default UserController;
