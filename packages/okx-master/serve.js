const path = require('path');

const Koa = require('koa');
const static = require('koa-static');

const app = new Koa();
app.keys = ['abc', '123'];
app.use(static(path.resolve(process.cwd(), './static'), { hidden: true }));

const port = 8080;

app.listen(port, () => {
  console.log(`Server is listenning at ${port}`);
});
