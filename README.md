# Koa Decorative

KOA Decorative is a library built to simplify routing.
This library is designed to route traffic through the use of class based decorators instead of
a routing configuration file.

## Installation

Install Koa Decorative and the underlying router that Koa Decorative works with using `npm`:

```bash
npm install --save koa-decorative koa-tree-router
```

This package requires that you enable experimental decorators in your `tsconfig.json` file for your project:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Usage

### index.ts

This is what a basic CRUD controller will look like:

```ts
import { Context } from 'koa';
import { Controller, Pre, Get, Post, Put, Patch, Delete } from 'koa-decorative';

// A simple request specific middleware handled before the list action
const preListAction = async (ctx: Context, next: () => Promise<any>) => {
  console.log('before the list action');
  await next();
  console.log('after the list action');
}

@Controller('/simple')
class SimpleController {
  constructor(private simpleService) { }

  @Get('/')
  @Pre(preListAction)
  list(ctx: Context) {
    const result = this.simpleService.list();

    ctx.body = { data: result };
  }

  @Post('/')
  create(ctx: Context) {
    const result = this.simpleService.create();

    ctx.body = { data: result };
  }

  @Get('/:id')
  detail(ctx: Context) {
    const result = this.simpleService.detail();

    ctx.body = { data: result };
  }

  @Put('/:id')
  @Patch('/:id')
  update() {
    const result = this.simpleService.update();

    ctx.body = { data: result };
  }

  @Delete('/:id')
  delete() {
    const result = this.simpleService.delete();

    ctx.body = { data: result };
  }
}

export default SimpleController;
```

**Note:** All class instances are singletons and not request specific. Take care not to store any request specific information
in the class itself. However it is a great place to inject depencencies for the controller.

Create an `index.ts` in the controllers directory and initialize your controllers:

```ts
import { SimpleService } from '../services';

import SimpleController from './SimpleController';

const simpleService = new SimpleService();

new SimpleController(simpleService);
```

Then just build the routes in your apps main `index.ts` or `app.ts` file:

```ts
import { defaultRouteManager } from 'koa-decorative';

import './controllers';

const app = new Koa();

app.use(defaultRouteManager.build());

app.listen(3000);
```

The routes defined in the controllers will be automatically registered with the route manager.
And you just need to pass the built routes to `app.use` to automatically build the routing for all
of the initialized controllers.
